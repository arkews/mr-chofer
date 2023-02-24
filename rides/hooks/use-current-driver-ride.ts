import { Ride } from '@base/rides/types'
import { supabase } from '@base/supabase'
import useDriver, { DriverStatus } from '@hooks/drivers/use-driver'
import { useQuery } from '@tanstack/react-query'

type UseRide = {
  ride?: Ride
  isLoading: boolean
  error: Error | null
}

const useCurrentDriverRide = (): UseRide => {
  const { driver } = useDriver()

  const fetchRide = async (): Promise<Ride> => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, passengers:passenger_id(name,phone,gender,photo_url), affiliates:affiliate_id(*)')
      .eq('driver_id', driver?.id)
      .in('status', ['requested', 'accepted', 'waiting', 'in_progress'])
      .limit(1)
      .single()

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, isFetching, isRefetching, error } = useQuery(
    ['current-driver-ride'],
    fetchRide,
    {
      enabled: driver?.id !== undefined && driver?.status === DriverStatus.accepted,
      retry: false
    })

  return {
    ride: error === null ? data : undefined,
    isLoading: isLoading || isFetching || isRefetching,
    error: error as Error
  }
}

export default useCurrentDriverRide
