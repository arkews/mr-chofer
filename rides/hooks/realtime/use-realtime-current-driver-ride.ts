import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { DriverRideChannel } from '@base/rides/realtime/channels'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
} from '@supabase/supabase-js'
import useDriver from '@hooks/drivers/use-driver'

const useRealtimeCurrentDriverRide = () => {
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
      () => {
        void queryClient.invalidateQueries(['current-driver-ride'])
      }
    ).subscribe()

    return () => {
      void channel.unsubscribe()
    }
  }, [driver, isLoading])
}

export default useRealtimeCurrentDriverRide
