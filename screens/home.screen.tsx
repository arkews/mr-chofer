import { FC, useEffect } from 'react'
import { Text, View } from 'react-native'
import { useAuth } from '@base/auth/context'
import { RootStackScreenProps } from '@navigation/types'
import usePassenger from '@hooks/passengers/use-passenger'

type Props = RootStackScreenProps<'Home'>

const HomeScreen: FC<Props> = ({ navigation }) => {
  const { session, isLoading: isLoadingSession } = useAuth()
  const { passenger, isLoading: isLoadingPassenger } = usePassenger()

  useEffect(() => {
    if (isLoadingSession) {
      return
    }

    if (session === null) {
      navigation.replace('SignIn')
      return
    }

    if (isLoadingPassenger) {
      return
    }

    if (passenger !== null) {
      navigation.replace('PassengerDetails')
      return
    }

    navigation.replace('RegisterPassenger')
  }, [session, isLoadingSession, passenger, isLoadingPassenger])

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
