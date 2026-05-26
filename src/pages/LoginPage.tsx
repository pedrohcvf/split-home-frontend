import { useState } from "react";
import { IconHome2, IconKey, IconArrowLeft } from "@tabler/icons-react";
import loginBg from "../assets/login-bg.jpg";
import { login, register, joinTenancy } from "../services/authService.ts";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [screen, setScreen] = useState("login");
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  function switchScreen(s: string) {
    setScreen(s);
    setError(null);
  }

  async function handleLogin() {
    setError(null);
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    try {
      const token = await login(email, password);
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Email ou senha incorretos.");
      } else {
        setError("Erro ao entrar. Tente novamente.");
      }
    }
  }

  async function handleRegister() {
    setError(null);
    if (!registerName || !registerEmail || !registerPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (!registerEmail.includes("@") || !registerEmail.includes(".")) {
      setError("Insira um email válido.");
      return;
    }
    try {
      await register(registerName, registerEmail, registerPassword);
      const token = await login(registerEmail, registerPassword);
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Este email já está cadastrado.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    }
  }

  async function handleJoin() {
    setError(null);
    if (!inviteCode.trim()) {
      setError("Insira o código de convite.");
      return;
    }
    try {
      const token = await joinTenancy(inviteCode.trim());
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Código de convite inválido.");
      } else {
        setError("Erro ao entrar na split. Tente novamente.");
      }
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* IMAGEM */}
      <div className="flex-1 relative overflow-hidden">
        <img
          src={loginBg}
          alt="Sala de estar aconchegante"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1B4332] opacity-60" />
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-white w-[420px] flex-shrink-0 flex flex-col justify-center p-10">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 bg-[#2D6A4F] rounded-xl flex items-center justify-center">
              <IconHome2 size={20} color="white" />
            </div>
            <span className="text-xl font-medium text-gray-900">
              Split<span className="text-[#2D6A4F]">Home</span>
            </span>
          </div>
          <span className="text-sm text-gray-500">Bem-vindo de volta 👋</span>
        </div>

        {screen !== "join" && (
          <div className="flex bg-[#F7F9F7] rounded-xl p-1 mb-6">
            <button
              onClick={() => switchScreen("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                screen === "login"
                  ? "bg-white text-[#2D6A4F] border border-[#D8F3DC]"
                  : "text-gray-500"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => switchScreen("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                screen === "register"
                  ? "bg-white text-[#2D6A4F] border border-[#D8F3DC]"
                  : "text-gray-500"
              }`}
            >
              Criar conta
            </button>
          </div>
        )}

        {screen === "login" && (
          <div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className="w-full bg-[#F7F9F7] border border-[#c8e6c9] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F]" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Senha</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-[#F7F9F7] border border-[#c8e6c9] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F]" />
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button onClick={handleLogin} className="w-full bg-[#2D6A4F] text-white rounded-xl py-2.5 text-sm font-medium cursor-pointer hover:bg-[#1B4332] transition-all mb-4">
              Entrar
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-[#D8F3DC]"></div>
              <span className="text-xs text-gray-500">ou</span>
              <div className="flex-1 h-px bg-[#D8F3DC]"></div>
            </div>
            <button
              onClick={() => switchScreen("join")}
              className="w-full flex items-center gap-3 bg-[#F7F9F7] border border-[#D8F3DC] rounded-xl px-3 py-2.5 cursor-pointer hover:border-[#2D6A4F] transition-all"
            >
              <IconKey size={20} color="#2D6A4F" />
              <div className="text-left">
                <span className="block text-sm font-medium text-[#2D6A4F]">Entrar numa split</span>
                <span className="block text-xs text-gray-500">Tenho um código de convite</span>
              </div>
            </button>
          </div>
        )}

        {screen === "register" && (
          <div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome</label>
              <input value={registerName} onChange={(e) => setRegisterName(e.target.value)} type="text" placeholder="Seu nome completo" className="w-full bg-[#F7F9F7] border border-[#c8e6c9] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F]" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <input value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} type="email" placeholder="seu@email.com" className="w-full bg-[#F7F9F7] border border-[#c8e6c9] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F]" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Senha</label>
              <input value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} type="password" placeholder="mínimo 8 caracteres" className="w-full bg-[#F7F9F7] border border-[#c8e6c9] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F]" />
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button onClick={handleRegister} className="w-full bg-[#2D6A4F] text-white rounded-xl py-2.5 text-sm font-medium cursor-pointer hover:bg-[#1B4332] transition-all">
              Criar conta
            </button>
          </div>
        )}

        {screen === "join" && (
          <div>
            <button
              onClick={() => switchScreen("login")}
              className="flex items-center gap-1 text-[#2D6A4F] text-sm cursor-pointer mb-4 bg-transparent border-none"
            >
              <IconArrowLeft size={16} />
              Voltar
            </button>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Entrar numa split</h2>
            <p className="text-sm text-gray-500 mb-5">Cole o código que seu colega te enviou</p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Código de convite</label>
              <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} type="text" placeholder="ex: AB12-XY99" className="w-full bg-[#F7F9F7] border border-[#c8e6c9] rounded-xl px-3 py-2.5 text-sm text-center tracking-widest outline-none focus:border-[#2D6A4F] font-medium" />
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button onClick={handleJoin} className="w-full bg-[#2D6A4F] text-white rounded-xl py-2.5 text-sm font-medium cursor-pointer hover:bg-[#1B4332] transition-all">
              Entrar na split
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default LoginPage;
