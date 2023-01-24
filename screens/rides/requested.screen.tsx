import { FC, useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
import useRequestedRides from '@base/rides/hooks/use-requested-rides'
import useDriver from '@hooks/drivers/use-driver'
import { supabase } from '@base/supabase'
import { RideStatus } from '@base/rides/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import RequestedRideCard from '@base/rides/components/requested'
import {
  REALTIME_LISTEN_TYPES
} from '@supabase/realtime-js/src/RealtimeChannel'

const RequestedRidesScreen: FC = () => {
  const { rides, isLoading } = useRequestedRides()

  const { driver } = useDriver()
  const performAcceptRideRequest = async (rideId: number) => {
    if (driver !== undefined) {
      const { error } = await supabase.from('rides')
        .update({
          driver_id: driver?.id,
          status: RideStatus.accepted
        })
        .eq('id', rideId)

      if (error !== null) {
        throw Error(error.message)
      }
    }
  }

  const queryClient = useQueryClient()
  const {
    mutate,
    isLoading: isAcceptingRequest
  } = useMutation(performAcceptRideRequest)

  const handleAcceptRideRequest = (rideId: number) => {
    mutate(rideId)
  }

  useEffect(() => {
    const newRequestChannel = supabase
      .channel('new-rides')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rides',
          filter: `status=eq.${RideStatus.requested}`
        },
        () => {
          void queryClient.invalidateQueries(['requested-rides'])
        }
      )
      .subscribe()

    const acceptedRequestChannel = supabase
      .channel('rides-changes')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `status=eq.${RideStatus.accepted}`
        },
        () => {
          void queryClient.invalidateQueries(['requested-rides'])
        }
      )
      .subscribe()

    return () => {
      void newRequestChannel.unsubscribe()
      void acceptedRequestChannel.unsubscribe()
    }
  }, [])

  return (
    <>
      <View className="flex h-full">
        {isAcceptingRequest && (
          <View className="flex flex-grow w-full px-5 justify-center mx-auto">
            <Text
              className="text-2xl font-bold text-center my-auto dark:text-white">
              Procesando solicitud...
            </Text>
          </View>
        )}

        {
          !isAcceptingRequest && (
            <View className="flex py-12 px-3 space-y-7">
              <View className="block">
                <Text className="text-2xl font-bold text-center dark:text-white">
                  Solicitudes de viaje
                </Text>
              </View>

              {isLoading &&
                <View>
                  <Text
                    className="text-base text-center my-auto dark:text-white">
                    Cargando solicitudes...
                  </Text>
                </View>}

              {!isLoading && rides?.length === 0 && (
                <View>
                  <Text
                    className="text-base text-center my-auto dark:text-white">
                    No tienes solicitudes de viaje
                  </Text>
                </View>
              )}

              {rides !== undefined && (
                <ScrollView>
                  {rides.map((ride) => (
                    <RequestedRideCard key={ride.id} ride={ride}
                                       onAccept={handleAcceptRideRequest}/>
                  ))}
                </ScrollView>
              )}

            </View>
          )
        }
      </View>
    </>
  )
}

export default RequestedRidesScreen
