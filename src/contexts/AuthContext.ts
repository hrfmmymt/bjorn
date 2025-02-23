import { createContext } from 'react'
import { User } from '@supabase/supabase-js'

export type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  signOut: async () => {}
})
