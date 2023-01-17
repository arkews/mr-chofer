import { FC, useEffect } from 'react'
import { Text, View } from 'react-native'
import { useAuth } from '../auth/context'
import { RootStackScreenProps } from '../navigation/types'

type Props = RootStackScreenProps<'Home'>

const HomeScreen: FC<Props> = ({ navigation }) => {
  const { session, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (session === null) {
      navigation.replace('SignIn')
      return
    }

    navigation.replace('RoleSelection')
  }, [session, isLoading])

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      <Text
        className="text-4xl text-center dark:text-white">Bienvenido</Text>
      <Text
        className="text-gray-500 text-base text-center mb-10 dark:text-gray-400">
        Estamos verificando tu sesión...
      </Text>
    </View>
  )
}

export default HomeScreen
