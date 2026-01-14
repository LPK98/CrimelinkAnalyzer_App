export type AuthUser = {
  id: number | string;
  username: string;
  role: string; 
  name?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
