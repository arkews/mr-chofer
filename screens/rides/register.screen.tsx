import { FC, useEffect } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { RootStackScreenProps } from '@navigation/types'
import usePassenger from '@hooks/passengers/use-passenger'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import cn from 'classnames'
import { supabase } from '@base/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RegisterRideRequest,
  RegisterRideRequestSchema
} from '@base/rides/schema'

type Props = RootStackScreenProps<'RegisterRideRequest'>

const RegisterRideRequestScreen: FC<Props> = ({ navigation }) => {
  const { passenger } = usePassenger()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<RegisterRideRequest>({
    resolver: zodResolver(RegisterRideRequestSchema),
    defaultValues: {
      payment_method: 'cash'
    }
  })

  useEffect(() => {
    if (passenger !== undefined) {
      setValue('passenger_id', passenger.id)
    }
  }, [passenger])

  const sendRideRequest = async (data: RegisterRideRequest): Promise<void> => {
    const { error } = await supabase.from('rides').insert(data)

    if (error != null) {
      throw Error(error.message)
    }
  }

  const queryClient = useQueryClient()
  const { mutate, isLoading, error } = useMutation(sendRideRequest, {
    onSuccess: () => {
      void queryClient.invalidateQueries(['current-ride', passenger?.id])
      navigation.replace('PassengerRideDetails')
    }
  })

  const onSubmit: SubmitHandler<RegisterRideRequest> = async (data) => {
    mutate(data)
  }

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-3">
      <View className="mb-5">
        <Text className="text-xl text-center dark:text-white">
          ¿Dónde quieres ir?
        </Text>
      </View>

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="dark:text-white">Dirección de recogida</Text>
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting && !isLoading}
              className={
                cn('border text-lg px-4 py-3 mt-1 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            {(errors.pickup_location !== undefined) &&
              <Text
                className="text-red-500 text-xs mt-0.5">{errors.pickup_location.message}</Text>}
          </View>
        )}
        name="pickup_location"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-2.5">
            <Text className="dark:text-white">Destino</Text>
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting && !isLoading}
              className={
                cn('border text-lg px-4 py-3 mt-1 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            {(errors.destination !== undefined) &&
              <Text
                className="text-red-500 text-xs mt-0.5">{errors.destination.message}</Text>}
          </View>
        )}
        name="destination"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-2.5">
            <Text className="dark:text-white">Precio ofrecido</Text>
            <TextInput
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={`${value ?? ''}`}
              editable={!isSubmitting && !isLoading}
              className={
                cn('border text-lg px-4 py-3 mt-1 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            {(errors.offered_price !== undefined) &&
              <Text
                className="text-red-500 text-xs mt-0.5">{errors.offered_price.message}</Text>}
          </View>
        )}
        name="offered_price"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-2.5">
            <Text className="dark:text-white">Comentarios</Text>
            <TextInput
              multiline
              numberOfLines={3}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ''}
              editable={!isSubmitting && !isLoading}
              className={
                cn('border text-lg px-4 py-1 mt-1 rounded-lg border-gray-200 text-gray-900 outline-none',
                  'focus:border-blue-600 focus:ring-0',
                  'dark:text-white',
                  isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
              }
            />

            {(errors.comments !== undefined) &&
              <Text
                className="text-red-500 text-xs mt-0.5">{errors.comments.message}</Text>}
          </View>
        )}
        name="comments"
      />

      {
        error !== null &&
        <Text className="text-red-500 text-xs">
          Ha ocurrido un error, verifique los datos e intente nuevamente.
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
          Enviar solicitud
        </Text>
      </Pressable>
    </View>
  )
}

export default RegisterRideRequestScreen
