import SafeAreaInsetsView from '@base/components/view/safe-area-insets.view'
import { supabase } from '@base/supabase'
import Input from '@components/form/input'
import Rating from '@components/form/rating'
import { zodResolver } from '@hookform/resolvers/zod'
import { RootStackScreenProps } from '@navigation/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import { FC, useEffect } from 'react'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm
} from 'react-hook-form'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

const RegisterRatingSchema = z.object({
  passenger_id: z.string().min(1),
  driver_id: z.string().min(1),
  rating: z.coerce.number().min(1),
  comment: z.string().optional()
})

type RegisterRatingData = z.infer<typeof RegisterRatingSchema>

type Props = RootStackScreenProps<'RegisterRating'>

const RegisterRatingScreen: FC<Props> = ({ navigation, route }) => {
  const { type, passengerId, driverId } = route.params

  const form = useForm<RegisterRatingData>({
    resolver: zodResolver(RegisterRatingSchema),
    defaultValues: {
      passenger_id: passengerId,
      driver_id: driverId,
      rating: 4
    }
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = form

  const queryClient = useQueryClient()
  const goBack = () => {
    const queryKey =
      type === 'driver' ? 'current-passenger-ride' : 'current-driver-ride'
    void queryClient.invalidateQueries([queryKey])
    navigation.goBack()
  }

  const registerRating = async (data: RegisterRatingData) => {
    const table = type === 'passenger' ? 'passenger_ratings' : 'driver_ratings'
    const { error } = await supabase.from(table).insert(data)

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

  const { mutate, isLoading, error } = useMutation(registerRating, {
    onSuccess: () => {
      goBack()
    }
  })

  const onSubmit: SubmitHandler<RegisterRatingData> = async (data) => {
    mutate(data)
  }

  const isDisabled = isLoading || isSubmitting

  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        const queryKey =
          type === 'driver' ? 'current-passenger-ride' : 'current-driver-ride'
        void queryClient.invalidateQueries([queryKey])
      }),
    [navigation]
  )

  return (
    <SafeAreaInsetsView>
      <KeyboardAwareScrollView>
        <FormProvider {...form}>
          <View className="min-h-screen py-3 flex flex-col flex-1 flex-grow justify-center">
            <View>
              <ScrollView className="flex flex-grow w-full px-3 mx-auto space-y-3">
                <View className="mb-3">
                  <Text className="text-2xl font-medium text-center text-gray-900 dark:text-gray-200">
                    ??Termino tu recorrido!
                  </Text>

                  <Text className="text-gray-500 text-sm font-medium text-center mt-3 dark:text-gray-400">
                    Califica tu experiencia con el{' '}
                    {type === 'passenger' ? 'pasajero' : 'conductor'}.
                  </Text>
                </View>

                <View>
                  <Controller
                    control={control}
                    render={({ field: { onChange } }) => (
                      <View>
                        <Rating onChange={onChange} />
                      </View>
                    )}
                    name="rating"
                  />
                </View>

                <View className="pt-3">
                  <Input
                    name="comment"
                    label="Comentarios"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    disabled={isDisabled}
                  />
                </View>

                {error !== null && (
                  <Text className="text-red-500 text-xs">
                    Ha ocurrido un error, verifique los datos e intente
                    nuevamente.
                  </Text>
                )}

                <View>
                  <View className="py-3">
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
                        Calificar
                      </Text>
                    </Pressable>
                  </View>

                  <View>
                    <Pressable
                      onPress={goBack}
                      disabled={isDisabled}
                      className={cn(
                        'bg-white border border-zinc-300 rounded-lg px-5 py-2.5 dark:bg-zinc-800 dark:border-zinc-600',
                        'active:bg-zinc-100 dark:active:bg-zinc-700',
                        isDisabled &&
                          'bg-gray-300 text-zinc-700 cursor-not-allowed',
                        isDisabled && 'dark:bg-gray-800 dark:text-gray-400'
                      )}
                    >
                      <Text className="text-gray-900 font-medium text-sm dark:text-white text-center">
                        En otro momento
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </FormProvider>
      </KeyboardAwareScrollView>
    </SafeAreaInsetsView>
  )
}

export default RegisterRatingScreen
