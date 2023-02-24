import { Ride } from '@base/rides/types'
import { supabase } from '@base/supabase'
import usePassenger from '@hooks/passengers/use-passenger'
import { useQuery } from '@tanstack/react-query'

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
      .select('*, drivers:driver_id(name,phone, vehicles(license_plate,brand,line,model,color)), affiliates:affiliate_id(*)')
      .eq('passenger_id', passenger?.id)
      .in('status', ['requested', 'accepted', 'waiting', 'in_progress'])
      .limit(1)
      .single()

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error, isFetching, isRefetching } = useQuery(
    ['current-passenger-ride'],
    fetchRide,
    {
      enabled: passenger?.id !== undefined,
      retry: false
    })

  return {
    ride: error === null ? data : undefined,
    isLoading: isLoading || isFetching || isRefetching,
    error: error as Error
  }
}

export default useCurrentPassengerRide
