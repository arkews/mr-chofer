import { makeRedirectUri, startAsync } from 'expo-auth-session'
import { supabase, supabaseUrl } from '../supabase'

export const googleSignIn = async () => {
  const redirectUrl = makeRedirectUri({
    path: 'auth/callback',
  })

  const authResponse = await startAsync({
    authUrl: `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`,
    returnUrl: redirectUrl,
  })

  if (authResponse.type === 'success') {
    await supabase.auth.setSession({
      access_token: authResponse.params.access_token,
      refresh_token: authResponse.params.refresh_token,
    })

    console.log(authResponse)
  }
}
