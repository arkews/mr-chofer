import { useAuth } from '@base/auth/context'
import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'
import * as Sentry from 'sentry-expo'

export type ConfigurationKey = {
  CHECK_DRIVER_BALANCE: 'CHECK_DRIVER_BALANCE'
  IS_MALE_PASSENGER_ACTIVE: 'IS_MALE_PASSENGER_ACTIVE'
  MINIMUM_MALE_FARE: 'MINIMUM_MALE_FARE'
  MINIMUM_FEMALE_FARE: 'MINIMUM_FEMALE_FARE'
}

export type Configuration = {
  key: ConfigurationKey[keyof ConfigurationKey]
  value: string
}

export type UseConfig = {
  config?: Configuration | null
  isLoading: boolean
  error: Error | null
}

export const useConfig = (key: ConfigurationKey[keyof ConfigurationKey]): UseConfig => {
  const { session } = useAuth()

  const loadConfig = async (): Promise<Configuration | null> => {
    const { data, error } = await supabase
      .from('configuration')
      .select('key, value')
      .eq('key', key)
      .single()

    if (error !== null) {
      const rawError = new Error(error.message)
      Sentry.Native.captureException(rawError, {
        contexts: {
          error
        }
      })
      throw rawError
    }

    return data
  }

  const { data, isLoading, error } = useQuery(
    ['config', key],
    loadConfig,
    {
      enabled: session?.user?.id !== undefined,
      retry: false
    }
  )

  return {
    config: data,
    isLoading,
    error: error as Error
  }
}
