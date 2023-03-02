import { useAuth } from '@base/auth/context'
import useNotificationInitialLoad from '@base/notifications/hooks/use-notification-initial-load'
import RequestedRideCard from '@base/rides/components/requested'
import useRealtimeActiveDrivers from '@base/rides/hooks/realtime/use-realtime-active-drivers'
import useRealtimeCurrentDriverRide from '@base/rides/hooks/realtime/use-realtime-current-driver-ride'
import useRealtimeRequestedRides from '@base/rides/hooks/realtime/use-realtime-requested-rides'
import useCurrentDriverRide from '@base/rides/hooks/use-current-driver-ride'
import useRequestedRides from '@base/rides/hooks/use-requested-rides'
import { useConfig } from '@base/shared/configuration'
import { supabase } from '@base/supabase'
import { MaterialIcons } from '@expo/vector-icons'
import useDriver, { DriverStatus } from '@hooks/drivers/use-driver'
import useVehicle from '@hooks/vehicles/use-vehicle'
import { RootStackScreenProps } from '@navigation/types'
import { DrawerActions, useFocusEffect } from '@react-navigation/native'
import { REALTIME_LISTEN_TYPES } from '@supabase/realtime-js/src/RealtimeChannel'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import { useKeepAwake } from 'expo-keep-awake'
import { styled } from 'nativewind'
import { FC, useCallback, useEffect } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'

const StyledIcon = styled(MaterialIcons)

type Props = RootStackScreenProps<'RequestedRides'>

