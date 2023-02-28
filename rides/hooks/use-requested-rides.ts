import { Ride } from '@base/rides/types'
import { useConfig } from '@base/shared/configuration'
import { supabase } from '@base/supabase'
import useDriver, { DriverStatus } from '@hooks/drivers/use-driver'
import useVehicle from '@hooks/vehicles/use-vehicle'
import { useQuery } from '@tanstack/react-query'

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
  const { config } = useConfig('CHECK_DRIVER_BALANCE')

  const isDriverEmpty = driver === undefined || driver === null
  const isDriverVerified =
    !isDriverEmpty && driver.status === DriverStatus.accepted
  const isVehicleEmpty = vehicle === undefined || vehicle === null
  const isValidConfig = config !== undefined && config !== null
  const isDriveHasEnoughBalance =
    !isDriverEmpty &&
    isValidConfig &&
    (config.value === 'true' ? driver.balance >= 0 : true)
  const isDriverActive = !isDriverEmpty && driver.active

  const { data, isLoading, error } = useQuery(['requested-rides'], fetchRides, {
    retry: false,
    enabled: isDriverVerified && !isVehicleEmpty && isDriveHasEnoughBalance && isDriverActive
  })

  return {
    rides: data,
    isLoading,
    error: error as Error
  }
}

export default useRequestedRides
