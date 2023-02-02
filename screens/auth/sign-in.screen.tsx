import { FC, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { z } from 'zod'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import cn from 'classnames'
import { signInWithPassword } from '@base/auth'
import { useMutation } from '@tanstack/react-query'
import { RootStackScreenProps } from '@navigation/types'
import Checkbox from 'expo-checkbox'
import FieldError from '@components/form/feedback/field/field.error'
import Input from '@components/form/input'

const SignInSchema = z.object({
  email: z.string({ required_error: 'Email requerido' })
    .email('Email invalido'),
  password: z.string({ required_error: 'Contraseña requerida' })
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

  const onSubmit: SubmitHandler<SignInData> = async data => {
    mutate(data)
  }

  const goToSignUp = (): void => {
    navigation.replace('SignUp')
  }

  const [showPassword, setShowPassword] = useState(false)

  const isDisabled = isSubmitting || isLoading

  return (
    <FormProvider {...form}>
      <View
        className="flex flex-grow w-full px-7 justify-center mx-auto space-y-5">
        <View>
          <Input
            name="email"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically
            disabled={isDisabled}/>
        </View>

        <View>
          <Input
            name="password"
            label="Contraseña"
            secureTextEntry={!showPassword}
            autoCorrect={false}
            enablesReturnKeyAutomatically
            disabled={isDisabled}/>

          <View className="flex flex-row mt-3 items-center">
            <Checkbox
              value={showPassword}
              onValueChange={setShowPassword}
              disabled={isDisabled}
              color={showPassword ? '#2563eb' : undefined}
              className={
                cn('rounded-md w-6 h-6 justify-center items-center')
              }/>

            <Text
              className="block ml-2 font-medium text-gray-700 dark:text-gray-300">
              Mostrar contraseña
            </Text>
          </View>
        </View>

        {error != null &&
          <FieldError
            message="Credenciales inválidas, verifique su email y contraseña."/>
        }

        <View>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isDisabled}
            className={
              cn('text-base mt-4 px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
                'active:bg-blue-800',
                (isDisabled) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                (isDisabled) && 'dark:bg-gray-800 dark:text-gray-400')
            }
          >
            <Text
              className="text-base text-white font-medium text-center text-white">
              Iniciar sesión
            </Text>
          </Pressable>
        </View>

        <View>
          <Text className="text-blue-700 dark:text-blue-300 text-center"
                onPress={goToSignUp}>
            ¿No estás registrado? Registrate
          </Text>
        </View>
      </View>
    </FormProvider>
  )
}

export default SignInScreen
