import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.33.1'

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  const value = await req.json()

  const { data, error } = await supabase
    .from('rides')
    .insert(value)
    .select('id')

  if (error !== null) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  const { data: deviceTokens, error: deviceTokensError } = await supabase
    .from('notifications')
    .select('token')
    .eq('user_type', 'driver')

  if (deviceTokensError === null && deviceTokens.length > 0) {
    // Send a notification to the driver, with expo push notifications
    // https://docs.expo.io/push-notifications/sending-notifications/

    const expoPushTokens = deviceTokens.map((deviceToken) => {
      return deviceToken.token
    })

    console.info('Sending notification to', expoPushTokens)

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: expoPushTokens,
        title: 'Hay una nueva solicitud de viaje'
      })
    })

    console.info('Expo response', await expoResponse.json())
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
})
