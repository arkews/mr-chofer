import React, { FC, useState } from 'react'
import { View } from 'react-native'
import { styled } from 'nativewind'
import { MaterialIcons } from '@expo/vector-icons'
import cn from 'classnames'

const StyledIcon = styled(MaterialIcons)

type Props = {
  rating: number

  size?: number
}

const RatingView: FC<Props> = ({ rating, size }) => {
  const [maxRating] = useState([1, 2, 3, 4, 5])

  return (
    <View className="flex flex-row space-x-1 justify-center">
      {
        maxRating.map((item, key) => (
          <View key={key}>
            <StyledIcon
              name="star"
              size={size ?? 50}
              className={
                cn('text-neutral-400 dark:text-neutral-300',
                  item <= rating && 'text-yellow-400 dark:text-yellow-300')
              }
            />
          </View>
        ))
      }
    </View>
  )
}

export default RatingView
