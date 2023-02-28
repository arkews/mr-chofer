import { FC, ReactNode, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
  title: string

  children: ReactNode
}

const Collapsible: FC<Props> = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <View>
      <Pressable
        onPress={() => {
          setCollapsed((prev) => !prev)
        }}
        className="px-3 py-2 rounded-lg active:bg-gray-50"
      >
        <Text className="text-base text-center justify-center font-medium text-gray-500 dark:text-gray-400">
          {title}
        </Text>
      </Pressable>
      {collapsed && (
        <View className="flex flex-col space-y-4 pt-2">
          {children}
        </View>
      )}
    </View>
  )
}

export default Collapsible
