import { FC, useState } from 'react'
import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpWithPassword } from '../../auth'
import { useMutation } from '@tanstack/react-query'
import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import Checkbox from 'expo-checkbox'
import cn from 'classnames'
import { RootStackScreenProps } from '@navigation/types'

const SignUpSchema = z.object({
  email: z.string({ required_error: 'Email requerido' })
    .email('Email invalido'),
  emailConfirmation: z.string({ required_error: 'Email requerido' })
    .email('Email invalido'),
  password: z.string({ required_error: 'Contraseña requerida' }).min(8, 'Debe tener al menos 8 caracteres'),
  passwordConfirmation: z.string({ required_error: 'Contraseña requerida' })
    .min(8, 'Debe tener al menos 8 caracteres'),
  acceptTerms: z.boolean({ required_error: 'Debes aceptar los términos y condiciones' })
    .refine(v => v, {
      message: 'Debes aceptar los términos y condiciones'
    })
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirmation']
}).refine(data => data.email === data.emailConfirmation, {
  message: 'Los emails no coinciden',
  path: ['emailConfirmation']
})

type SignUpData = z.infer<typeof SignUpSchema>

type Props = RootStackScreenProps<'SignUp'>

const SignUpScreen: FC<Props> = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema)
  })

  const { mutate, isLoading, error } = useMutation(signUpWithPassword, {
    onSuccess: () => {
      navigation.navigate('SignIn')
    }
  })

  const onSubmit: SubmitHandler<SignUpData> = data => {
    mutate(data)
  }

  const goToSignIn = (): void => {
    navigation.replace('SignIn')
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <KeyboardAvoidingView>
      <View className="py-36">
        <View
          className="flex flex-grow w-full px-7 justify-center mx-auto space-y-5">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Email</Text>
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

                {(errors.email !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.email.message}
                  </Text>}
              </View>
            )}
            name="email"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mt-5">
                <Text className="dark:text-white">Confirmar email</Text>
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

                {(errors.emailConfirmation !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.emailConfirmation.message}
                  </Text>}
              </View>
            )}
            name="emailConfirmation"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mt-5">
                <Text className="dark:text-white">Contraseña</Text>
                <TextInput
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

                {(errors.password !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.password.message}
                  </Text>}

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
              </View>
            )}
            name="password"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mt-5">
                <Text className="dark:text-white">Confirmar contraseña</Text>
                <TextInput
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

                {(errors.passwordConfirmation !== undefined) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">
                    {errors.passwordConfirmation.message}
                  </Text>}
              </View>
            )}
            name="passwordConfirmation"
          />

          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mt-5 flex">
                <View className="flex flex-row">
                  <Checkbox
                    value={value}
                    onValueChange={onChange}
                    disabled={isSubmitting || isLoading}
                    color={value ? '#2563eb' : undefined}
                    className={
                      cn('rounded-md w-5 h-5')
                    }/>

                  <Text className="block mb-2 ml-3 text-sm dark:text-white">
                    Acepto los términos y condiciones de uso.
                  </Text>
                </View>

                {(errors.acceptTerms !== undefined) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">
                    {errors.acceptTerms.message}
                  </Text>}
              </View>
            )}
            name="acceptTerms"
          />

          {error != null &&
            <Text className="text-red-500 text-xs">
              Error al crear la cuenta
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
              Crear cuenta
            </Text>
          </Pressable>

          <Text className="text-blue-400" onPress={goToSignIn}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Text>

        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default SignUpScreen
