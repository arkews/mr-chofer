import { FC, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import cn from 'classnames'
import { signInWithPassword } from '@base/auth'
import { useMutation } from '@tanstack/react-query'
import { RootStackScreenProps } from '@navigation/types'
import Checkbox from 'expo-checkbox'

const SignInSchema = z.object({
  email: z.string({ required_error: 'Email requerido' })
    .email('Email invalido'),
  password: z.string({ required_error: 'Contraseña requerida' })
    .min(8, 'Debe tener al menos 8 caracteres')
})

type SignInData = z.infer<typeof SignInSchema>

type Props = RootStackScreenProps<'SignIn'>

const SignInScreen: FC<Props> = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema)
  })

  const { mutate, isLoading, error } = useMutation(signInWithPassword)

  const onSubmit: SubmitHandler<SignInData> = async data => {
    mutate(data)
  }

  const goToSignUp = (): void => {
    navigation.replace('SignUp')
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <View
      className="flex flex-grow w-full px-7 justify-center mx-auto space-y-7">
      <Controller
        control={control}
        rules={{
          required: true
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text className="mb-2 dark:text-white">Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              enablesReturnKeyAutomatically
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting && !isLoading}
              className={
                cn('border text-lg px-4 py-3 mt-2 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            {(errors.email != null) &&
              <Text className="text-red-500">{errors.email.message}</Text>}
          </>
        )}
        name="email"
      />

      <Controller
        control={control}
        rules={{
          required: true
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-6">
            <Text className="mb-2 dark:text-white">Contraseña</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              enablesReturnKeyAutomatically
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting && !isLoading}
              secureTextEntry={!showPassword}
              className={
                cn('border text-lg px-4 py-3 mt-2 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            <View className="flex flex-row mt-2">
              <Checkbox
                value={showPassword}
                onValueChange={setShowPassword}
                disabled={isSubmitting || isLoading}
                color={showPassword ? '#2563eb' : undefined}
                className={
                  cn('rounded-md w-5 h-5')
                }/>

              <Text className="block mb-2 ml-2 text-sm dark:text-white">
                Mostrar contraseña
              </Text>
            </View>

            {(errors.password != null) &&
              <Text
                className="text-red-500 mt-2">{errors.password.message}</Text>}
          </View>
        )}
        name="password"
      />

      {error != null &&
        <Text className="text-red-500 text-xs">
          Credenciales inválidas, verifique su email y contraseña.
        </Text>
      }

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || isLoading}
        className={
          cn('text-base px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
            'active:bg-blue-800',
            (isSubmitting || isLoading) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
            (isSubmitting || isLoading) && 'dark:bg-gray-800 dark:text-gray-400')
        }
      >
        <Text
          className="text-base text-white font-medium text-center text-white">
          Iniciar sesión
        </Text>
      </Pressable>

      <Text className="text-blue-400" onPress={goToSignUp}>
        ¿No estás registrado? Registrate
      </Text>

    </View>
  )
}

export default SignInScreen
