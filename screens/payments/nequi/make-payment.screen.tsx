import SafeAreaInsetsView from '@base/components/view/safe-area-insets.view'
import useDriver from '@base/hooks/drivers/use-driver'
import { RootStackScreenProps } from '@base/navigation/types'
import { NequiPayment } from '@base/payments'
import { supabase } from '@base/supabase'
import Input from '@components/form/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import cn from 'classnames'
import { FC } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

const RegisterNequiPaymentSchema = z
  .object({
    driver_id: z
      .string({ required_error: 'ID de conductor requerido' })
      .min(1, 'ID de conductor requerido'),
    phoneNumber: z
      .string({ required_error: 'Número de teléfono requerido' })
      .min(1, 'Número de teléfono requerido'),
    phoneNumberConfirmation: z
      .string({ required_error: 'Debe confirmar el número de teléfono' })
      .min(1, 'Debe confirmar el número de teléfono'),
    value: z
      .string({ required_error: 'Debe ingresar un monto' })
      .min(1, 'Debe ingresar un monto')
      .regex(/^\d+$/, 'Debe ingresar un monto válido')
  })
  .refine(
    (data) => {
      const { phoneNumber, phoneNumberConfirmation } = data
      return phoneNumber === phoneNumberConfirmation
    },
    {
      message: 'Los números de teléfono no coinciden',
      path: ['phoneNumberConfirmation']
    }
  )

type FormData = z.infer<typeof RegisterNequiPaymentSchema>

type Props = RootStackScreenProps<'MakeNequiPayment'>

const MakeNequiPaymentScreen: FC<Props> = ({ navigation }) => {
  const { driver } = useDriver()

  const form = useForm<FormData>({
    resolver: zodResolver(RegisterNequiPaymentSchema),
    defaultValues: {
      driver_id: driver?.id
    }
  })

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = form

  const makeNequiPayment = async (data: NequiPayment) => {
    const { error } = await supabase.functions.invoke('make-nequi-payment', {
      body: data
    })

    if (error !== null) {
      const rawError = new Error(error.message)
      Sentry.Native.captureException(rawError, {
        contexts: {
          data,
          error
        }
      })
      throw rawError
    }
  }

  const { mutate, isLoading, error } = useMutation(makeNequiPayment)

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const { phoneNumberConfirmation, ...rest } = data

    mutate(rest)
  }

  const isDisabled = isLoading || isSubmitting

  return (
    <SafeAreaInsetsView>
      <KeyboardAwareScrollView>
        <FormProvider {...form}>
          <View className="min-h-screen py-3 flex flex-col flex-1 flex-grow justify-center">
            <View></View>
            <ScrollView className="flex flex-grow w-full px-3 mx-auto space-y-3">
              <View className="mb-3">
                <Text className="text-2xl font-medium text-center dark:text-white">
                  Realizar pago Nequi
                </Text>

                <Text className="text-base mt-2 text-red-500 dark:text-red-400">
                  Aviso importante: La funcionalidad de pagos sigue en
                  desarrollo, por el momento ningun pago se realiza de forma
                  real. Si desea realizar un pago real, por favor contacte a
                  soporte. Gracias.
                </Text>
              </View>

              <View>
                <Input
                  name="phoneNumber"
                  label="Teléfono"
                  keyboardType="numeric"
                  disabled={isDisabled}
                  enablesReturnKeyAutomatically
                />
              </View>

              <View>
                <Input
                  name="phoneNumberConfirmation"
                  label="Confirmar teléfono"
                  keyboardType="numeric"
                  disabled={isDisabled}
                  enablesReturnKeyAutomatically
                />
              </View>

              <View>
                <Input
                  name="value"
                  label="Valor"
                  keyboardType="numeric"
                  disabled={isDisabled}
                  enablesReturnKeyAutomatically
                />
              </View>

              {error !== null && (
                <Text className="text-red-500 text-xs">
                  Ha ocurrido un error, verifique los datos e intente
                  nuevamente.
                </Text>
              )}

              <View className="pt-5">
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isDisabled}
                  className={cn(
                    'text-base px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
                    'active:bg-blue-800',
                    isDisabled &&
                      'bg-gray-300 text-gray-700 cursor-not-allowed',
                    isDisabled && 'dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  <Text className="text-base font-medium text-center text-white">
                    Realizar pago
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </FormProvider>
      </KeyboardAwareScrollView>
    </SafeAreaInsetsView>
  )
}

export default MakeNequiPaymentScreen
