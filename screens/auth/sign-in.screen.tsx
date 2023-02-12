import { signInWithPassword } from '@base/auth'
import SafeAreaInsetsView from '@base/components/view/safe-area-insets.view'
import FieldError from '@components/form/feedback/field/field.error'
import Input from '@components/form/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { RootStackScreenProps } from '@navigation/types'
import { useMutation } from '@tanstack/react-query'
import cn from 'classnames'
import Checkbox from 'expo-checkbox'
import { FC, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { z } from 'zod'

const SignInSchema = z.object({
  email: z
    .string({ required_error: 'Email requerido' })
    .email('Email invalido'),
  password: z
    .string({ required_error: 'Contraseña requerida' })
    .min(8, 'Debe tener al menos 8 caracteres')
})

type SignInData = z.infer<typeof SignInSchema>

type Props = RootStackScreenProps<'SignIn'>

const SignInScreen: FC<Props> = ({ navigation }) => {
  const form = useForm<SignInData>({
    resolver: zodResolver(SignInSchema)
  })

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = form

  const { mutate, isLoading, error } = useMutation(signInWithPassword)

  const onSubmit: SubmitHandler<SignInData> = async (data) => {
    mutate(data)
  }

  const goToSignUp = (): void => {
    navigation.replace('SignUp')
  }

  const [showPassword, setShowPassword] = useState(false)

  const isDisabled = isSubmitting || isLoading

  return (
    <SafeAreaInsetsView>
      <FormProvider {...form}>
        <View className="min-h-screen py-3 flex flex-col flex-1 flex-grow justify-center">
          <View>
            <ScrollView className="flex flex-grow w-full px-3 mx-auto space-y-3">
              <View>
                <Input
                  name="email"
                  label="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  enablesReturnKeyAutomatically
                  accessibilityLabel="Email"
                  accessibilityHint="Ingrese su email"
                  accessibilityRole="text"
                  accessibilityState={{ disabled: isDisabled }}
                  accessibilityValue={{ text: 'Email' }}
                  disabled={isDisabled}
                />
              </View>

              <View>
                <Input
                  name="password"
                  label="Contraseña"
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  enablesReturnKeyAutomatically
                  accessibilityLabel="Contraseña"
                  accessibilityHint="Ingrese su contraseña"
                  accessibilityRole="text"
                  accessibilityState={{ disabled: isDisabled }}
                  accessibilityValue={{ text: 'Contraseña' }}
                  disabled={isDisabled}
                />

                <View className="flex flex-row mt-3 items-center">
                  <Checkbox
                    value={showPassword}
                    onValueChange={setShowPassword}
                    disabled={isDisabled}
                    color={showPassword ? '#2563eb' : undefined}
                    accessibilityLabel="Mostrar contraseña"
                    accessibilityHint="Marque para mostrar la contraseña"
                    accessibilityRole="checkbox"
                    accessibilityState={{ disabled: isDisabled }}
                    accessibilityValue={{ text: 'Mostrar contraseña' }}
                    className={cn(
                      'rounded-md w-6 h-6 justify-center items-center'
                    )}
                  />

                  <Text className="block ml-2 font-medium text-gray-700 dark:text-gray-300">
                    Mostrar contraseña
                  </Text>
                </View>
              </View>

              {error != null && (
                <FieldError message="Credenciales inválidas, verifique su email y contraseña." />
              )}

              <View>
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  className={cn(
                    'text-base mt-4 px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
                    'active:bg-blue-800',
                    isDisabled &&
                      'bg-gray-300 text-gray-700 cursor-not-allowed',
                    isDisabled && 'dark:bg-gray-800 dark:text-gray-400'
                  )}
                  accessibilityLabel="Iniciar sesión"
                  accessibilityHint="Presione para iniciar sesión"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isDisabled }}
                  accessibilityValue={{ text: 'Iniciar sesión' }}
                  disabled={isDisabled}
                >
                  <Text className="text-base font-medium text-center text-white">
                    Iniciar sesión
                  </Text>
                </Pressable>
              </View>

              <View>
                <Text
                  className="text-blue-700 dark:text-blue-300 text-center"
                  onPress={goToSignUp}
                >
                  ¿No estás registrado? Registrate
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </FormProvider>
    </SafeAreaInsetsView>
  )
}

export default SignInScreen
