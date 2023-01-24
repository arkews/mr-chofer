import { supabase } from '@base/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Ride } from '@base/rides/types'
import usePassenger from '@hooks/passengers/use-passenger'
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

  const queryClient = useQueryClient()
  useEffect(() => {
    if (passenger === undefined) {
      return
    }

    const rideChanges = supabase
      .channel('passenger-ride')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
          schema: 'public',
          table: 'rides'
        },
        () => {
          void queryClient.invalidateQueries(['current-drive', passenger?.id])
        }
      )
      .subscribe()

    return () => {
      void rideChanges.unsubscribe()
    }
  }, [passenger])

  return {
    ride: data,
    isLoading,
    error: error as Error
  }
}

export default useCurrentPassengerRide
