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
  any: AnyRequest
}

export type AnyRequest = {
  unregisteredPaymentRQ: UnregisteredPaymentRQ
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

type AnyResponse = {
  unregisteredPaymentRS: UnregisteredPaymentRS
}

export type ResponseBody = {
  any: AnyResponse
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
  transaction_id?: string

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
    return new Response(
      JSON.stringify({ error: authTokenResponse.statusText }),
      {
        status: authTokenResponse.status
      }
    )
  }

  const { access_token: accessToken } =
    (await authTokenResponse.json()) as AuthToken
  const body = (await req.json()) as NequiPayment

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: messageID, error: meessageIdError } = await supabase
    .from('configuration')
    .select('value')
    .eq('key', 'NEQUI_MESSAGE_ID')
    .single()

  if (meessageIdError !== null) {
    return new Response(JSON.stringify({ error: meessageIdError }), {
      status: 500
    })
  }

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
            MessageID: messageID,
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
    return new Response(JSON.stringify({ error: paymentResponse.statusText }), {
      status: paymentResponse.status
    })
  }

  const paymentBody =
    (await paymentResponse.json()) as PushNotificationResponse

  const isSuccessful =
    paymentBody.ResponseMessage.ResponseHeader.Status.StatusCode === '0' &&
    paymentBody.ResponseMessage.ResponseHeader.Status.StatusDesc === 'SUCCESS'

  if (!isSuccessful) {
    return new Response(
      JSON.stringify({
        error: paymentBody.ResponseMessage.ResponseHeader.Status.StatusDesc
      }),
      {
        status: 500
      }
    )
  }

  const payment = {
    driver_id: body.driver_id,
    payment_method: 'nequi',
    amount: Number(body.value),
    transaction_id:
      paymentBody.ResponseMessage.ResponseBody.any.unregisteredPaymentRS
        .transactionId
  } satisfies Payment

  const { error, data } = await supabase
    .from('payments')
    .insert(payment)
    .select()

  if (error !== null) {
    return new Response(JSON.stringify({ error }), {
      status: 500
    })
  }

  await supabase
    .from('configuration')
    .update({ value: (Number(messageID) + 1).toString() })
    .eq('key', 'NEQUI_MESSAGE_ID')

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
