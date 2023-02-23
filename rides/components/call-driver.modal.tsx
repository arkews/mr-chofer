import { MaterialIcons } from '@expo/vector-icons'
import { styled } from 'nativewind'
import { FC } from 'react'
import { Linking, Modal, Pressable, Text, View } from 'react-native'

const StyledIcon = styled(MaterialIcons)

type Props = {
  open: boolean
  phone: string

  onClose: () => void
}

const CallDriverModal: FC<Props> = ({ open, phone, onClose }) => {
  const performPhoneCall = async () => {
    await Linking.openURL(`tel:${phone}`)
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={() => {
        onClose()
      }}
    >
      <View className="absolute bottom-0 w-full">
        <View className="flex items-center justify-center px-3 pb-28">
          <View className="w-full p-4 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700">
            <View className="flex flex-col space-y-5">
              <View className="justify-center">
                <Text className="text-xl text-center font-medium text-gray-900 dark:text-gray-200">
                  ¿Estás de afán?
                </Text>
              </View>

              <View className="justify-center">
                <Text className="text-base text-center text-gray-600 dark:text-gray-400">
                  Pregúntale al conductor por dónde viene.
                </Text>
              </View>

              <View className="flex flex-row justify-around space-x-2">
                <View className="basis-3/4">
                  <Pressable
                    onPress={async () => {
                      await performPhoneCall()
                      onClose()
                    }}
                    className="px-5 py-3 bg-green-100 rounded-lg active:bg-green-200 shadow-none"
                  >
                    <Text className="text-base text-green-900 text-center font-medium">
                      Llamar
                    </Text>
                  </Pressable>
                </View>
                <View className="basis-1/4">
                  <Pressable
                    onPress={onClose}
                    className="px-5 items-center py-3 bg-red-100 rounded-lg active:bg-red-200 shadow-none dark:bg-red-200"
                  >
                    <StyledIcon
                      name="close"
                      size={24}
                      className="text-red-700 dark:text-red-500"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default CallDriverModal
