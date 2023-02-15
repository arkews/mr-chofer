import { FC } from 'react'
import { Linking, Modal, Pressable, Text, View } from 'react-native'

type Props = {
  open: boolean

  onClose: () => void
}

const ConfirmMalePassengerModal: FC<Props> = ({ open, onClose }) => {
  const goToMalePassengerContract = async () => {
    const canOpen = await Linking.canOpenURL(
      'https://www.valledupar-cesar.gov.co/Transparencia/Normatividad/DECRETO%20No.%20001050%20DE%2020%20DE%20DICIEMBRE%20DE%202022.pdf'
    )

    if (canOpen) {
      await Linking.openURL(
        'https://www.valledupar-cesar.gov.co/Transparencia/Normatividad/DECRETO%20No.%20001050%20DE%2020%20DE%20DICIEMBRE%20DE%202022.pdf'
      )
    }
  }

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
                  Al aceptar declaras conocer la existencia del parrillero
                  hombre en Valledupar y exhoneras a MrChoffer de cualquier
                  responsabilidad legal.
                </Text>
              </View>

              <View className="mb-3">
                <Pressable onPress={goToMalePassengerContract}>
                  <Text className="block text-base font-medium text-blue-700 dark:text-blue-300 underline">
                    Leer decreto
                  </Text>
                </Pressable>
              </View>

              <View>
                <Text className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  Recuerda que puedes elegir la solicitud que desees.
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
