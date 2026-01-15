import { api } from "../api/api";
import { setTokens, setUser, getRefreshToken, clearTokens } from "../auth/auth";

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number | string;
    username: string;
    role: string;
    name?: string;
  };
};

export async function loginFieldOfficer(email: string, password: string) {
  
  const { data } = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });

  
  if (data.user?.role !== "FieldOfficer") {
    throw new Error("This app is only for Field Officers.");
  }

  await setTokens(data.accessToken, data.refreshToken);
  await setUser(data.user);

  return data.user;
}

export async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");


  const { data } = await api.post<{ accessToken: string; refreshToken?: string }>(
    "/api/auth/refresh",
    { refreshToken }
  );

  await setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function logout() {
  
  await clearTokens();
}

export async function fetchMe() {
  //  Change endpoint to your backend "me"
  const { data } = await api.get("/api/auth/me");
  return data;
}
