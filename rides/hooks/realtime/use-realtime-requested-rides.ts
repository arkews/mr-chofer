import { useEffect } from 'react'
import {
  NewRidesChannel,
  RideChangesChannel
} from '@base/rides/realtime/channels'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
} from '@supabase/supabase-js'
import { RideStatus } from '@base/rides/types'
import { useQueryClient } from '@tanstack/react-query'
import useCurrentDriverRide from '@base/rides/hooks/use-current-driver-ride'

const useRealtimeRequestedRides = () => {
  const { ride, isLoading } = useCurrentDriverRide()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride !== undefined && ride !== null) {
      return
    }

    const newRidesChannel = NewRidesChannel()
    const rideChangesChannel = RideChangesChannel()

    newRidesChannel.on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
        schema: 'public',
        table: 'rides',
        filter: `status=eq.${RideStatus.requested}`
      },
      () => {
        void queryClient.invalidateQueries(['requested-rides'])
      }
    ).subscribe()

    rideChangesChannel.on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
        schema: 'public',
        table: 'rides',
        filter: `status=eq.${RideStatus.accepted}`
      },
      () => {
        void queryClient.invalidateQueries(['requested-rides'])
      }
    ).on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
        schema: 'public',
        table: 'rides',
        filter: `status=eq.${RideStatus.canceled}`
      },
      () => {
        void queryClient.invalidateQueries(['requested-rides'])
      }
    ).on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
        schema: 'public',
        table: 'rides',
        filter: `status=eq.${RideStatus.requested}`
      },
      () => {
        void queryClient.invalidateQueries(['requested-rides'])
      }
    )
      .subscribe()

    return () => {
      void newRidesChannel.unsubscribe()
      void rideChangesChannel.unsubscribe()
    }
  }, [ride, isLoading])
}

export default useRealtimeRequestedRides
