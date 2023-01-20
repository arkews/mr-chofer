import useDriver from '@hooks/drivers/use-driver'
import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'

type Vehicle = {
  license_plate: string
  engine_displacement: string
  brand: string
  model: string
  color: string
  type: string

  created_at: string
}

type UseVehicle = {
  vehicle?: Vehicle
  isLoading: boolean
  error: Error | null
}

const useVehicle = (): UseVehicle => {
  const { driver } = useDriver()

  const fetchVehicle = async (): Promise<Vehicle> => {
    const { data, error } = await supabase.from('vehicles')
      .select()
      .eq('driver_id', driver?.id)
      .single()

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error } = useQuery(
    ['vehicle', driver?.id],
    fetchVehicle,
    {
      enabled: driver?.id !== undefined,
      retry: false
    })

  return {
    vehicle: data,
    isLoading,
    error: error as Error
  }
}

export default useVehicle
