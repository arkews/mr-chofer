import { FC, useCallback, useEffect } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import useRequestedRides from '@base/rides/hooks/use-requested-rides'
import useDriver, { DriverStatus } from '@hooks/drivers/use-driver'
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
import { styled } from 'nativewind'
import { MaterialIcons } from '@expo/vector-icons'
import { signOut } from '@base/auth'
import { useFocusEffect } from '@react-navigation/native'

const StyledIcon = styled(MaterialIcons)

type Props = RootStackScreenProps<'RequestedRides'>

const RequestedRidesScreen: FC<Props> = ({ navigation }) => {
  const { rides, isLoading } = useRequestedRides()
  const { driver } = useDriver()
  const { vehicle, isLoading: isLoadingVehicle } = useVehicle()

  const checkVehicle = useCallback(() => {
    if (isLoadingVehicle) {
      return
    }

    if (vehicle === undefined || vehicle === null) {
      navigation.navigate('DriverDetails')
    }
  }, [isLoadingVehicle, vehicle])

  useFocusEffect(() => {
    checkVehicle()
  })

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

  const performAcceptRideRequest = async (data: { rideId: number, price?: number }) => {
    if (driver !== undefined && driver !== null && rides !== undefined) {
      const ride = rides.find((ride) => ride.id === data.rideId)

      const channel = supabase.channel('rides-changes').subscribe(
        async (status) => {
          if (status === 'SUBSCRIBED') {
            const result = await channel
              .send({
                type: REALTIME_LISTEN_TYPES.BROADCAST,
                event: `accept-ride-request-${data.rideId}`,
                payload: {
                  ...ride,
                  ...(data.price !== undefined && data.price !== null) && {
                    offered_price: data.price
                  },
                  driver_id: driver.id,
                  drivers: {
                    name: driver.name,
                    phone: driver.phone,
                    gender: driver.gender,
                    photo_url: driver.photo_url,
                    rating: driver.rating,
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

  const handleAcceptRideRequest = (rideId: number, price?: number) => {
    mutate({ rideId, price })
  }

  const {
    mutate: mutateSignOut,
    isLoading: isLoadingSignOut
  } = useMutation(signOut)

  const goToPassengerProfile = (): void => {
    navigation.navigate('PassengerDetails')
  }

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerRight: () => (
        <Pressable
          disabled={isLoadingSignOut}
          onPress={goToPassengerProfile}>
          <StyledIcon name="person"
                      className="text-4xl text-blue-700 dark:text-blue-400"/>
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable
          disabled={isLoadingSignOut}
          onPress={() => {
            mutateSignOut()
          }}>
          <StyledIcon name="logout"
                      className="text-2xl text-red-700 dark:text-red-400"/>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          className="text-base text-center justify-center font-medium text-gray-500 dark:text-gray-400">
          Saldo {Intl.NumberFormat('es', {
            style: 'currency',
            currency: 'COP'
          }).format(driver?.balance ?? 0)}
        </Text>
      ),
      header: (props) => {
        const HeaderRight = props.options.headerRight as FC
        const HeaderLeft = props.options.headerLeft as FC
        const HeaderTitle = props.options.headerTitle as FC
        return (
          <View
            className="flex flex-row px-3 py-12 pb-2 justify-between items-center border border-b-neutral-300 dark:border-b-neutral-600">
            <View className="justify-center">
              <HeaderLeft key={props.route.key}/>
            </View>
            <View className="justify-center">
              <HeaderTitle key={props.route.key}/>
            </View>
            <View className="justify-center">
              <HeaderRight key={props.route.key}/>
            </View>
          </View>
        )
      }
    })
  }, [navigation, isLoadingSignOut])

  return (
    <>
      <View className="flex h-full pb-10">
        {isAcceptingRequest && (
          <View className="flex flex-grow w-full px-5 justify-center mx-auto">
            <Text
              className="text-2xl font-bold text-center my-auto dark:text-white">
              Procesando solicitud...
            </Text>
          </View>
        )}

        {
          isLoadingVehicle && (
            <View className="flex flex-grow w-full px-5 justify-center mx-auto">
              <Text
                className="text-2xl font-bold text-center my-auto dark:text-white">
                Verificando información...
              </Text>
            </View>
          )
        }

        {
          driver !== undefined && driver !== null && driver.status !== DriverStatus.accepted && (
            <View className="flex flex-grow w-full px-5 justify-center mx-auto">
              <Text
                className="text-2xl font-bold text-center my-auto dark:text-white">
                Aún no has sido aceptado como conductor
              </Text>
            </View>
          )
        }

        {
          !isAcceptingRequest && !isLoadingVehicle && driver?.status === DriverStatus.accepted && (
            <View className="flex py-2 px-3 space-y-5">
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
                    className="text-base text-center my-auto text-gray-500 dark:text-gray-400">
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
