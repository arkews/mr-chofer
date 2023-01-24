import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'
import { Ride } from '@base/rides/types'
import usePassenger from '@hooks/passengers/use-passenger'

type UseRide = {
  ride?: Ride
  isLoading: boolean
  error: Error | null
}

const useCurrentPassengerRide = (): UseRide => {
  const { passenger } = usePassenger()

  const fetchRide = async (): Promise<Ride> => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, drivers:driver_id(name,phone)')
      .eq('passenger_id', passenger?.id)
      .in('status', ['requested', 'accepted', 'in_progress'])
      .limit(1)
      .single()

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error } = useQuery(
    ['current-drive', passenger?.id],
    fetchRide,
    {
      enabled: passenger?.id !== undefined,
      retry: false
    })

  return {
    ride: data,
    isLoading,
    error: error as Error
  }
}

export default useCurrentPassengerRide
