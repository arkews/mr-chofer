import Input from '@base/components/form/input'
import { paymentOptions } from '@base/constants/payment-options'
import { useConfig } from '@base/shared/configuration'
import { MaterialIcons } from '@expo/vector-icons'
import cn from 'classnames'
import { styled } from 'nativewind'
import { FC } from 'react'
import { useFormContext } from 'react-hook-form'
import { Modal, Pressable, Text, View } from 'react-native'
import { RegisterRideRequest } from '../schema'

type Props = {
  open: boolean

  onClose: (offeredPrice: number, paymentMethod: string) => void
}

const StyledIcon = styled(MaterialIcons)

const OfferedPriceModal: FC<Props> = ({ open, onClose }) => {
  const { watch, setValue } = useFormContext<RegisterRideRequest>()
  const gender = watch('gender')
  const { config: minimunFare } = useConfig(
    gender === 'Male' ? 'MINIMUM_MALE_FARE' : 'MINIMUM_FEMALE_FARE'
  )

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={() => {
        onClose(0, '')
      }}
    >
      <View className="min-h-screen bg-black/30 dark:bg-black/60"></View>
      <View className="absolute bottom-0 w-full">
        <View className="flex items-center justify-center px-1 pb-1">
          <View className="w-full p-4 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700">
            <View className="flex flex-col space-y-5">
              <View>
                <Text className="text-xl font-medium text-center text-gray-900 dark:text-gray-200">
                  ¿Cuál es tu precio?
                </Text>
              </View>

              <View>
                <Input
                  name="offered_price"
                  placeholder="Precio ofrecido"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  onSubmitEditing={(e) => {
                    onClose(Number(e.nativeEvent.text), 'cash')
                  }}
                />

                {minimunFare !== undefined &&
                  minimunFare !== null &&
                  Number(minimunFare.value) > 0 && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      La tarifa mínima es de{' '}
                      {Number(minimunFare.value).toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'COP'
                      })}
                    </Text>
                )}
              </View>

              <View className="flex flex-col space-y-2">
                {paymentOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setValue('payment_method', option.value)
                    }}
                    className={cn(
                      'flex flex-row items-center space-x-2 border-2 border-gray-300 rounded-lg p-3',
                      option.value === watch('payment_method') &&
                        'border-blue-500'
                    )}
                  >
                    <StyledIcon name="attach-money" size={20} color="#9CA3AF" />
                    <Text className="text-base font-bold text-gray-700 dark:text-gray-300">
                      {option.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className='flex flex-row justify-end pt-2'>
                <Pressable
                  onPress={() => {
                    onClose(
                      Number(watch('offered_price')),
                      watch('payment_method')
                    )
                  }}
                  className="flex justify-end items-end px-2 w-full rounded-lg basis-1/2"
                >
                  <Text className="text-base font-medium text-blue-500">
                    Enviar oferta
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

export default OfferedPriceModal
