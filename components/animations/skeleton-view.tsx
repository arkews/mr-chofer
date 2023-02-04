import React, { FC } from 'react'
import { View } from 'react-native'
import Skeleton from '@components/animations/skeleton'

type Props = {
  amount: number
}

const SkeletonView: FC<Props> = ({ amount }) => {
  return (
    <View className="flex flex-col space-y-2">
      {
        Array.from(Array(amount).keys()).map((_, index) => (
          <View key={index}>
            <Skeleton/>
          </View>
        ))
      }
    </View>
  )
}

export default SkeletonView
