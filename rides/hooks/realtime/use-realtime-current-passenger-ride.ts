import { useQueryClient } from '@tanstack/react-query'
import usePassenger from '@hooks/passengers/use-passenger'
import { useEffect } from 'react'
import { PassengerRideChannel } from '@base/rides/realtime/channels'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
} from '@supabase/supabase-js'

const useRealtimeCurrentPassengerRide = () => {
  const { passenger } = usePassenger()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (passenger === undefined || passenger === null) {
      return
    }

    if (PassengerRideChannel.joinedOnce) {
      return
    }

    PassengerRideChannel.on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
        schema: 'public',
        table: 'rides',
        filter: `passenger_id=eq.${passenger.id}`
      },
      () => {
        void queryClient.invalidateQueries(['current-ride', passenger.id])
      }
    ).subscribe()
  }, [passenger])
}

export default useRealtimeCurrentPassengerRide
