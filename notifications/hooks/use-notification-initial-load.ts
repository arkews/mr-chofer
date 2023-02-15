import { useAuth } from '@base/auth/context'
import useNotifications, { UserNotification } from '@base/notifications'
import { supabase } from '@base/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import * as Sentry from 'sentry-expo'

type UserType = 'passenger' | 'driver'

const useNotificationInitialLoad = (
  userType: UserType,
  saveNotification: boolean
) => {
  const { token } = useNotifications()
  const { session } = useAuth()
  const queryClient = useQueryClient()

  void queryClient.invalidateQueries([
    'checkIfTokenExists',
    session?.user.id,
    userType
  ])

  const checkIfTokenExists = async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('token')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .single()

    if (error !== null) {
      const rawError = new Error(error.message)
      Sentry.Native.captureException(rawError)
    }

    return data
  }

  const { data, isLoading } = useQuery(
    ['checkIfTokenExists', session?.user.id, userType],
    async () => await checkIfTokenExists(session?.user.id ?? ''),
    {
      enabled: session !== null && session !== undefined
    }
  )

  const performSetPassengerToken = async (data: UserNotification) => {
    const { error } = await supabase.from('notifications').insert(data)

    if (error !== null) {
      const rawError = new Error(error.message)
      Sentry.Native.captureException(rawError)
    }
  }

  const { mutate, isLoading: isPerformSetPassengerToken } = useMutation(
    performSetPassengerToken
  )

  useEffect(() => {
    if (isLoading) return

    if (data !== null) return

    if (!saveNotification) return

    if (session === null) return

    if (token === undefined) return

    if (token.trim() === '' || token.length === 0) return

    mutate({
      token,
      user_id: session.user.id,
      user_type: userType
    })
  }, [token, session, saveNotification, data, isLoading])

  return { isPerformSetPassengerToken }
}

export default useNotificationInitialLoad
