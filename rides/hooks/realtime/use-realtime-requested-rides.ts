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

const useRealtimeRequestedRides = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!NewRidesChannel.joinedOnce) {
      NewRidesChannel.on(
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
    }

    if (!RideChangesChannel.joinedOnce) {
      RideChangesChannel.on(
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
          filter: `status=eq.${RideStatus.canceled}&driver_id=is.null`
        },
        () => {
          void queryClient.invalidateQueries(['requested-rides'])
        }
      )
        .subscribe()
    }
  }, [])
}

export default useRealtimeRequestedRides
