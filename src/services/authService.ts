import api from "./api";
import type {RegisterResponse, LoginResponse} from "../types/auth.ts";

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post("/auth/login", {email, password});
    return response.data
}

export async function register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await api.post("/auth/register", {name, email, password});
    return response.data
}

export async function joinTenancy(inviteCode: string): Promise<LoginResponse> {
    const response = await api.post(`/tenancy/join/${inviteCode}`);
    return response.data
}