import { useAuth } from '@base/auth/context'
import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'

type Passenger = {
  name: string
  gender: string
  phone: string
  photo_url: string
  created_at: string
  updated_at: string
}

type UsePassenger = {
  passenger?: Passenger
  isLoading: boolean
  error: Error | null
}

const usePassenger = (): UsePassenger => {
  const { session } = useAuth()

  const fetchPassenger = async (): Promise<Passenger> => {
    const { data, error } = await supabase.from('passengers')
      .select()
      .eq('user_id', session?.user?.id)
      .single()

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error } = useQuery(
    ['passenger', session?.user.id],
    fetchPassenger,
    {
      enabled: session?.user.id !== undefined,
      retry: false
    })

  return {
    passenger: data,
    isLoading,
    error: error as Error
  }
}

export default usePassenger
