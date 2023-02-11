import { signOut } from '@base/auth'
import {
  DrawerContentComponentProps,
  DrawerContentScrollView
} from '@react-navigation/drawer'
import { useMutation } from '@tanstack/react-query'
import { FC } from 'react'
import { Linking, Text, TouchableOpacity, View } from 'react-native'

type Props = DrawerContentComponentProps

const CustomDrawer: FC<Props> = (props) => {
  const { mutate: mutateSignOut, isLoading: isLoadingSignOut } =
    useMutation(signOut)

  const performSupport = () => {
    Linking.openURL('https://wa.me/573157387465')
  }

  return (
    <View className="flex flex-1 px-2">
      <DrawerContentScrollView {...props}>
        <View className="flex">
          <View>
            <View>
              <Text className="text-2xl text-center justify-center font-medium text-gray-500 dark:text-gray-400">
                MrChoffer
              </Text>
            </View>
          </View>
        </View>
      </DrawerContentScrollView>

      <View className="p-5 border-t border-t-gray-300 dark:border-t-gray-600">
        <TouchableOpacity
          className="flex flex-row items-center justify-center"
          onPress={performSupport}
        >
          <Text className="text-base text-center justify-center font-medium text-gray-500 dark:text-gray-400">
            Soporte
          </Text>
        </TouchableOpacity>
      </View>

      <View className="p-5 border-t border-t-gray-300 dark:border-t-gray-600">
        <TouchableOpacity
          className="flex flex-row items-center justify-center"
          onPress={() => {
            props.navigation.closeDrawer()
            mutateSignOut()
          }}
          disabled={isLoadingSignOut}
        >
          <Text className="text-base text-center justify-center font-medium text-gray-500 dark:text-gray-400">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CustomDrawer
