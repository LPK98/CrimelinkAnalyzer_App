import { api } from "../api/api";
import { clearTokens } from "../auth/auth";

import type { AuthUser } from "../types/AuthContextDefinition";
import {
  BackendLoginResponse,
  BackendRefreshResponse,
  BackendUserDTO,
  LoginResponse,
  RefreshResponse,
} from "../types/login";

// export type LoginResponse = {
//   accessToken: string;
//   refreshToken?: string;
//   user: {
//     id: number | string;
//     username: string;
//     role: string;
//     name?: string;
//   };
// };   //REMOVE or FIX: in types/login.ts

export async function loginFieldOfficer(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<BackendLoginResponse>("/api/auth/login", {
    email,
    password,
  });

  if (!data.success) {
    throw new Error(data.message || "Login failed");
  }

  const user = mapBackendUserToAuthUser(data.user);

  if (user.role !== "FieldOfficer") {
    throw new Error("This app is only for Field Officers.");
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user,
  };
}

export async function refreshSession(
  refreshToken: string,
): Promise<RefreshResponse> {
  const { data } = await api.post<BackendRefreshResponse>("/api/auth/refresh", {
    refreshToken,
  });

  if (!data.success) {
    throw new Error(data.message || "Refresh failed");
  }

  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // ignore network/auth errors on logout
  }

  await clearTokens();
}

export async function fetchMe() {
  //  Change endpoint to your backend "me"
  const { data } = await api.get<BackendUserDTO>("/api/auth/me");
  return mapBackendUserToAuthUser((data as any)?.user ?? data);
}

function mapBackendUserToAuthUser(user: BackendUserDTO): AuthUser {
  return {
    id: user.userId,
    username: user.email,
    role: user.role,
    name: user.name,
  };
}
