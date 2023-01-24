import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'
import { Ride } from '@base/rides/types'

type UseRequestedRides = {
  rides?: Ride[]
  isLoading: boolean
  error: Error | null
}

const useRequestedRides = (): UseRequestedRides => {
  const fetchRides = async (): Promise<Ride[]> => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, passengers:passenger_id(*)')
      .eq('status', 'requested')
      .limit(20)

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error } = useQuery(
    ['requested-rides'],
    fetchRides,
    {
      retry: false
    })

  return {
    rides: data,
    isLoading,
    error: error as Error
  }
}

export default useRequestedRides
