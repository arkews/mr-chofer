import AffiliateSelectionList from '@base/affiliates/components/selection-list'
import { Affiliate } from '@base/affiliates/types'
import Input from '@base/components/form/input'
import { FC } from 'react'
import { Modal, ScrollView, Text, View } from 'react-native'

type Props = {
  open: boolean

  onClose: (destination: string, affiliateId?: string) => void
}

const DestinationModal: FC<Props> = ({ open, onClose }) => {
  const handleSelect = (affiliate: Affiliate) => {
    onClose(affiliate.address, affiliate.id)
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={() => {
        onClose('')
      }}
    >
      <View className="min-h-screen py-3 flex flex-col flex-1 flex-grow bg-white dark:bg-black">
        <View>
          <ScrollView className="flex w-full px-3 mx-auto space-y-3">
            <View className="mb-3">
              <Text className="text-2xl font-medium text-center text-gray-900 dark:text-gray-200">
                ¿A dónde quieres ir?
              </Text>
            </View>

            <View>
              <Input
                name="destination"
                placeholder="Destino"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={(e) => {
                  onClose(e.nativeEvent.text)
                }}
              />
            </View>

            <View className="pt-3">
              <AffiliateSelectionList onSelect={handleSelect} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

export default DestinationModal
