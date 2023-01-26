import useCurrentPassengerRide
  from '@base/rides/hooks/use-current-passenger-ride'
import { useEffect } from 'react'
import { useToast } from 'react-native-toast-notifications'
import { RideChangesBroadcastChannel } from '@base/rides/realtime/channels'
import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'

const useRealtimePassengerRideBroadcast = () => {
  const { ride, isLoading } = useCurrentPassengerRide()
  const toast = useToast()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride === undefined) {
      return
    }

    if (RideChangesBroadcastChannel.joinedOnce) {
      return
    }

    RideChangesBroadcastChannel.on(
      REALTIME_LISTEN_TYPES.BROADCAST,
      {
        event: `accept-ride-request-${ride.id}`
      },
      (payload) => {
        toast.show('Tu solicitud ha sido aceptada', {
          type: 'ride_toast',
          placement: 'top',
          data: payload.payload,
          duration: 5000
        })
      }
    ).subscribe()
  }, [ride, isLoading])
}

export default useRealtimePassengerRideBroadcast
