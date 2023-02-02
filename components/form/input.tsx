import { Text, TextInput, TextInputProps, View } from 'react-native'
import {
  useController,
  UseControllerProps,
  useFormContext
} from 'react-hook-form'
import { FC } from 'react'
import cn from 'classnames'
import FieldError from '@components/form/feedback/field/field.error'

type Props = TextInputProps & UseControllerProps & {
  label?: string
  name: string
  defaultValue?: string

  disabled?: boolean
}

const Input: FC<Props> = (props) => {
  const {
    label,
    name,
    rules,
    disabled = false,
    defaultValue,
    ...rest
  } = props

  const { formState: { errors } } = useFormContext()
  const { field: { onChange, onBlur, value } } = useController({
    name,
    rules,
    defaultValue
  })

  const hasError = errors[name] !== undefined

  return (
    <View>
      {
        label !== undefined &&
        <Text className="font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      }

      <TextInput
        onBlur={onBlur}
        onChangeText={onChange}
        editable={!disabled}
        value={`${value as string ?? ''}`}
        className={
          cn('border text-lg px-4 py-3 mt-1 rounded-lg bg-neutral-100 border-neutral-400 text-gray-900 border-[1px]',
            'focus:border-blue-600 focus:ring-0 ',
            'dark:text-white dark:bg-neutral-900 dark:border-neutral-700',
            disabled && 'bg-neutral-200 text-neutral-400 cursor-not-allowed',
            disabled && 'dark:bg-neutral-800 dark:text-neutral-500')
        }
        {...rest}
      />

      {(hasError) &&
        <FieldError message={errors[name]?.message as string}/>
      }
    </View>
  )
}

export default Input
