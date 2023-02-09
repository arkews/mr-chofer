import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { DriverRideChannel } from '@base/rides/realtime/channels'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
} from '@supabase/supabase-js'
import useDriver from '@hooks/drivers/use-driver'
import { useAuth } from '@base/auth/context'
import { RideStatus } from '@base/rides/types'

const useRealtimeCurrentDriverRide = () => {
  const { session } = useAuth()
  const { driver, isLoading } = useDriver()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (driver === undefined || driver === null) {
      return
    }

    const channel = DriverRideChannel()
    channel.on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
        schema: 'public',
        table: 'rides',
        filter: `driver_id=eq.${driver.id}`
      },
      (payload) => {
        const { status } = payload.new
        if (status === RideStatus.completed) {
          void queryClient.invalidateQueries(['driver', session?.user?.id])
        }

        void queryClient.invalidateQueries(['current-driver-ride'])
      }
    ).subscribe()

    return () => {
      void channel.unsubscribe()
    }
  }, [driver, isLoading])
}

export default useRealtimeCurrentDriverRide
