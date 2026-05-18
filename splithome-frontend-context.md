# SplitHome — Contexto do Backend para o Frontend

## Sobre o projeto

Aplicação de gestão e divisão de despesas para moradores de imóveis compartilhados (repúblicas, apartamentos, etc).

---

## Stack do backend

- Java 21 + Spring Boot
- Spring Security + JWT (token Bearer)
- PostgreSQL
- Rodando localmente em: `http://localhost:8080`

---

## Autenticação

Todas as rotas (exceto `/auth/*`) exigem o header:

```
Authorization: Bearer <token>
```

O token JWT contém as claims:
- `sub` — userId (UUID)
- `email`
- `isOwner` — se o usuário é dono de algum imóvel
- `isMember` — se o usuário é membro de alguma tenancy
- `isHead` — se o usuário é head tenant da tenancy
- `tenancyId` — UUID da tenancy atual do usuário

Token expira em **15 minutos**. Refresh token existe mas ainda não está exposto via endpoint no MVP.

---

## Endpoints

### Auth — `/auth`

#### POST `/auth/register`
Registra um novo usuário.

**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (mínimo 8 caracteres)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "createdAt": "datetime"
}
```

---

#### POST `/auth/login`
Autentica e retorna o JWT.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:** `string` (token JWT puro, não é JSON)

---

### Property — `/property`
> Rotas do proprietário do imóvel. O owner é derivado do token.

#### POST `/property`
Cria um imóvel. Ao criar, um novo JWT é retornado com `isOwner: true`.

**Request:**
```json
{
  "address": "string",
  "description": "string (opcional)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "address": "string",
  "description": "string",
  "available": false,
  "ownerName": "string",
  "ownerEmail": "string",
  "token": "string (novo JWT)"
}
```

---

#### GET `/property`
Lista todos os imóveis do usuário autenticado.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "address": "string",
    "description": "string",
    "available": boolean,
    "ownerName": "string",
    "ownerEmail": "string"
  }
]
```

---

#### DELETE `/property/{id}`
Deleta um imóvel. Só o owner pode deletar.

**Response 204:** sem body

---

#### PATCH `/property/{id}/availability`
Altera a disponibilidade do imóvel (libera para criar tenancy).

**Request:**
```json
{
  "available": boolean
}
```

**Response 200:** mesmo formato de `PropertyResponse` (sem token)

---

### Tenancy — `/tenancy`
> Tenancy = o "contrato de moradia" ativo em um imóvel. Membros entram por invite code.

#### POST `/tenancy`
Cria uma tenancy para um imóvel disponível. O imóvel precisa estar com `available: true`.

**Request:**
```json
{
  "propertyId": "uuid",
  "name": "string"
}
```

**Response 201:**
```json
{
  "tenancyId": "uuid",
  "inviteCode": "string",
  "propertyAddress": "string",
  "active": true,
  "token": "string (novo JWT com isMember e tenancyId)"
}
```

---

#### POST `/tenancy/join/{inviteCode}`
Entra em uma tenancy via invite code. O primeiro a entrar vira `HEAD_TENANT` (`isHead: true` no JWT). Os demais entram como membros normais.

**Response 200:** mesmo formato de `TenancyResponse` (com novo JWT)

---

#### GET `/tenancy/{id}/invite-code`
Resgata o invite code de uma tenancy. ⚠️ Bug conhecido: pode retornar 500 em alguns casos — depurar durante integração.

**Response 200:** mesmo formato de `TenancyResponse`

---

### Expense — `/expense`
> Qualquer membro da tenancy pode criar e listar despesas.

#### POST `/expense`
Cria uma despesa. Os splits são gerados automaticamente para todos os membros ativos da tenancy, com divisão igualitária (share_percentage null no MVP = divisão igual).

**Request:**
```json
{
  "tenancyId": "uuid",
  "description": "string",
  "amount": number
}
```

**Response 201:**
```json
{
  "tenancyId": "uuid",
  "expenseId": "uuid",
  "description": "string",
  "amount": number,
  "paidByName": "string",
  "createdAt": "datetime"
}
```

---

#### GET `/expense?id={tenancyId}`
Lista todas as despesas de uma tenancy. Só membros da tenancy podem acessar.

**Response 200:**
```json
[
  {
    "tenancyId": "uuid",
    "expenseId": "uuid",
    "description": "string",
    "amount": number,
    "paidByName": "string",
    "createdAt": "datetime"
  }
]
```

---

## Fluxo principal do usuário

1. Registra → faz login → recebe JWT
2. Cria um imóvel (`isOwner: true` no novo token)
3. Marca imóvel como disponível (`available: true`)
4. Cria uma tenancy para o imóvel → recebe invite code + novo token (`isMember: true`, `tenancyId` preenchido)
5. Compartilha o invite code com os moradores
6. Moradores entram via `/tenancy/join/{inviteCode}` → primeiro vira HEAD, demais são membros
7. Qualquer membro lança despesas → splits gerados automaticamente

---

## Regras de negócio importantes

- O **owner do imóvel** pode ser externo — não precisa ser morador da tenancy
- A tenancy nunca fica sem HEAD: se o head sair, o sistema designa outro automaticamente
- `createTenancy` NÃO adiciona o criador como membro — ele precisa entrar via invite code também
- Divisão das despesas é **igualitária** no MVP (percentual calculado no frontend ou exibido como igual)
- Toda vez que uma ação muda o papel do usuário (criar property, criar tenancy, entrar na tenancy), o backend retorna um **novo JWT** — o frontend deve substituir o token armazenado

---

## Erros comuns

| Status | Situação |
|--------|----------|
| 400 | Dados inválidos (validação Bean Validation) |
| 403 | Usuário não é membro da tenancy |
| 404 | Tenancy ou Property não encontrada |
| 409 | Imóvel indisponível / tenancy já existe / usuário já é membro |
| 500 | Bug conhecido no `rescueInviteCode` — depurar na integração |
