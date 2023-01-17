import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from 'react'
import { AuthContextProps } from '../types'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@base/supabase'

export const AuthContext = createContext<AuthContextProps>({
  session: null,
  isLoading: false
})

export const AuthProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextProps => {
  return useContext(AuthContext)
}
