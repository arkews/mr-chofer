import { useQuery } from '@tanstack/react-query'
import { supabase } from '@base/supabase'
import { useAuth } from '@base/auth/context'

type Driver = {
  id: string
  name: string
  gender: string
  phone: string
  photo_url: string
  created_at: string
  updated_at: string
}

type UseDriver = {
  driver?: Driver | null
  isLoading: boolean
  error: Error | null
}

const useDriver = (): UseDriver => {
  const { session } = useAuth()

  const loadDriver = async (): Promise<Driver | null> => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', session?.user?.id)
      .single()

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error } = useQuery(
    ['driver', session?.user?.id],
    loadDriver,
    {
      enabled: session?.user?.id !== undefined,
      retry: false
    }
  )

  return {
    driver: data,
    isLoading,
    error: error as Error
  }
}

export default useDriver
