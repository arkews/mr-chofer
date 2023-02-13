import SafeAreaInsetsView from '@base/components/view/safe-area-insets.view'
import FieldError from '@components/form/feedback/field/field.error'
import Input from '@components/form/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { RootStackScreenProps } from '@navigation/types'
import { AuthError } from '@supabase/supabase-js'
import { useMutation } from '@tanstack/react-query'
import cn from 'classnames'
import Checkbox from 'expo-checkbox'
import Constants from 'expo-constants'
import { FC, useEffect, useState } from 'react'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm
} from 'react-hook-form'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { z } from 'zod'
import { signUpWithPassword } from '../../auth'

const SignUpSchema = z
  .object({
    email: z
      .string({ required_error: 'Email requerido' })
      .email('Email invalido'),
    emailConfirmation: z
      .string({ required_error: 'Email requerido' })
      .email('Email invalido'),
    password: z
      .string({ required_error: 'Contraseña requerida' })
      .min(8, 'Debe tener al menos 8 caracteres'),
    passwordConfirmation: z
      .string({ required_error: 'Contraseña requerida' })
      .min(8, 'Debe tener al menos 8 caracteres'),
    acceptTerms: z
      .boolean({ required_error: 'Debes aceptar los términos y condiciones' })
      .refine((v) => v, {
        message: 'Debes aceptar los términos y condiciones'
      })
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirmation']
  })
  .refine((data) => data.email === data.emailConfirmation, {
    message: 'Los emails no coinciden',
    path: ['emailConfirmation']
  })

type SignUpData = z.infer<typeof SignUpSchema>

type Props = RootStackScreenProps<'SignUp'>

const SignUpScreen: FC<Props> = ({ navigation }) => {
  const form = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema)
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = form

  const { mutate, isLoading, error } = useMutation(signUpWithPassword, {
    onSuccess: () => {
      navigation.navigate('SignIn')
    }
  })

  const onSubmit: SubmitHandler<SignUpData> = (data) => {
    mutate(data)
  }

  const goToSignIn = (): void => {
    navigation.replace('SignIn')
  }

  const [showPassword, setShowPassword] = useState(false)

  const isDisabled = isSubmitting || isLoading

  const goToTermsAndConditions = async () => {
    const termsAndConditionsUrl = Constants.manifest?.extra?.legal
      .terms as string

    console.assert(
      termsAndConditionsUrl !== undefined,
      'TERMS_AND_CONDITIONS_URL is not defined in .env file'
    )

    const canOpen = await Linking.canOpenURL(termsAndConditionsUrl)
    if (canOpen) {
      await Linking.openURL(termsAndConditionsUrl)
    }
  }

  const [errorText, setErrorText] = useState('')
  useEffect(() => {
    if (error === null) {
      return
    }

    const authError = error as AuthError

    if (authError.message.includes('already registered')) {
      setErrorText('El email ya está registrado')
      return
    }

    setErrorText('Ha ocurrido un error, intenta de nuevo')
  }, [error])

  return (
    <SafeAreaInsetsView>
      <KeyboardAwareScrollView>
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
                    disabled={isDisabled}
                  />
                </View>

                <View>
                  <Input
                    name="emailConfirmation"
                    label="Confirmar email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    disabled={isDisabled}
                  />
                </View>

                <View>
                  <Input
                    name="password"
                    label="Contraseña"
                    autoCapitalize="none"
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    secureTextEntry={!showPassword}
                    disabled={isDisabled}
                  />

                  <View className="flex flex-row mt-2 items-center">
                    <Checkbox
                      value={showPassword}
                      onValueChange={setShowPassword}
                      disabled={isSubmitting || isLoading}
                      color={showPassword ? '#2563eb' : undefined}
                      className={cn(
                        'rounded-md w-6 h-6 justify-center items-center'
                      )}
                    />

                    <Text className="block ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar contraseña
                    </Text>
                  </View>
                </View>

                <View>
                  <Input
                    name="passwordConfirmation"
                    label="Confirmar contraseña"
                    autoCapitalize="none"
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    secureTextEntry={!showPassword}
                    disabled={isDisabled}
                  />
                </View>

                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View className="flex flex-row mt-3 items-center">
                        <Checkbox
                          value={value}
                          onValueChange={onChange}
                          disabled={isSubmitting || isLoading}
                          color={value ? '#2563eb' : undefined}
                          className={cn(
                            'rounded-md w-6 h-6 justify-center items-center'
                          )}
                        />

                        <View className="ml-3">
                          <Pressable onPress={goToTermsAndConditions}>
                            <Text className="block text-sm font-medium text-blue-700 dark:text-blue-300 underline">
                              Acepto los términos y condiciones de uso.
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      {errors.acceptTerms !== undefined && (
                        <FieldError message={errors.acceptTerms.message} />
                      )}
                    </View>
                  )}
                  name="acceptTerms"
                />

                {error !== null && (
                  <View className="flex flex-row justify-center">
                    <FieldError message={errorText} />
                  </View>
                )}

                <View>
                  <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting || isLoading}
                    className={cn(
                      'text-base px-6 py-3.5 mt-3 bg-blue-700 rounded-lg border border-transparent',
                      'active:bg-blue-800',
                      (isSubmitting || isLoading) &&
                        'bg-gray-300 text-gray-700 cursor-not-allowed',
                      (isSubmitting || isLoading) &&
                        'dark:bg-gray-800 dark:text-gray-400'
                    )}
                  >
                    <Text className="text-base font-medium text-center text-white">
                      Crear cuenta
                    </Text>
                  </Pressable>
                </View>

                <View>
                  <Text
                    className="text-blue-700 mt-3 dark:text-blue-300 text-center"
                    onPress={goToSignIn}
                  >
                    ¿Ya tienes una cuenta? Inicia sesión
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </FormProvider>
      </KeyboardAwareScrollView>
    </SafeAreaInsetsView>
  )
}

export default SignUpScreen
