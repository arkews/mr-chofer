import { supabase } from '../supabase'
import { SignInWithPassword } from './types'
import { AuthResponse } from '@supabase/supabase-js'

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut()
}

export const signInWithPassword = async (credentials: SignInWithPassword): Promise<AuthResponse> => {
  const response = await supabase.auth.signInWithPassword(credentials)

  if (response.error !== null) {
    throw response.error
  }

  return response
}
