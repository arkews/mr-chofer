import { FC, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { RootStackScreenProps } from '@navigation/types'
import usePassenger from '@hooks/passengers/use-passenger'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm
} from 'react-hook-form'
import cn from 'classnames'
import { supabase } from '@base/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RegisterRideRequest,
  RegisterRideRequestSchema
} from '@base/rides/schema'
import RadioGroup from '@components/form/radio-group'
import { genders } from '@constants/genders'
import Input from '@components/form/input'
import ConfirmVehicleContractModal
  from '@base/rides/components/confirm-vehicle-contract.modal'

type Props = RootStackScreenProps<'PassengerDetails'>

const RegisterRideRequestForm: FC<Props> = ({ navigation }) => {
  const { passenger } = usePassenger()

  const form = useForm<RegisterRideRequest>({
    resolver: zodResolver(RegisterRideRequestSchema),
    defaultValues: {
      payment_method: 'cash'
    }
  })

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    watch,
    formState: { errors, isSubmitting, isValid }
  } = form

  useEffect(() => {
    if (passenger !== undefined) {
      setValue('passenger_id', passenger.id)
      setValue('gender', passenger.gender)
    }
  }, [passenger])

  const gender = watch('gender')
  useEffect(() => {
    resetField('offered_price', {
      defaultValue: gender === 'Male' ? 3000 : 2000
    })
  }, [gender])

  const sendRideRequest = async (data: RegisterRideRequest): Promise<void> => {
    const { error } = await supabase.from('rides').insert(data)

    if (error != null) {
      throw Error(error.message)
    }
  }

  const queryClient = useQueryClient()
  const { mutate, isLoading, error } = useMutation(sendRideRequest, {
    onSuccess: () => {
      void queryClient.invalidateQueries(['current-passenger-ride'])
      navigation.replace('PassengerRideDetails')
    }
  })

  const [confirmContractIsOpen, setConfirmContractIsOpen] = useState(false)

  const onCloseConfirmContract = (confirmed: boolean) => {
    setConfirmContractIsOpen(false)

    if (confirmed && isValid) {
      mutate(form.getValues())
    }
  }

  const onSubmit: SubmitHandler<RegisterRideRequest> = async () => {
    setConfirmContractIsOpen(true)
  }

  const isDisabled = isSubmitting || isLoading

  return (
    <FormProvider {...form}>
      <View className="flex flex-grow w-full justify-center mx-auto space-y-2">
        <ConfirmVehicleContractModal
          open={confirmContractIsOpen}
          onClose={onCloseConfirmContract}/>

        <View className="mb-5">
          <Text className="text-xl font-bold text-center dark:text-white">
            ¿A dónde quieres ir?
          </Text>
        </View>

        <View className="space-y-2">
          <View>
            <Input
              name="pickup_location"
              placeholder="Dirección de recogida"
              placeholderTextColor="#9CA3AF"
              disabled={isDisabled}/>
          </View>

          <View>
            <Input
              name="destination"
              placeholder="Destino"
              placeholderTextColor="#9CA3AF"
              disabled={isDisabled}/>
          </View>

          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mt-4">
                <RadioGroup values={genders} selected={value}
                            onSelect={onChange}/>

                {(errors.gender != null) &&
                  <Text className="text-red-500">{errors.gender.message}</Text>}
              </View>
            )}
            name="gender"
          />

          <View>
            <Input
              name="offered_price"
              placeholder="Precio ofrecido"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              disabled={isDisabled}/>
          </View>

          <View>
            <Input
              name="comments"
              placeholder="Comentarios"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              disabled={isDisabled}/>
          </View>
        </View>

        {
          error !== null &&
          <Text className="text-red-500 text-xs">
            Ha ocurrido un error, verifique los datos e intente nuevamente.
          </Text>
        }

        <View className="py-5">
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
              Solicitar viaje
            </Text>
          </Pressable>
        </View>
      </View>
    </FormProvider>
  )
}

export default RegisterRideRequestForm
