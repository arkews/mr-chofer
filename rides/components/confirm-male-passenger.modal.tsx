import { FC } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

type Props = {
  open: boolean

  onClose: () => void
}

const ConfirmMalePassengerModal: FC<Props> = ({ open, onClose }) => {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="absolute bottom-0 w-full">
        <View className="flex items-center justify-center px-3 pb-2">
          <View className="w-full p-4 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700">
            <View className="flex flex-col space-y-5">
              <View className="justify-center">
                <Text className="text-xl text-center font-medium text-gray-900 dark:text-gray-200">
                  Parrillero hombre está vigente. La multa es de 15 salarios
                  mínimos y usted exonera a MrChoffer de cualquier
                  responsabilidad al aceptar la solicitud.
                </Text>
              </View>

              <View>
                <Pressable
                  onPress={() => {
                    onClose()
                  }}
                  className="px-5 py-3 bg-green-100 rounded-lg active:bg-green-200 shadow-none"
                >
                  <Text className="text-base text-green-900 text-center font-medium">
                    Acepto
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ConfirmMalePassengerModal
