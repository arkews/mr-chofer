import { FC, useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useAuth } from '@base/auth/context'
import { RootStackScreenProps } from '@navigation/types'

type Props = RootStackScreenProps<'RoleSelection'>

const RoleSelectionScreen: FC<Props> = ({ navigation }) => {
  const { session } = useAuth()

  useEffect(() => {
    if (session === null) {
      navigation.navigate('SignIn')
    }
  }, [session])

  const goToRegisterDriver = (): void => {
    navigation.navigate('RegisterDriver')
  }

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {
        session !== null && (
          <>
            <Text
              className="text-4xl text-center dark:text-white">Bienvenido</Text>
            <Text
              className="text-gray-500 text-base text-center mb-10 dark:text-gray-400">
              ¿Cómo quieres empezar a utilizar la aplicación?
            </Text>

            <View className="flex flex-col space-y-5 justify-around">
              <View className="basis">
                <Pressable
                  onPress={goToRegisterDriver}
                  className="text-base px-6 py-3.5 bg-blue-700 rounded-lg active:bg-blue-800">
                  <Text className="text-base text-white text-center">
                    Quiero ser conductor
                  </Text>
                </Pressable>
              </View>

              <View className="basis">
                <Pressable
                  className="px-6 py-3.5 bg-green-700 rounded-lg active:bg-green-800">
                  <Text className="text-base text-white text-center">
                    Quiero ser pasajero
                  </Text>
                </Pressable>
              </View>
            </View>

          </>
        )
      }
    </View>
  )
}

export default RoleSelectionScreen
