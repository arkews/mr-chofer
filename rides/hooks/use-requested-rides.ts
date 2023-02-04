import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'
import { Ride } from '@base/rides/types'
import useVehicle from '@hooks/vehicles/use-vehicle'

type UseRequestedRides = {
  rides?: Ride[]
  isLoading: boolean
  error: Error | null
}

const useRequestedRides = (): UseRequestedRides => {
  const fetchRides = async (): Promise<Ride[]> => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, passengers:passenger_id(name,phone,gender,photo_url)')
      .eq('status', 'requested')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { vehicle } = useVehicle()
  const { data, isLoading, error } = useQuery(
    ['requested-rides'],
    fetchRides,
    {
      retry: false,
      enabled: vehicle !== null && vehicle !== undefined
    })

  return {
    rides: data,
    isLoading,
    error: error as Error
  }
}

export default useRequestedRides
