import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'
import { Ride } from '@base/rides/types'
import useVehicle from '@hooks/vehicles/use-vehicle'
import useDriver from '@hooks/drivers/use-driver'

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
      .order('request_time', { ascending: false })
      .limit(20)

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { vehicle } = useVehicle()
  const { driver } = useDriver()
  const { data, isLoading, error } = useQuery(
    ['requested-rides'],
    fetchRides,
    {
      retry: false,
      enabled: vehicle !== null && vehicle !== undefined &&
        driver !== null && driver !== undefined &&
        driver.status === 'accepted' && driver.balance > 0
    })

  return {
    rides: data,
    isLoading,
    error: error as Error
  }
}

export default useRequestedRides
