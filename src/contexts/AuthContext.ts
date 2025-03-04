import type { User } from "@supabase/supabase-js";
import { createContext } from "react";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});
