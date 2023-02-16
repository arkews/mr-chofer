import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.33.1'

export type AuthToken = {
  access_token: string
  token_type: string
  expires_in: number
}

export type PushNotificationRequest = {
  RequestMessage: RequestMessage
}

export type RequestMessage = {
  RequestHeader: RequestHeader
  RequestBody: RequestBody
}

export type RequestBody = {
  any: Any
}

export type Any =
  | {
    unregisteredPaymentRQ: UnregisteredPaymentRQ
  }
  | {
    unregisteredPaymentRS: UnregisteredPaymentRS
  }
export type UnregisteredPaymentRQ = {
  phoneNumber: string
  code: string
  value: string
}

export type RequestHeader = {
  Channel: string
  RequestDate: Date
  MessageID: string
  ClientID: string
  Destination: Destination
}

export type Destination = {
  ServiceName: string
  ServiceOperation: string
  ServiceRegion: string
  ServiceVersion: string
}

export type PushNotificationResponse = {
  ResponseMessage: ResponseMessage
}

export type ResponseMessage = {
  ResponseHeader: ResponseHeader
  ResponseBody: ResponseBody
}

export type ResponseBody = {
  any: Any
}

export type UnregisteredPaymentRS = {
  transactionId: string
}

export type ResponseHeader = {
  Channel: string
  ResponseDate: Date
  Status: Status
  MessageID: string
  ClientID: string
  Destination: Destination
}

export type Status = {
  StatusCode: string
  StatusDesc: string
}

export type NequiPayment = Omit<UnregisteredPaymentRQ, 'code'> & {
  driver_id: string
}

export type Payment = {
  driver_id: string
  payment_method: string
  amount: number
  status?: string

  created_at?: Date
  updated_at?: Date
}

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const API_KEY = Deno.env.get('NEQUI_API_KEY') ?? ''
  const OAUTH_URL = Deno.env.get('NEQUI_OAUTH_URL') ?? ''
  const API_URL = Deno.env.get('NEQUI_API_URL') ?? ''
  const AUTHORIZATION = Deno.env.get('NEQUI_AUTHORIZATION') ?? ''
  const STORE_CODE = Deno.env.get('NEQUI_STORE_CODE') ?? ''

  const authTokenResponse = await fetch(
    `${OAUTH_URL as string}/oauth2/token?grant_type=client_credentials`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${AUTHORIZATION as string}`
      }
    }
  )

  if (!authTokenResponse.ok) {
    return new Response(undefined, {
      status: authTokenResponse.status
    })
  }

  const { access_token: accessToken } =
    (await authTokenResponse.json()) as AuthToken
  const body = (await req.json()) as NequiPayment

  const paymentResponse = await fetch(
    `${
      API_URL as string
    }/payments/v2/-services-paymentservice-unregisteredpayment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        RequestMessage: {
          RequestHeader: {
            Channel: 'PNP04-C001',
            RequestDate: new Date(),
            MessageID: '1234567890',
            ClientID: '12345',
            Destination: {
              ServiceName: 'PaymentsService',
              ServiceOperation: 'unregisteredPayment',
              ServiceRegion: 'C001',
              ServiceVersion: '1.2.0'
            }
          },
          RequestBody: {
            any: {
              unregisteredPaymentRQ: {
                phoneNumber: body.phoneNumber,
                value: body.value,
                code: STORE_CODE
              }
            }
          }
        }
      } satisfies PushNotificationRequest)
    }
  )

  if (!paymentResponse.ok) {
    return new Response(undefined, {
      status: paymentResponse.status
    })
  }

  const paymentBody =
    (await paymentResponse.json()) as PushNotificationResponse

  if (paymentBody.ResponseMessage.ResponseHeader.Status.StatusCode !== '') {
    return new Response(undefined, {
      status: 500
    })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const payment = {
    driver_id: body.driver_id,
    payment_method: 'nequi',
    amount: Number(body.value)
  } satisfies Payment

  const { error, data } = await supabase
    .from('payments')
    .insert(payment)
    .select()

  if (error !== null) {
    return new Response(JSON.stringify(error), {
      status: 500
    })
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
