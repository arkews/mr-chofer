import { FC, useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import useDriver from '@hooks/drivers/use-driver'
import { RootStackScreenProps } from '@navigation/types'
import { getAvatarUrl } from '@base/supabase/storage'

type Props = RootStackScreenProps<'DriverDetails'>

const DriverDetailsScreen: FC<Props> = ({ navigation }) => {
  const { driver, isLoading, error } = useDriver()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (driver === null || driver === undefined) {
      navigation.replace('RoleSelection')
      return
    }

    getAvatarUrl(driver.photo_url)
      .then(url => {
        setAvatarUrl(url)
      })
  }, [isLoading, driver])

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {isLoading && <Text>Loading...</Text>}
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
              <View className="w-32 h-32 rounded-full mx-auto bg-gray-200" />
                )
          }
          <Text className="text-xl text-center mb-7 dark:text-white">
            {driver.name}
          </Text>
          <Text className="text-xl text-center mb-7 dark:text-white">
            {driver.phone}
          </Text>
        </View>
      )}
    </View>
  )
}

export default DriverDetailsScreen
