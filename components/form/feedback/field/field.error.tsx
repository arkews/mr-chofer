import { FC } from 'react'
import { Text } from 'react-native'

type Props = {
  message?: string
}

const FieldError: FC<Props> = ({ message }) => {
  return (
    <Text
      className="text-red-600 text-xs font-medium mt-1 dark:text-red-500">
      {message}
    </Text>
  )
}

export default FieldError
