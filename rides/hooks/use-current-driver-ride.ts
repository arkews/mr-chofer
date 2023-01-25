import { supabase } from '@base/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Ride } from '@base/rides/types'
import useDriver from '@hooks/drivers/use-driver'
import { useEffect } from 'react'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
} from '@supabase/supabase-js'

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
      .select('*, passengers:passenger_id(name,phone,gender,photo_url)')
      .eq('driver_id', driver?.id)
      .in('status', ['requested', 'accepted', 'in_progress'])
      .limit(1)
      .single()

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error } = useQuery(
    ['current-drive', driver?.id],
    fetchRide,
    {
      enabled: driver?.id !== undefined,
      retry: false
    })

  const queryClient = useQueryClient()
  useEffect(() => {
    if (driver === undefined || driver === null) {
      return
    }

    const rideChanges = supabase
      .channel('passenger-ride')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
          schema: 'public',
          table: 'rides',
          filter: `driver_id=eq.${driver.id}`
        },
        () => {
          void queryClient.invalidateQueries(['current-drive', driver.id])
        }
      )
      .subscribe()

    return () => {
      void rideChanges.unsubscribe()
    }
  }, [driver])

  return {
    ride: error === null ? data : undefined,
    isLoading,
    error: error as Error
  }
}

export default useCurrentDriverRide
