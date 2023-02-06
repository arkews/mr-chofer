import { FC } from 'react'
import { Linking, Modal, Pressable, Text, View } from 'react-native'

type Props = {
  open: boolean

  onClose: (confirmed: boolean) => void
}

const ConfirmVehicleContractModal: FC<Props> = ({ open, onClose }) => {
  const goToVehicleContract = async () => {
    if (process.env.VEHICLE_LEASING_CONTRACT_URL !== undefined) {
      const canOpen = await Linking.canOpenURL(process.env.VEHICLE_LEASING_CONTRACT_URL)
      if (canOpen) {
        await Linking.openURL(process.env.VEHICLE_LEASING_CONTRACT_URL)
      }
    }
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={() => {
        onClose(false)
      }}>
      <View className="absolute bottom-0 w-full">
        <View className="flex items-center justify-center px-3 pb-2">
          <View
            className="w-full p-4 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700">
            <View
              className="flex flex-col space-y-5">
              <View className="justify-center">
                <Text
                  className="text-base font-medium text-gray-900 dark:text-gray-200">
                  Al acceder aceptas celebrar el contrato de arrendamiento de
                  vehículo con arrendador y declaras y garantizas que conoces su
                  contenido.
                </Text>
              </View>

              <View className="mb-3">
                <Pressable onPress={goToVehicleContract}>
                  <Text
                    className="block text-base font-medium text-blue-700 dark:text-blue-300 underline">
                    Leer contrato
                  </Text>
                </Pressable>
              </View>

              <View>
                <Text
                  className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  Recuerda que puedes elegir la ruta que desees.
                </Text>
              </View>

              <View>
                <Pressable
                  onPress={() => {
                    onClose(true)
                  }}
                  className="px-5 py-3 bg-green-100 rounded-lg active:bg-green-200 shadow-none">
                  <Text
                    className="text-base text-green-900 text-center font-medium">
                    Estoy de acuerdo
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

export default ConfirmVehicleContractModal
