import { FC, useCallback, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native'
import { z } from 'zod'
import { RootStackScreenProps } from '@navigation/types'
import useDriver from '@hooks/drivers/use-driver'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm
} from 'react-hook-form'
import { supabase } from '@base/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import RadioGroup from '@components/form/radio-group'
import { vehicleTypes } from '@constants/vehicle-types'
import { Photo } from '@shared/types'
import { uploadDocumentPhoto } from '@base/supabase/storage'
import PhotoPicker from '@components/form/photo-picker'
import Input from '@components/form/input'
import FieldError from '@components/form/feedback/field/field.error'
import * as Sentry from 'sentry-expo'
import useVehicle from '@hooks/vehicles/use-vehicle'
import { useFocusEffect } from '@react-navigation/native'

const RegisterVehicleSchema = z.object({
  license_plate: z.string({ required_error: 'Placa requerida' })
    .min(1, 'Placa requerida')
    .transform(licensePlate => licensePlate.toUpperCase().trim())
    .refine(async licensePlate => {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('license_plate')
        .eq('license_plate', licensePlate)
        .single()

      if (vehicleError !== null) {
        const { details } = vehicleError
        return details.includes('Results contain 0 rows')
      }

      return vehicle === null || vehicle === undefined || vehicle.license_plate === ''
    }, 'La placa ya está registrada'),
  owner_id: z.string({ required_error: 'Dueño requerido' })
    .min(1, 'Dueño requerido'),
  engine_displacement: z.string({ required_error: 'Cilindrada requerida' })
    .min(1, 'Cilindrada requerida'),
  brand: z.string({ required_error: 'Marca requerida' })
    .min(1, 'Marca requerida'),
  line: z.string({ required_error: 'Línea requerida' })
    .min(1, 'Línea requerida'),
  model: z.string({ required_error: 'Modelo requerido' })
    .min(1, 'Modelo requerido'),
  color: z.string({ required_error: 'Color requerido' })
    .min(1, 'Color requerido'),
  type: z.string({ required_error: 'Tipo requerido' })
    .min(1, 'Tipo requerido'),
  driver_id: z.string({ required_error: 'Dueño requerido' })
    .min(1, 'Dueño requerido'),
  property_card_photo_url_front: z.string({ required_error: 'Debe seleccionar una foto' })
    .min(1, 'Debe seleccionar una foto'),
  property_card_photo_url_back: z.string({ required_error: 'Debe seleccionar una foto' })
    .min(1, 'Debe seleccionar una foto')
})

type VehicleData = z.infer<typeof RegisterVehicleSchema>

type Props = RootStackScreenProps<'RegisterVehicle'>

type DocumentType =
  'property_card_photo_url_front'
  | 'property_card_photo_url_back'
type DocumentPhotos = Map<DocumentType, Photo>

