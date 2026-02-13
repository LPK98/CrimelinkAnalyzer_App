import type { AuthUser } from "./AuthContextDefinition";

export type BackendUserDTO = {
  userId: number;
  name: string;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  role: string;
  badgeNo?: string | null;
  email: string;
  status?: string | null;
};

export type BackendLoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: BackendUserDTO;
};

export type BackendRefreshResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};
