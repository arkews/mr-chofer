import { getAvatarUrl } from '@base/supabase/storage'
import { FC, useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { Affiliate } from '../types'

type Props = {
  affiliate: Affiliate

  onSelect: () => void
}

const AffiliateCard: FC<Props> = ({ affiliate, onSelect }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (affiliate.avatar_url !== '') {
      getAvatarUrl(affiliate.avatar_url).then((url) => {
        setAvatarUrl(url)
      })
    }
  }, [affiliate])

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          onSelect()
        }}
      >
        <View className="flex flex-row items-center space-x-2">
          <View className="basis-1/6">
            {avatarUrl !== null
              ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-14 h-14 rounded-full mx-auto"
              />
                )
              : (
              <View className="w-14 h-14 rounded-full mx-auto bg-gray-200" />
                )}
          </View>
          <View className="basis-4/5">
            <View className="flex flex-col bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 p-4">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                  {affiliate.name}
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
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default AffiliateCard
