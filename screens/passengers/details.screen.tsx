import RegisterRideRequestForm from '@base/rides/components/register.form'
import useCurrentPassengerRide from '@base/rides/hooks/use-current-passenger-ride'
import { getAvatarUrl } from '@base/supabase/storage'
import { MaterialIcons } from '@expo/vector-icons'
import usePassenger from '@hooks/passengers/use-passenger'
import { RootStackScreenProps } from '@navigation/types'
import { DrawerActions } from '@react-navigation/native'
import { styled } from 'nativewind'
import { FC, useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type Props = RootStackScreenProps<'PassengerDetails'>

const StyledIcon = styled(MaterialIcons)

const PassengerDetailsScreen: FC<Props> = ({ navigation, route }) => {
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

    if (passenger.photo_url !== null && avatarUrl === null) {
      getAvatarUrl(passenger.photo_url).then((url) => {
        setAvatarUrl(url)
      })
    }
  }, [isLoading, passenger])

  const goToDriverProfile = (): void => {
    navigation.navigate('DriverNavigation')
  }

  const { ride, isLoading: isLoadingPassengerRide } = useCurrentPassengerRide()
  useEffect(() => {
    if (isLoadingPassengerRide) {
      return
    }

    if (ride !== undefined) {
      navigation.replace('PassengerRideDetails')
    }
  }, [isLoadingPassengerRide, ride])

  const isLoadingData = isLoading || isLoadingPassengerRide

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerRight: () => (
        <Pressable onPress={goToDriverProfile}>
          <StyledIcon
            name="motorcycle"
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
      headerTitle: () => <View />,
      header: (props) => {
        const HeaderRight = props.options.headerRight as FC
        const HeaderLeft = props.options.headerLeft as FC
        const HeaderTitle = props.options.headerTitle as FC
        return (
          <View className="flex flex-row px-3 py-12 pb-2 justify-between items-center border border-b-neutral-300 dark:border-b-neutral-600 dark:bg-black">
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
  }, [navigation])

  return (
    <KeyboardAwareScrollView>
      <View className="flex">
        <View className="py-3">
          <View className="flex flex-col flex-grow px-3 justify-center space-y-4">
            <View className="basis-1/4 justify-center">
              <View>
                {isLoadingData && (
                  <Text className="text-sm text-center text-gray-500 dark:text-gray-400">
                    Cargando...
                  </Text>
                )}
                {error !== null && (
                  <Text className="dark:text-white">{error.message}</Text>
                )}

                {passenger !== undefined && (
                  <View className="flex flex-col space-y-2">
                    {avatarUrl !== null
                      ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-24 h-24 rounded-full mx-auto"
                      />
                        )
                      : (
                      <View className="w-24 h-24 rounded-full mx-auto bg-gray-200" />
                        )}
                    <View>
                      <Text className="text-xl text-center mb-1 dark:text-white">
                        {passenger.name}
                      </Text>
                      <Text className="text-md text-center text-gray-500 dark:text-gray-400">
                        {passenger.phone}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View className="basis-3/4 justify-center">
              <View className="flex px-2">
                <RegisterRideRequestForm
                  navigation={navigation}
                  route={route}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default PassengerDetailsScreen
