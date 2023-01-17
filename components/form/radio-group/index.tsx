import React, { FC } from 'react'
import { Pressable, Text, View } from 'react-native'
import cn from 'classnames'

export type RadioValue = {
  title?: string
  value: string
}

type Props = {
  values: RadioValue[]
  selected: string
  onSelect: (value: string) => void
}

const RadioGroup: FC<Props> = ({ values, selected, onSelect }) => {
  return (
    <View className="flex flex-row space-x-3">
      {
        values.map((item) => (
          <Pressable
            key={item.value}
            className={cn('px-2 py-1.5 border border-gray-300 rounded-lg dark:border-gray-100', selected === item.value && 'bg-blue-100 border-transparent')}
            onPress={() => { onSelect(item.value) }}>
            <Text className={cn('dark:text-white text-xs', selected === item.value && 'text-blue-800')}>
              {item.title ?? item.value}
            </Text>
          </Pressable>
        ))
      }
    </View>
  )
}

export default RadioGroup
