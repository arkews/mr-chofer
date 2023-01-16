import { FC, useEffect } from 'react'
import { Text, View } from 'react-native'
import { useAuth } from '../auth/context'
import { RootStackScreenProps } from '../navigation/types'

type Props = RootStackScreenProps<'Home'>

const HomeScreen: FC<Props> = ({ navigation }) => {
  const { session } = useAuth()

  useEffect(() => {
    if (session === null) {
      navigation.navigate('SignIn')
    }
  }, [session])

  return (
    <View className="flex flex-grow w-full px-7 justify-center mx-auto space-y-7">
      {
        session !== null && (
          <>
            <Text className="dark:text-white">{session.user.email}</Text>
            <Text className="dark:text-white">{session.user.role}</Text>
          </>
        )
      }
    </View>
  )
}

export default HomeScreen
