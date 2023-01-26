import { FC, useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
import useRequestedRides from '@base/rides/hooks/use-requested-rides'
import useDriver from '@hooks/drivers/use-driver'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'
import RequestedRideCard from '@base/rides/components/requested'
import {
  REALTIME_LISTEN_TYPES
} from '@supabase/realtime-js/src/RealtimeChannel'
import { RootStackScreenProps } from '@navigation/types'
import useCurrentDriverRide from '@base/rides/hooks/use-current-driver-ride'
import useVehicle from '@hooks/vehicles/use-vehicle'
import useRealtimeRequestedRides
  from '@base/rides/hooks/realtime/use-realtime-requested-rides'
import useRealtimeCurrentDriverRide
  from '@base/rides/hooks/realtime/use-realtime-current-driver-ride'

type Props = RootStackScreenProps<'RequestedRides'>

const RequestedRidesScreen: FC<Props> = ({ navigation }) => {
  const { rides, isLoading } = useRequestedRides()
  const { driver } = useDriver()
  const { vehicle } = useVehicle()

  useRealtimeRequestedRides()
  useRealtimeCurrentDriverRide()

  const { ride, isLoading: isLoadingCurrentRide } = useCurrentDriverRide()
  useEffect(() => {
    if (isLoadingCurrentRide) {
      return
    }

    if (ride !== undefined) {
      navigation.replace('DriverRideDetails')
    }
  }, [ride, isLoadingCurrentRide])

  const performAcceptRideRequest = async (rideId: number) => {
    if (driver !== undefined && driver !== null && rides !== undefined) {
      const ride = rides.find((ride) => ride.id === rideId)
      const channel = supabase.channel('rides-changes').subscribe(
        async (status) => {
          if (status === 'SUBSCRIBED') {
            const result = await channel
              .send({
                type: REALTIME_LISTEN_TYPES.BROADCAST,
                event: `accept-ride-request-${rideId}`,
                payload: {
                  ...ride,
                  driver_id: driver.id,
                  drivers: {
                    name: driver.name,
                    phone: driver.phone,
                    gender: driver.gender,
                    photo_url: driver.photo_url,
                    vehicles: [vehicle]
                  }
                }
              })

            if (result !== 'ok') {
              throw Error('No se pudo aceptar la solicitud')
            }
          }
        }
      )
    }
  }

  const {
    mutate,
    isLoading: isAcceptingRequest
  } = useMutation(performAcceptRideRequest)

  const handleAcceptRideRequest = (rideId: number) => {
    mutate(rideId)
  }

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
