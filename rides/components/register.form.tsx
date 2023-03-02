import FieldError from '@base/components/form/feedback/field/field.error'
import { paymentOptions } from '@base/constants/payment-options'
import ConfirmVehicleContractModal from '@base/rides/components/confirm-vehicle-contract.modal'
import {
  RegisterRideRequest,
  RegisterRideRequestSchema
} from '@base/rides/schema'
import { useConfig } from '@base/shared/configuration'
import { supabase } from '@base/supabase'
import Input from '@components/form/input'
import RadioGroup from '@components/form/radio-group'
import { genders } from '@constants/genders'
import { zodResolver } from '@hookform/resolvers/zod'
import usePassenger from '@hooks/passengers/use-passenger'
import { RootStackScreenProps } from '@navigation/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import { FC, useEffect, useState } from 'react'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm
} from 'react-hook-form'
import { Pressable, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'
import DestinationModal from './destination.modal'
import OfferedPriceModal from './offered-price.modal'

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
  const { config: minimunFare } = useConfig(
    gender === 'Male' ? 'MINIMUM_MALE_FARE' : 'MINIMUM_FEMALE_FARE'
  )
  useEffect(() => {
    if (minimunFare === undefined || minimunFare === null) {
      return
    }

    resetField('offered_price', {
      defaultValue: Number(minimunFare.value)
    })
  }, [gender, minimunFare])

  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false)
  const openDestinationModal = () => {
    setIsDestinationModalOpen(true)
  }
  const closeDestinationModal = () => {
    setIsDestinationModalOpen(false)
  }

  const handleCloseDestinationModal = (
    destination: string,
    affiliateId?: string
  ) => {
    closeDestinationModal()
    if (destination === '' || destination.trim() === '') {
      return
    }

    resetField('destination', {
      defaultValue: destination
    })

    setValue('affiliate_id', affiliateId)
  }

  const [isOfferedPriceModalOpen, setIsOfferedPriceModalOpen] = useState(false)
  const openOfferedPriceModal = () => {
    setIsOfferedPriceModalOpen(true)
  }
  const closeOfferedPriceModal = () => {
    setIsOfferedPriceModalOpen(false)
  }

  const handleCloseOfferedPriceModal = (
    offeredPrice: number,
    paymentMethod: string
  ) => {
    closeOfferedPriceModal()
    if (offeredPrice === 0) {
      return
    }

    resetField('offered_price', {
      defaultValue: offeredPrice
    })
    resetField('payment_method', {
      defaultValue: paymentMethod
    })
  }

  const sendRideRequest = async (data: RegisterRideRequest): Promise<void> => {
    const { error } = await supabase.functions.invoke('new-ride-request', {
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

  const { config: isMalePassengerActiveConfig } = useConfig(
    'IS_MALE_PASSENGER_ACTIVE'
  )

  const paymentLabel = paymentOptions.find(
    (option) => option.value === watch('payment_method')
  )?.name

  return (
    <FormProvider {...form}>
      <View className="flex flex-grow w-full justify-center mx-auto space-y-2">
        <ConfirmVehicleContractModal
          open={confirmContractIsOpen}
          onClose={onCloseConfirmContract}
        />

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
              disabled={isDisabled}
            />
          </View>

          <View>
            <DestinationModal
              open={isDestinationModalOpen}
              onClose={handleCloseDestinationModal}
            />
            <Pressable
              onPress={openDestinationModal}
              disabled={isDisabled}
              className={cn(
                'border-[1px] px-4 py-3 mt-1 rounded-lg bg-neutral-100 border-neutral-400 dark:bg-neutral-900 dark:border-neutral-700',
                isDisabled &&
                  'bg-neutral-200 text-neutral-400 cursor-not-allowed dark:bg-neutral-800'
              )}
            >
              <Text
                className={cn(
                  'text-lg text-gray-400 dark:text-gray-400',
                  isDisabled &&
                    'text-neutral-400 cursor-not-allowed dark:text-neutral-500'
                )}
              >
                {watch('destination') !== undefined &&
                watch('destination') !== ''
                  ? watch('destination')
                  : 'Destino'}
              </Text>
            </Pressable>

            {errors.destination !== undefined && (
              <FieldError message={errors.destination.message as string} />
            )}
          </View>

          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mt-4">
                <RadioGroup
                  values={genders}
                  selected={value}
                  onSelect={onChange}
                />

                {value === 'Male' &&
                  isMalePassengerActiveConfig !== undefined &&
                  isMalePassengerActiveConfig !== null &&
                  isMalePassengerActiveConfig.value === 'true' && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nota: Parrillero hombre está vigente.
                    </Text>
                )}

                {errors.gender !== undefined && (
                  <Text className="text-red-500">{errors.gender.message}</Text>
                )}
              </View>
            )}
            name="gender"
          />

          <View>
            <OfferedPriceModal
              open={isOfferedPriceModalOpen}
              onClose={handleCloseOfferedPriceModal}
            />
            <Pressable
              onPress={openOfferedPriceModal}
              disabled={isDisabled}
              className={cn(
                'border-[1px] px-4 py-3 mt-1 rounded-lg bg-neutral-100 border-neutral-400 dark:bg-neutral-900 dark:border-neutral-700',
                isDisabled &&
                  'bg-neutral-200 text-neutral-400 cursor-not-allowed dark:bg-neutral-800'
              )}
            >
              <Text
                className={cn(
                  'text-lg text-gray-400 dark:text-gray-400',
                  isDisabled &&
                    'text-neutral-400 cursor-not-allowed dark:text-neutral-500'
                )}
              >
                {watch('offered_price') !== undefined &&
                watch('offered_price') !== 0
                  ? `${Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'COP'
                    }).format(watch('offered_price'))}, ${paymentLabel ?? ''}`
                  : 'Precio ofrecido'}
              </Text>
            </Pressable>

            {errors.offered_price !== undefined && (
              <FieldError message={errors.offered_price.message as string} />
            )}

            {minimunFare !== undefined &&
              minimunFare !== null &&
              Number(minimunFare.value) > 0 && (
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  La tarifa mínima es de{' '}
                  {Number(minimunFare.value).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'COP'
                  })}
                </Text>
            )}
          </View>

          <View>
            <Input
              name="comments"
              placeholder="Comentarios"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              disabled={isDisabled}
            />
          </View>
        </View>

        {error !== null && (
          <Text className="text-red-500 text-xs">
            Ha ocurrido un error, verifique los datos e intente nuevamente.
          </Text>
        )}

        <View className="py-5">
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || isLoading}
            className={cn(
              'text-base px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
              'active:bg-blue-800',
              (isSubmitting || isLoading) &&
                'bg-gray-300 text-gray-700 cursor-not-allowed',
              (isSubmitting || isLoading) &&
                'dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            <Text className="text-base font-medium text-center text-white">
              Solicitar viaje
            </Text>
          </Pressable>
        </View>
      </View>
    </FormProvider>
  )
}

export default RegisterRideRequestForm
