import { useAuth } from '@base/auth/context'
import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'

export enum DriverStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
  blocked = 'blocked'
}

type Driver = {
  id: string
  name: string
  gender: string
  phone: string
  photo_url: string
  balance: number

  created_at: string
  updated_at: string

  status: DriverStatus
  rating: number

  contract_url: string | null
  notary_power_url: string | null

  active: boolean
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
