import { createContext, useContext, type ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: null | { id: string; email: string }
  login: (_email: string, _password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  user: null,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    isAuthenticated: true,
    user: { id: 'owner', email: 'owner@parlour.com' },
    login: async () => {},
    logout: async () => {},
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
