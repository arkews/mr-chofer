import { Session } from '@supabase/supabase-js'

export type AuthContextProps = {
  session: Session | null
  isLoading: boolean
}

export type SignInWithPassword = {
  email: string
  password: string
}