const RegisterVehicleScreen: FC<Props> = ({ navigation }) => {
  const { driver } = useDriver()
  useEffect(() => {
    if (driver !== undefined && driver !== null) {
      setValue('driver_id', driver.id)
    }
  }, [driver])

  const form = useForm<VehicleData>({
    resolver: zodResolver(RegisterVehicleSchema)
  })

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = form

  const [documentPhotos, setDocumentPhotos] = useState<DocumentPhotos>(new Map())
  const handleDocumentPhoto = (type: DocumentType, photo: Photo) => {
    setDocumentPhotos(new Map(documentPhotos.set(type, photo)))
    setValue(type, photo.uri)
  }

  const registerVehicle = async (data: VehicleData): Promise<void> => {
    const { error } = await supabase.from('vehicles').insert(data)

    if (error !== null) {
      Sentry.Native.captureException(error, {
        contexts: {
          data
        }
      })
      throw Error(error.message)
    }
  }

  const queryClient = useQueryClient()
  const { mutate, isLoading, error } = useMutation(registerVehicle, {
    onSuccess: () => {
      void queryClient.invalidateQueries(['vehicle', driver?.id])
      navigation.navigate('DriverDetails')
    }
  })

  const onSubmit: SubmitHandler<VehicleData> = async data => {
    for (const [field, photo] of documentPhotos) {
      const documentUrl = await uploadDocumentPhoto(`${data.license_plate}-${field}`, photo)
      if (documentUrl === undefined) {
        Alert.alert('Tuvimos un problema al subir tus documentos, intenta de nuevo')
        return
      }

      data[field] = documentUrl
    }

    mutate(data)
  }

  const isDisabled = isSubmitting || isLoading

  const [errorText, setErrorText] = useState('')
  useEffect(() => {
    if (error === null) {
      return
    }

    const authError = error as Error

    if (authError.message.includes('already registered')) {
      setErrorText('Ya existe un conductor registrado con los datos ingresados')
      return
    }

    setErrorText('Ha ocurrido un error, intenta de nuevo')
  }, [error])

  const { vehicle } = useVehicle()
  const checkVehicle = useCallback(() => {
    if (vehicle !== undefined && vehicle !== null) {
      navigation.navigate('DriverDetails')
    }
  }, [vehicle])
  useFocusEffect(checkVehicle)

  return (
    <FormProvider {...form}>
      <KeyboardAvoidingView>
        <View className="py-20 pb-2">
          <ScrollView
            className="flex flex-grow w-full px-5 mx-auto space-y-3">
            <View className="mb-5">
              <Text
                className="text-xl font-medium text-center text-gray-900 dark:text-gray-200">
                Ya solo nos faltan los datos de tu vehículo
              </Text>
            </View>

            <View className="flex flex-row space-x-2">
              <View className="basis-1/2">
                <Input
                  name="license_plate"
                  label="Placa"
                  disabled={isDisabled}/>
              </View>
              <View className="basis-1/2">
                <Input
                  name="engine_displacement"
                  label="Cilindraje (CC)"
                  disabled={isDisabled}/>
              </View>
            </View>

            <View className="flex flex-row space-x-2">
              <View className="basis-1/2">
                <Input
                  name="brand"
                  label="Marca"
                  disabled={isDisabled}/>
              </View>

              <View className="basis-1/2">
                <Input
                  name="line"
                  label="Línea/Referencia"
                  disabled={isDisabled}/>
              </View>
            </View>

            <View className="flex flex-row space-x-2">
              <View className="basis-1/2">
                <Input
                  name="model"
                  label="Modelo"
                  disabled={isDisabled}/>
              </View>

              <View className="basis-1/2">
                <Input
                  name="color"
                  label="Color"
                  disabled={isDisabled}/>
              </View>
            </View>

            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="mt-2">
                  <Text
                    className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo
                  </Text>
                  <RadioGroup values={vehicleTypes} selected={value}
                              onSelect={onChange}/>

                  {(errors.type != null) &&
                    <FieldError message={errors.type.message}/>
                  }
                </View>
              )}
              name="type"
            />

            <View>
              <Input
                name="owner_id"
                label="N° documento del propietario"
                keyboardType="numeric"
                disabled={isDisabled}/>
            </View>

            <View>
              <Text
                className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tarjeta de propiedad
              </Text>
              <View className="flex flex-row space-x-2">
                <View className="basis-1/2">
                  <PhotoPicker label="Parte frontal" mode="take"
                               disabled={isDisabled}
                               onSelect={(photo) => {
                                 handleDocumentPhoto('property_card_photo_url_front', photo)
                               }}/>

                  {
                    watch('property_card_photo_url_front') !== undefined &&
                    <Text
                      className="text-green-600 text-xs font-medium mt-0.5 dark:text-green-500">
                      Foto cargada
                    </Text>
                  }

                  {(errors.property_card_photo_url_front !== undefined) &&
                    <FieldError
                      message={errors.property_card_photo_url_front.message}/>
                  }
                </View>
                <View className="basis-1/2">
                  <PhotoPicker label="Parte trasera" mode="take"
                               disabled={isDisabled}
                               onSelect={(photo) => {
                                 handleDocumentPhoto('property_card_photo_url_back', photo)
                               }}/>

                  {
                    watch('property_card_photo_url_back') !== undefined &&
                    <Text
                      className="text-green-600 text-xs font-medium mt-0.5 dark:text-green-500">
                      Foto cargada
                    </Text>
                  }

                  {(errors.property_card_photo_url_back !== undefined) &&
                    <FieldError
                      message={errors.property_card_photo_url_back.message}/>
                  }
                </View>
              </View>
            </View>

            {
              error !== null &&
              <FieldError
                message={errorText}/>
            }

            <View>
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isDisabled}
                className={
                  cn('text-base px-6 py-3.5 bg-blue-700 rounded-lg border border-transparent',
                    'active:bg-blue-800',
                    (isDisabled) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                    (isDisabled) && 'dark:bg-gray-800 dark:text-gray-400')
                }
              >
                <Text
                  className="text-base text-white font-medium text-center text-white">
                  Enviar
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </FormProvider>
  )
}

export default RegisterVehicleScreen
