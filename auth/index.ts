import { supabase } from '@base/supabase'
import { SignInWithPassword } from './types'
import { AuthResponse } from '@supabase/supabase-js'
import Sentry from '@sentry/react-native'

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut()
}

export const signInWithPassword = async (credentials: SignInWithPassword): Promise<AuthResponse> => {
  const response = await supabase.auth.signInWithPassword(credentials)

  if (response.error !== null) {
    Sentry.captureException(response.error, {
      contexts: {
        user: {
          email: credentials.email
        }
      }
    })
    throw response.error
  }

  return response
}

export const signUpWithPassword = async (credentials: SignInWithPassword): Promise<AuthResponse> => {
  const response = await supabase.auth.signUp(credentials)

  if (response.error !== null) {
    Sentry.captureException(response.error, {
      contexts: {
        user: {
          email: credentials.email
        }
      }
    })
    throw response.error
  }

  return response
}