const RequestedRidesScreen: FC<Props> = ({ navigation }) => {
  useKeepAwake()

  const { rides, isLoading } = useRequestedRides()
  const { driver, isLoading: isLoadingDriver } = useDriver()
  const { vehicle, isLoading: isLoadingVehicle } = useVehicle()

  useNotificationInitialLoad(
    'driver',
    driver !== undefined &&
      driver !== null &&
      driver.status === DriverStatus.accepted
  )

  const checkVehicle = useCallback(() => {
    if (isLoadingVehicle) {
      return
    }

    if (vehicle === undefined || vehicle === null) {
      navigation.navigate('DriverDetails')
    }
  }, [isLoadingVehicle, vehicle])

  const checkDriver = useCallback(() => {
    if (isLoadingDriver) {
      return
    }

    if (driver === undefined || driver === null) {
      navigation.navigate('DriverDetails')
    }
  }, [isLoadingDriver, driver])

  useFocusEffect(() => {
    checkDriver()
    checkVehicle()
  })

  useRealtimeRequestedRides()
  useRealtimeCurrentDriverRide()
  useRealtimeActiveDrivers('driver')

  const { ride, isLoading: isLoadingCurrentRide } = useCurrentDriverRide()
  useEffect(() => {
    if (isLoadingCurrentRide) {
      return
    }

    if (ride !== undefined) {
      navigation.replace('DriverRideDetails')
    }
  }, [ride, isLoadingCurrentRide])

  const performAcceptRideRequest = async (data: {
    rideId: number
    price?: number
  }) => {
    if (driver !== undefined && driver !== null && rides !== undefined) {
      const ride = rides.find((ride) => ride.id === data.rideId)

      const channel = supabase
        .channel('rides-changes')
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const result = await channel.send({
              type: REALTIME_LISTEN_TYPES.BROADCAST,
              event: `accept-ride-request-${data.rideId}`,
              payload: {
                ...ride,
                ...(data.price !== undefined &&
                  data.price !== null && {
                  offered_price: data.price
                }),
                driver_id: driver.id,
                drivers: {
                  name: driver.name,
                  phone: driver.phone,
                  gender: driver.gender,
                  photo_url: driver.photo_url,
                  rating: driver.rating,
                  vehicles: vehicle
                }
              }
            })

            if (result !== 'ok') {
              throw Error('No se pudo aceptar la solicitud')
            }
          }
        })
    }
  }

  const { mutate, isLoading: isAcceptingRequest } = useMutation(
    performAcceptRideRequest
  )

  const handleAcceptRideRequest = (rideId: number, price?: number) => {
    mutate({ rideId, price })
  }

  const goToPassengerProfile = (): void => {
    navigation.navigate('PassengerDetails')
  }

  const toggleDriverStatus = async () => {
    if (driver === undefined || driver === null) {
      return
    }

    const { error } = await supabase
      .from('drivers')
      .update({ active: !driver.active })
      .eq('id', driver.id)

    if (error !== null) {
      const rawError = new Error(error.message)
      Sentry.Native.captureException(rawError)
    }
  }

  const queryClient = useQueryClient()
  const { session } = useAuth()
  const {
    mutate: performToggleDriverStatus,
    isLoading: isPerformToggleDriverStatus
  } = useMutation(toggleDriverStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(['driver', session?.user?.id])
    }
  })

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerRight: () => (
        <Pressable onPress={goToPassengerProfile}>
          <StyledIcon
            name="person"
            className="text-4xl text-blue-700 dark:text-blue-400"
          />
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable
          onPress={() => {
            navigation.dispatch(DrawerActions.openDrawer)
          }}
        >
          <StyledIcon
            name="menu"
            className="text-2xl text-gray-900 dark:text-gray-400"
          />
        </Pressable>
      ),
      headerTitle: () => (
        <Pressable
          onPress={() => {
            performToggleDriverStatus()
          }}
          disabled={isPerformToggleDriverStatus}
          className={cn(
            'flex flex-row justify-center items-center space-x-1 px-3 py-1 border',
            driver?.active ?? false
              ? 'border-green-700 bg-green-100 dark:bg-green-300 rounded-md dark:border-green-500 active:border-green-900 dark:active:border-green-700'
              : 'border-red-700 bg-red-100 dark:bg-red-300 rounded-md dark:border-red-500 active:border-red-900 dark:active:border-red-700'
          )}
        >
          <StyledIcon
            name="repeat"
            className={cn(
              driver?.active ?? false
                ? 'text-green-900 dark:text-green-700'
                : 'text-red-900 dark:text-red-700'
            )}
          />
          <Text
            className={cn(
              driver?.active ?? false
                ? 'text-xs text-green-900 dark:text-green-700 font-medium'
                : 'text-xs text-red-900 dark:text-red-700 font-medium'
            )}
          >
            Estado: {driver?.active ?? false ? 'Activo' : 'Inactivo'}
          </Text>
        </Pressable>
      ),
      header: (props) => {
        const HeaderRight = props.options.headerRight as FC
        const HeaderLeft = props.options.headerLeft as FC
        const HeaderTitle = props.options.headerTitle as FC
        return (
          <View className="flex flex-row px-3 py-12 pb-2 justify-between items-center border border-b-neutral-300 dark:border-b-neutral-600">
            <View className="justify-center">
              <HeaderLeft key={props.route.key} />
            </View>
            <View className="justify-center">
              <HeaderTitle key={props.route.key} />
            </View>
            <View className="justify-center">
              <HeaderRight key={props.route.key} />
            </View>
          </View>
        )
      }
    })
  }, [navigation, driver?.active])

  const goToAttachDriverDocuments = () => {
    navigation.navigate('AttachDriverDocuments')
  }

  const isDriverEmpty = driver === undefined || driver === null
  const isDriverVerified =
    !isDriverEmpty && driver.status === DriverStatus.accepted

  const { config } = useConfig('CHECK_DRIVER_BALANCE')

  const isValidConfig = config !== undefined && config !== null
  const isDriveHasEnoughBalance =
    !isDriverEmpty &&
    isValidConfig &&
    (config.value === 'true' ? driver.balance >= 0 : true)

  return (
    <>
      <View className="flex h-full pb-10">
        {isAcceptingRequest && (
          <View className="flex flex-grow w-full px-4 justify-center mx-auto">
            <Text className="text-2xl font-bold text-center my-auto dark:text-white">
              Procesando solicitud...
            </Text>
          </View>
        )}

        {isLoadingVehicle && (
          <View className="flex flex-grow w-full px-4 justify-center mx-auto">
            <Text className="text-2xl font-bold text-center my-auto dark:text-white">
              Verificando información...
            </Text>
          </View>
        )}

        {!isDriverVerified && (
          <View className="flex flex-col space-y-3 flex-grow w-full px-3 justify-center mx-auto">
            <View>
              <Text className="text-2xl font-bold text-center my-auto text-gray-900 dark:text-gray-100">
                Estamos procesando tu solicitud
              </Text>
            </View>

            {(driver?.contract_url === null ||
              driver?.notary_power_url === null) && (
              <View className="pt-4">
                <View>
                  <Text className="text-xl font-bold text-center text-gray-700 dark:text-gray-300">
                    ¿Tienes documentos adicionales?
                  </Text>
                  <Text className="text-gray-500 text-sm mt-3 dark:text-gray-400">
                    Si tienes documentos adicionales puedes subirlos aquí.
                  </Text>
                </View>

                <View className="flex flex-row space-x-2 justify-center mt-7">
                  <Pressable
                    onPress={goToAttachDriverDocuments}
                    className="flex flex-row justify-center items-center space-x-2 px-5 py-3.5 rounded-md bg-blue-700 active:bg-blue-800"
                  >
                    <Text className="text-white text-base font-bold">
                      Anexar documentos
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {isDriverVerified && !isDriveHasEnoughBalance && (
          <View className="flex flex-grow w-full px-5 justify-center mx-auto">
            <Text className="text-2xl font-bold text-center my-auto dark:text-white">
              Tu saldo es insuficiente para aceptar solicitudes
            </Text>
          </View>
        )}

        {!isAcceptingRequest &&
          !isLoadingVehicle &&
          isDriverVerified &&
          isDriveHasEnoughBalance && (
            <View className="flex py-2 px-2 space-y-5">
              <View className="block">
                <Text className="text-2xl font-bold text-center dark:text-white">
                  Solicitudes de viaje
                </Text>
              </View>

              {isLoading && (
                <View>
                  <Text className="text-base text-center my-auto dark:text-white">
                    Cargando solicitudes...
                  </Text>
                </View>
              )}

              {!isLoading && rides?.length === 0 && (
                <View>
                  <Text className="text-base text-center my-auto text-gray-500 dark:text-gray-400">
                    No tienes solicitudes de viaje
                  </Text>
                </View>
              )}

              {rides !== undefined && (
                <ScrollView>
                  {rides.map((ride) => (
                    <RequestedRideCard
                      key={ride.id}
                      ride={ride}
                      onAccept={handleAcceptRideRequest}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
        )}
      </View>
    </>
  )
}

export default RequestedRidesScreen
