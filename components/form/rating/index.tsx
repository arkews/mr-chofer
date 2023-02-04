import { FC, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { styled } from 'nativewind'
import { MaterialIcons } from '@expo/vector-icons'
import cn from 'classnames'

type Props = {
  onChange: (rating: number) => void
}

const StyledIcon = styled(MaterialIcons)

const Rating: FC<Props> = ({ onChange }) => {
  const [rating, setRating] = useState(4)
  const [maxRating] = useState([1, 2, 3, 4, 5])

  const handleChangeRating = (item: number) => {
    setRating(item)
    onChange(item)
  }

  return (
    <View className="flex flex-row space-x-2 justify-center">
      {
        maxRating.map((item, key) => (
          <View key={key}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                handleChangeRating(item)
              }}>
              <StyledIcon
                name="star"
                size={50}
                className={
                  cn('text-neutral-400 dark:text-neutral-300',
                    item <= rating && 'text-yellow-400 dark:text-yellow-300')
                }
              />
            </TouchableOpacity>
          </View>
        ))
      }
    </View>
  )
}

export default Rating
