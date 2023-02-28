import { FC } from 'react'
import { Text, View } from 'react-native'
import useAffiliates from '../hooks/use-affiliates'
import { Affiliate } from '../types'
import AffiliateCard from './card'

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
          <AffiliateCard
            affiliate={affiliate}
            onSelect={() => {
              onSelect(affiliate)
            }}
            key={key}
          />
        ))}
      </View>
    </View>
  )
}

export default AffiliateSelectionList
