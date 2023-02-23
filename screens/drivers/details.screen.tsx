import { signOut } from '@base/auth'
import useCurrentDriverRide from '@base/rides/hooks/use-current-driver-ride'
import { getAvatarUrl } from '@base/supabase/storage'
import RatingView from '@components/rating.view'
import { MaterialIcons } from '@expo/vector-icons'
import useDriver from '@hooks/drivers/use-driver'
import useVehicle from '@hooks/vehicles/use-vehicle'
import { RootStackScreenProps } from '@navigation/types'
import { useMutation } from '@tanstack/react-query'
import cn from 'classnames'
import { styled } from 'nativewind'
import { FC, useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'

type Props = RootStackScreenProps<'DriverDetails'>

const StyledIcon = styled(MaterialIcons)

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

    if (driver.photo_url !== null && avatarUrl === null) {
      getAvatarUrl(driver.photo_url).then((url) => {
        setAvatarUrl(url)
      })
    }
  }, [isLoading, driver])

  const { ride, isLoading: isLoadingRide } = useCurrentDriverRide()
  useEffect(() => {
    if (isLoadingRide) {
      return
    }

    if (ride !== undefined) {
      navigation.replace('DriverRideDetails')
    }
  }, [ride, isLoadingRide])

  const { mutate: mutateSignOut, isLoading: isLoadingSignOut } =
    useMutation(signOut)

  const goToPassengerProfile = (): void => {
    navigation.navigate('PassengerDetails')
  }

  const goToRegisterVehicle = (): void => {
    navigation.navigate('RegisterVehicle')
  }

  const goToRechargeBalance = (): void => {
    navigation.navigate('MakeNequiPayment')
  }

  const isLoadingData = isLoading || isLoadingRide

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerRight: () => (
        <Pressable disabled={isLoadingSignOut} onPress={goToPassengerProfile}>
          <StyledIcon
            name="person"
            className="text-4xl text-blue-700 dark:text-blue-400"
          />
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable
          disabled={isLoadingSignOut}
          onPress={() => {
            mutateSignOut()
          }}
        >
          <StyledIcon
            name="logout"
            className="text-2xl text-red-700 dark:text-red-400"
          />
        </Pressable>
      ),
      headerTitle: () => <View />,
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
  }, [navigation, isLoadingSignOut])

  return (
    <View className="mt-3">
      <View className="flex w-full px-5 justify-center mx-auto space-y-5">
        {isLoadingData && <Text>Cargando...</Text>}
        {error !== null && <Text>{error.message}</Text>}
        {driver !== undefined && driver !== null && (
          <View className="flex flex-col space-y-5">
            {avatarUrl !== null
              ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-32 h-32 rounded-full mx-auto"
              />
                )
              : (
              <View className="w-32 h-32 rounded-full mx-auto bg-gray-200" />
                )}
            <View className="mb-5">
              <Text className="text-xl text-center dark:text-white">
                {driver.name}
              </Text>
              <Text className="text-md text-center text-gray-500 dark:text-gray-400">
                {driver.phone}
              </Text>
              <View className="flex flex-row justify-center space-x-2">
                <View>
                  <RatingView rating={driver.rating} size={24} />
                </View>
                <View>
                  <Text className="text-base text-neutral-400 dark:text-neutral-300">
                    {Intl.NumberFormat('es', {
                      style: 'decimal',
                      maximumFractionDigits: 1
                    }).format(driver.rating)}
                  </Text>
                </View>
              </View>
              <View className="mt-3">
                <Text className="text-base text-center font-medium text-gray-500 dark:text-gray-400">
                  Saldo actual:{' '}
                  {Intl.NumberFormat('es', {
                    style: 'currency',
                    currency: 'COP'
                  }).format(driver.balance)}
                </Text>
              </View>

              <View className="mt-3">
                {isLoadingVehicle && (
                  <Text className="text-base text-center text-gray-500 dark:text-gray-400">
                    Cargando vehículo...
                  </Text>
                )}
                {!isLoadingVehicle &&
                  (vehicle === null || vehicle === undefined) && (
                    <Pressable
                      onPress={goToRegisterVehicle}
                      className={cn(
                        'text-base px-6 py-3.5 bg-pink-100 rounded-lg border border-transparent',
                        'active:bg-pink-200',
                        isLoadingSignOut && 'bg-pink-200 cursor-not-allowed',
                        isLoadingSignOut &&
                          'dark:bg-pink-200 dark:text-gray-400'
                      )}
                    >
                      <Text className="text-base font-medium text-center text-pink-900">
                        Debes registrar un vehículo
                      </Text>
                    </Pressable>
                )}
                {!isLoadingVehicle &&
                  vehicle !== null &&
                  vehicle !== undefined && (
                    <>
                      <Text className="text-base text-center text-gray-500 dark:text-gray-400">
                        Vehículo: {vehicle.brand}, {vehicle.line}{' '}
                        {vehicle.model} - CC {vehicle.engine_displacement}
                      </Text>
                      <Text className="text-base text-center text-gray-500 dark:text-gray-400">
                        Placa {vehicle.license_plate}
                      </Text>
                    </>
                )}
              </View>

              <View className="mt-5">
                <Pressable
                  onPress={goToRechargeBalance}
                  className={cn(
                    'text-base px-6 py-3.5 bg-green-100 rounded-lg border border-transparent',
                    'active:bg-green-200',
                    isLoadingSignOut && 'bg-green-200 cursor-not-allowed',
                    isLoadingSignOut && 'dark:bg-green-200 dark:text-gray-400'
                  )}
                >
                  <Text className="text-base font-medium text-center text-green-900">
                    Recargar cuenta
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default DriverDetailsScreen
