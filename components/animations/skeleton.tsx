import { FC, useEffect, useRef } from 'react'
import { Animated, Easing, useColorScheme, View } from 'react-native'
import colors from 'tailwindcss/colors'

const Skeleton: FC = () => {
  const animation = useRef(new Animated.Value(0)).current

  const scheme = useColorScheme()
  const initialColor = scheme === 'dark' ? colors.gray[800] : colors.gray[200]
  const finalColor = scheme === 'dark' ? colors.gray[700] : colors.gray[300]

  const backgroundInterpolation = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [initialColor, finalColor, initialColor]
  })

  const opacityInterpolation = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 1]
  })

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
        isInteraction: false
      })
    ).start()
  }, [])

  return (
    <View className="h-7 rounded">
      <Animated.View
        className="h-full w-full rounded"
        style={{
          backgroundColor: backgroundInterpolation,
          opacity: opacityInterpolation
        }}/>
    </View>
  )
}

export default Skeleton
