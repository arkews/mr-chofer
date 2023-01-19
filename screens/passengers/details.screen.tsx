import { FC, useEffect, useState } from 'react'
import { RootStackScreenProps } from '@navigation/types'
import { getAvatarUrl } from '@base/supabase/storage'
import usePassenger from '@hooks/passengers/use-passenger'
import { Image, Text, View } from 'react-native'

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

    getAvatarUrl(passenger.photo_url)
      .then(url => {
        setAvatarUrl(url)
      })
  }, [isLoading, passenger])

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {isLoading && <Text>Loading...</Text>}
      {error !== null && <Text>{error.message}</Text>}
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
            <Text className="text-xl text-center mb-7 dark:text-white">
              {passenger.name}
            </Text>
            <Text className="text-xl text-center mb-7 dark:text-white">
              {passenger.phone}
            </Text>
          </View>
        )
      }
    </View>
  )
}

export default PassengerDetailsScreen
