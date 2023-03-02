import useDriver from '@base/hooks/drivers/use-driver'
import { ActiveDriversChannel } from '@base/rides/realtime/channels'
import { useEffect, useState } from 'react'

type UseRealtimeActiveDrivers = {
  count: number
}

type RealtimeSubsciber = 'passenger' | 'driver'

const useRealtimeActiveDrivers = (
  subscriber: RealtimeSubsciber
): UseRealtimeActiveDrivers => {
  const [activeDrivers, setActiveDrivers] = useState(0)
  const { driver } = useDriver()

  useEffect(() => {
    let channel = ActiveDriversChannel()

    if (subscriber === 'passenger') {
      channel = channel
        .on('presence', { event: 'join' }, () => {
          setActiveDrivers((prev) => prev + 1)
        })
        .on('presence', { event: 'leave' }, () => {
          setActiveDrivers((prev) => prev - 1)
        })
        .subscribe()
    }

    if (subscriber === 'driver') {
      channel = channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          if (driver?.active ?? false) {
            await channel.track({})
            return
          }

          await channel.untrack({})
        }
      })
    }

    return () => {
      void channel.unsubscribe()
    }
  }, [subscriber, driver])

  return {
    count: activeDrivers
  }
}

export default useRealtimeActiveDrivers
