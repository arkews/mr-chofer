import React, { FC, useEffect } from 'react'
import { useAuth } from '../../auth/context'
import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpWithPassword } from '../../auth'
import { useMutation } from '@tanstack/react-query'
import { Pressable, Text, TextInput, View } from 'react-native'
import Checkbox from 'expo-checkbox'
import cn from 'classnames'

const SignUpSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Debe tener al menos 8 caracteres'),
  passwordConfirmation: z.string().min(8, 'Debe tener al menos 8 caracteres'),
  acceptTerms: z.boolean().refine(v => v, {
    message: 'Debes aceptar los términos y condiciones'
  })
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirmation']
})

type SignUpData = z.infer<typeof SignUpSchema>

const SignUpScreen: FC = () => {
  const { session } = useAuth()

  useEffect(() => {
    if (session != null) {
      console.log(session.user.email)
    }
  }, [session])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema)
  })

  const { mutate, isLoading, error } = useMutation(signUpWithPassword)

  const onSubmit: SubmitHandler<SignUpData> = data => {
    mutate(data)
  }

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
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting && !isLoading}
              secureTextEntry={true}
              className={
                cn('border text-lg px-4 py-3 mt-2 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            {(errors.password != null) &&
              <Text
                className="text-red-500 mt-2">{errors.password.message}</Text>}
          </View>
        )}
        name="password"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-6">
            <Text className="mb-2 dark:text-white">Confirmar contraseña</Text>
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting && !isLoading}
              secureTextEntry={true}
              className={
                cn('border text-lg px-4 py-3 mt-2 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            {(errors.passwordConfirmation != null) &&
              <Text
                className="text-red-500 mt-2">{errors.passwordConfirmation.message}</Text>}
          </View>
        )}
        name="passwordConfirmation"
      />

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="mt-6 flex">
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

            {(errors.acceptTerms != null) &&
              <Text
                className="text-red-500 mt-2">{errors.acceptTerms.message}</Text>}
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

      <Text className="text-blue-400">
        ¿Ya tienes una cuenta? Inicia sesión
      </Text>

    </View>
  )
}

export default SignUpScreen
