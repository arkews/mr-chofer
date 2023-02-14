import { DriverStatus } from '@base/hooks/drivers/use-driver'
import { ActiveDriversChannel } from '@base/rides/realtime/channels'
import { RideStatus } from '@base/rides/types'
import { supabase } from '@base/supabase'
import { useEffect, useState } from 'react'

type UseRealtimeActiveDrivers = {
  count: number
}

type RealtimeSubsciber = 'passenger' | 'driver'

const useRealtimeActiveDrivers = (
  subscriber: RealtimeSubsciber
): UseRealtimeActiveDrivers => {
  const [activeDrivers, setActiveDrivers] = useState(0)

  const fetchActiveDrivers = async () => {
    const { count: activeRides, error } = await supabase
      .from('rides')
      .select('*', { count: 'exact', head: true })
      .eq('status', RideStatus.accepted)
      .eq('status', RideStatus.in_progress)

    if (error !== null) {
      console.error(error)
    }

    const { count: activeDrivers, error: DriverError } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('status', DriverStatus.accepted)

    if (DriverError !== null) {
      console.error(DriverError)
    }

    if (activeDrivers === null || activeRides === null) {
      return
    }

    setActiveDrivers(activeDrivers - activeRides)
  }

  useEffect(() => {
    let channel = ActiveDriversChannel()

    if (subscriber === 'passenger') {
      void fetchActiveDrivers()
    }

    if (subscriber === 'driver') {
      channel = channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({})
        }
      })
    }

    return () => {
      void channel.unsubscribe()
    }
  }, [subscriber])

  return {
    count: activeDrivers
  }
}

export default useRealtimeActiveDrivers
