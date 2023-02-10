import { FC, PropsWithChildren } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View } from 'react-native'

const SafeAreaInsetsView: FC<PropsWithChildren> = ({ children }) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={{
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right
    }}>
      {children}
    </View>
  )
}

export default SafeAreaInsetsView
