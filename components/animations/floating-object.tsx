import { FC, PropsWithChildren, useState } from 'react'
import { Animated, Easing, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

const FloatingObject: FC<PropsWithChildren> = ({ children }) => {
  const [animation] = useState(new Animated.Value(0))
  const x = animation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 5, 7, 5, 0]
  })

  const y = animation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 10, 15, 10, 0]
  })

  const floatingStyles = {
    transform: [
      {
        translateX: x
      },
      {
        translateY: y
      }
    ]
  }

  const animate = () => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        isInteraction: false,
        duration: 4000,
        easing: Easing.elastic(3),
        useNativeDriver: true
      })
    ).start()
  }

  useFocusEffect(animate)

  return (
    <View className="flex flex-row justify-center">
      <Animated.View style={[floatingStyles]}>
        {children}
      </Animated.View>
    </View>
  )
}

export default FloatingObject
