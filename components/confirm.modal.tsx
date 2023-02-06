import React, { FC } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

type Props = {
  open: boolean
  title: string
  message?: string

  onClosed: (confirmed: boolean) => void
}

const ConfirmModal: FC<Props> = ({ open, title, message, onClosed }) => {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={() => {
        onClosed(false)
      }}>
      <View className="flex flex-col justify-center flex-grow px-2">
        <View
          className="w-full py-3 px-4 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700">
          <View
            className="flex flex-col space-y-3">
            <View className="justify-center">
              <Text
                className="text-xl font-medium text-gray-900 dark:text-gray-200">
                {title}
              </Text>
            </View>

            {
              message !== undefined && (
                <View className="justify-center">
                  <Text
                    className="text-base font-medium text-gray-600 dark:text-gray-400">
                    {message}
                  </Text>
                </View>
              )
            }

            <View className="flex flex-row justify-around space-x-2">
              <View className="basis-1/2">
                <Pressable
                  onPress={() => {
                    onClosed(true)
                  }}
                  className="px-5 py-3 w-full bg-green-100 rounded-lg active:bg-green-200 shadow-none">
                  <Text
                    className="text-base text-green-900 text-center font-medium">
                    Sí! Estoy seguro
                  </Text>
                </Pressable>
              </View>
              <View className="basis-1/2">
                <Pressable
                  onPress={() => {
                    onClosed(false)
                  }}
                  className="px-5 py-3 rounded-lg active:bg-red-50 shadow-none">
                  <Text
                    className="text-base text-red-700 text-center">
                    No, cancelar
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

export default ConfirmModal
