import { signOut } from '@base/auth'
import { MaterialIcons } from '@expo/vector-icons'
import {
  DrawerContentComponentProps,
  DrawerContentScrollView
} from '@react-navigation/drawer'
import { useMutation } from '@tanstack/react-query'
import { styled } from 'nativewind'
import { FC } from 'react'
import { Linking, Text, TouchableOpacity, View } from 'react-native'

const StyledIcon = styled(MaterialIcons)

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
          className="flex flex-row justify-center items-center space-x-2 px-3 py-2 rounded-lg active:bg-gray-50"
          onPress={performSupport}
        >
          <StyledIcon
            name="help"
            className="text-2xl text-gray-500 dark:text-gray-400"
          />
          <Text className="text-base text-center justify-center font-medium text-gray-500 dark:text-gray-400">
            Soporte
          </Text>
        </TouchableOpacity>
      </View>

      <View className="p-5 border-t border-t-gray-300 dark:border-t-gray-600">
        <TouchableOpacity
          className="flex flex-row justify-center items-center space-x-2 px-3 py-2 border border-red-700 rounded-lg dark:border-red-500 active:border-red-900 dark:active:border-red-700"
          onPress={() => {
            props.navigation.closeDrawer()
            mutateSignOut()
          }}
          disabled={isLoadingSignOut}
        >
          <StyledIcon
            name="logout"
            className="text-2xl text-red-700 dark:text-red-500"
          />
          <Text className="text-base font-bold text-center text-red-700 dark:text-red-500">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CustomDrawer
