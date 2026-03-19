export type AuthUser = {
  id: number | string;
  username: string;
  role: string;
  name?: string;
  badgeNo?: string | null;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
    biometricEnabled?: boolean,
  ) => Promise<{ accessToken: string; refreshToken?: string; user: AuthUser }>;
  loginWithRefreshToken: (refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
};
