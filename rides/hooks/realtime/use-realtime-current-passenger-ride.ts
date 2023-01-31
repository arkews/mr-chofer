import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { PassengerRideChannel } from '@base/rides/realtime/channels'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
} from '@supabase/supabase-js'
import useCurrentPassengerRide
  from '@base/rides/hooks/use-current-passenger-ride'

const useRealtimeCurrentPassengerRide = () => {
  const { ride, isLoading } = useCurrentPassengerRide()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride === undefined || ride === null) {
      return
    }

    const channel = PassengerRideChannel()
    channel.on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
        schema: 'public',
        table: 'rides',
        filter: `passenger_id=eq.${ride.passenger_id}`
      },
      () => {
        void queryClient.invalidateQueries(['current-passenger-ride'])
      }
    ).subscribe()

    return () => {
      void channel.unsubscribe()
    }
  }, [ride, isLoading])
}

export default useRealtimeCurrentPassengerRide
