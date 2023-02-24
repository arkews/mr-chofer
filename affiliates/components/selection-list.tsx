import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import useAffiliates from '../hooks/use-affiliates'
import { Affiliate } from '../types'

type Props = {
  onSelect: (affiliate: Affiliate) => void
}

const AffiliateSelectionList: FC<Props> = ({ onSelect }) => {
  const { affiliates, isLoading } = useAffiliates()

  return (
    <View className="flex flex-col space-y-2">
      <View>
        <Text className="text-base font-medium text-gray-900 dark:text-gray-200">
          Aprovecha nuestras alianzas
        </Text>
      </View>

      <View className="flex flex-col space-y-2">
        {isLoading && (
          <View className="flex flex-col items-center justify-center">
            <Text className="font-medium text-gray-900 dark:text-gray-200">
              Cargando...
            </Text>
          </View>
        )}
        {affiliates?.map((affiliate, key) => (
          <View key={key}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onSelect(affiliate)
              }}
            >
              <View className="flex flex-col bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 p-4">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {affiliate.name}
                  </Text>
                  <Text className="text-base text-gray-600 dark:text-gray-400">
                    {affiliate.address}
                  </Text>
                </View>

                <View className="flex flex-row items-center justify-between">
                  <Text className="text-md text-green-600 dark:text-green-400">
                    Descuento:{' '}
                    {Intl.NumberFormat('es', {
                      style: 'currency',
                      currency: 'COP',
                      maximumSignificantDigits: 1
                    }).format(affiliate.discount_value)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  )
}

export default AffiliateSelectionList
