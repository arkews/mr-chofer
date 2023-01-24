import { FC, useEffect, useState } from 'react'
import { RootStackScreenProps } from '@navigation/types'
import { getAvatarUrl } from '@base/supabase/storage'
import usePassenger from '@hooks/passengers/use-passenger'
import { Image, Pressable, Text, View } from 'react-native'
import cn from 'classnames'
import { signOut } from '@base/auth'
import { useMutation } from '@tanstack/react-query'
import useDriver from '@hooks/drivers/use-driver'

type Props = RootStackScreenProps<'PassengerDetails'>

const PassengerDetailsScreen: FC<Props> = ({ navigation }) => {
  const { passenger, isLoading, error } = usePassenger()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (passenger === undefined) {
      navigation.replace('RegisterPassenger')
      return
    }

    if (passenger.photo_url !== null) {
      getAvatarUrl(passenger.photo_url)
        .then(url => {
          setAvatarUrl(url)
        })
    }
  }, [isLoading, passenger])

  const { mutate, isLoading: isLoadingSignOut } = useMutation(signOut)

  const goToDriverProfile = (): void => {
    navigation.navigate('DriverDetails')
  }

  const goToRegisterRideRequest = (): void => {
    navigation.navigate('RideDetails')
  }

  const { driver, isLoading: isLoadingDriver } = useDriver()

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {isLoading && <Text className="dark:text-white">Loading...</Text>}
      {error !== null &&
        <Text className="dark:text-white">{error.message}</Text>}
      {
        (passenger !== undefined) && (
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
              <Text className="text-xl text-center mb-3 dark:text-white">
                {passenger.name}
              </Text>
              <Text className="text-base text-center dark:text-white">
                {passenger.phone}
              </Text>
            </View>

            {
              isLoadingDriver
                ? (
                  <Text className="dark:text-white">Loading...</Text>
                  )
                : (
                  <Pressable
                    onPress={goToDriverProfile}
                    className={
                      cn('text-base px-6 py-3.5 bg-green-700 rounded-lg border border-transparent',
                        'active:bg-green-800',
                        (isLoadingSignOut) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                        (isLoadingSignOut) && 'dark:bg-gray-800 dark:text-gray-400')
                    }
                  >
                    <Text
                      className="text-base text-white font-medium text-center text-white">
                      {driver !== undefined ? 'Cambiar a modo conductor' : '¿Quieres trabajar con nosotros?'}
                    </Text>
                  </Pressable>
                  )
            }

            <Pressable
              onPress={goToRegisterRideRequest}
              className={
                cn('text-base px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
                  'active:bg-blue-800',
                  (isLoadingSignOut) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                  (isLoadingSignOut) && 'dark:bg-gray-800 dark:text-gray-400')
              }
            >
              <Text
                className="text-base text-white font-medium text-center text-white">
                Registrar solicitud de viaje
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
        )
      }
    </View>
  )
}

export default PassengerDetailsScreen
