import { FC, useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import useDriver from '@hooks/drivers/use-driver'
import { RootStackScreenProps } from '@navigation/types'
import { getAvatarUrl } from '@base/supabase/storage'
import { useMutation } from '@tanstack/react-query'
import { signOut } from '@base/auth'
import cn from 'classnames'
import useVehicle from '@hooks/vehicles/use-vehicle'
import useCurrentDriverRide from '@base/rides/hooks/use-current-driver-ride'
import { useIsFocused } from '@react-navigation/native'

type Props = RootStackScreenProps<'DriverDetails'>

const DriverDetailsScreen: FC<Props> = ({ navigation }) => {
  const { driver, isLoading, error } = useDriver()
  const { vehicle, isLoading: isLoadingVehicle } = useVehicle()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (driver === null || driver === undefined) {
      navigation.replace('RegisterDriver')
      return
    }

    if (driver.photo_url !== null) {
      getAvatarUrl(driver.photo_url)
        .then(url => {
          setAvatarUrl(url)
        })
    }
  }, [isLoading, driver])

  const { ride, isLoading: isLoadingRide } = useCurrentDriverRide()
  const isFocused = useIsFocused()
  useEffect(() => {
    if (!isFocused) {
      return
    }

    if (isLoadingRide) {
      return
    }

    if (ride !== undefined) {
      navigation.replace('DriverRideDetails')
    }
  }, [ride, isLoadingRide, isFocused])

  const { mutate, isLoading: isLoadingSignOut } = useMutation(signOut)

  const goToPassengerProfile = (): void => {
    navigation.navigate('PassengerDetails')
  }

  const goToRegisterVehicle = (): void => {
    navigation.navigate('RegisterVehicle')
  }

  const goToRequestedRides = (): void => {
    navigation.navigate('RequestedRides')
  }

  const isLoadingData = isLoading || isLoadingRide

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {isLoadingData && <Text>Cargando...</Text>}
      {error !== null && <Text>{error.message}</Text>}
      {driver !== undefined && driver !== null && (
        <View className="flex flex-col space-y-5">
          {
            avatarUrl !== null
              ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-32 h-32 rounded-full mx-auto"
                />
                )
              : (
                <View className="w-32 h-32 rounded-full mx-auto bg-gray-200"/>
                )
          }
          <View className="mb-5">
            <Text className="text-xl text-center dark:text-white">
              {driver.name}
            </Text>
            <Text className="text-base text-center dark:text-white">
              {driver.phone}
            </Text>
            <Text
              className="text-base text-center font-medium text-gray-500 dark:text-gray-400">
              Saldo actual: {Intl.NumberFormat('es', {
                style: 'currency',
                currency: 'COP'
              }).format(driver.balance)}
            </Text>

            <View className="mt-3">
              {
                isLoadingVehicle && (
                  <Text
                    className="text-base text-center text-gray-500 dark:text-gray-400">
                    Cargando vehículo...
                  </Text>
                )
              }
              {
                !isLoadingVehicle && (vehicle === null || vehicle === undefined) && (
                  <Pressable
                    onPress={goToRegisterVehicle}
                    className={
                      cn('text-base px-6 py-3.5 bg-pink-100 rounded-lg border border-transparent',
                        'active:bg-pink-200',
                        (isLoadingSignOut) && 'bg-pink-200 cursor-not-allowed',
                        (isLoadingSignOut) && 'dark:bg-pink-200 dark:text-gray-400')
                    }
                  >
                    <Text
                      className="text-base text-white font-medium text-center text-pink-900">
                      Debes registrar un vehículo
                    </Text>
                  </Pressable>
                )
              }
              {
                !isLoadingVehicle && vehicle !== null && vehicle !== undefined && (
                  <>
                    <Text
                      className="text-base text-center text-gray-500 dark:text-gray-400">
                      Vehículo: {vehicle.brand}, {vehicle.line} {vehicle.model} -
                      CC {vehicle.engine_displacement}
                    </Text>
                    <Text
                      className="text-base text-center text-gray-500 dark:text-gray-400">
                      Placa {vehicle.license_plate}
                    </Text>
                  </>
                )
              }
            </View>
          </View>

          <Pressable
            onPress={goToRequestedRides}
            className={
              cn('text-base px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
                'active:bg-blue-800',
                (isLoadingSignOut) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                (isLoadingSignOut) && 'dark:bg-gray-800 dark:text-gray-400')
            }
          >
            <Text
              className="text-base text-white font-medium text-center text-white">
              Ver solicitudes
            </Text>
          </Pressable>

          <Pressable
            onPress={goToPassengerProfile}
            className={
              cn('text-base px-6 py-3.5 bg-green-700 rounded-lg border border-transparent',
                'active:bg-green-800',
                (isLoadingSignOut) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                (isLoadingSignOut) && 'dark:bg-gray-800 dark:text-gray-400')
            }
          >
            <Text
              className="text-base text-white font-medium text-center text-white">
              Cambiar a modo pasajero
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              mutate()
            }}
            className={
              cn('text-base px-6 py-3.5 bg-red-700 rounded-lg border border-transparent',
                'active:bg-red-800',
                (isLoadingSignOut) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                (isLoadingSignOut) && 'dark:bg-gray-800 dark:text-gray-400')
            }
          >
            <Text
              className="text-base text-white font-medium text-center text-white">
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default DriverDetailsScreen
