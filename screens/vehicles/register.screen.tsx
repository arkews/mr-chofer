import { FC, useEffect, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { z } from 'zod'
import { RootStackScreenProps } from '@navigation/types'
import useDriver from '@hooks/drivers/use-driver'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { supabase } from '@base/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import RadioGroup from '@components/form/radio-group'
import { vehicleTypes } from '@constants/vehicle-types'
import { Photo } from '@shared/types'
import { uploadDocumentPhoto } from '@base/supabase/storage'
import PhotoPicker from '@components/form/photo-picker'

const RegisterVehicleSchema = z.object({
  license_plate: z.string({ required_error: 'Placa requerida' })
    .min(1, 'Placa requerida'),
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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<VehicleData>({
    resolver: zodResolver(RegisterVehicleSchema)
  })

  const [documentPhotos, setDocumentPhotos] = useState<DocumentPhotos>(new Map())
  const handleDocumentPhoto = (type: DocumentType, photo: Photo) => {
    setDocumentPhotos(new Map(documentPhotos.set(type, photo)))
    setValue(type, photo.uri)
  }

  const registerVehicle = async (data: VehicleData): Promise<void> => {
    const { error } = await supabase.from('vehicles').insert(data)

    if (error !== null) {
      throw Error(error.message)
    }
  }

  const queryClient = useQueryClient()
  const { mutate, isLoading, error } = useMutation(registerVehicle, {
    onSuccess: () => {
      void queryClient.invalidateQueries(['vehicle', driver?.id])
      navigation.replace('DriverDetails')
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

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-3">
      <View className="mb-5">
        <Text className="text-xl text-center dark:text-white">
          Ya solo nos faltan los datos de tu vehículo
        </Text>
      </View>

      <View className="flex flex-row space-x-2">
        <View className="basis-1/2">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Placa</Text>
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

                {(errors.license_plate !== undefined) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">{errors.license_plate.message}</Text>}
              </View>
            )}
            name="license_plate"
          />
        </View>
        <View className="basis-1/2">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Cilindraje (CC)</Text>
                <TextInput
                  keyboardType="numeric"
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

                {(errors.engine_displacement !== undefined) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">{errors.engine_displacement.message}</Text>}
              </View>
            )}
            name="engine_displacement"
          />
        </View>
      </View>

      <View className="flex flex-row space-x-2">
        <View className="basis-1/2">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Marca</Text>
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

                {(errors.brand != null) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">{errors.brand.message}</Text>}
              </View>
            )}
            name="brand"
          />
        </View>

        <View className="basis-1/2">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Línea/Referencia</Text>
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

                {(errors.line != null) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">{errors.line.message}</Text>}
              </View>
            )}
            name="line"
          />
        </View>
      </View>

      <View className="flex flex-row space-x-2">
        <View className="basis-1/2">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Modelo</Text>
                <TextInput
                  keyboardType="numeric"
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

                {(errors.model != null) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">{errors.model.message}</Text>}
              </View>
            )}
            name="model"
          />
        </View>

        <View className="basis-1/2">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Color</Text>
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

                {(errors.color != null) &&
                  <Text
                    className="text-red-500 text-xs mt-0.5">{errors.color.message}</Text>}
              </View>
            )}
            name="color"
          />
        </View>
      </View>

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="mt-2">
            <Text className="mb-2 dark:text-white">Tipo</Text>
            <RadioGroup values={vehicleTypes} selected={value}
                        onSelect={onChange}/>

            {(errors.type != null) &&
              <Text
                className="text-red-500 text-xs mt-0.5">{errors.type.message}</Text>}
          </View>
        )}
        name="type"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-2">
            <Text className="dark:text-white">N° documento del
              propietario</Text>
            <TextInput
              keyboardType="numeric"
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

            {(errors.owner_id !== undefined) &&
              <Text
                className="text-red-500 text-xs mt-0.5">{errors.owner_id.message}</Text>}
          </View>
        )}
        name="owner_id"
      />

      <View>
        <Text className="dark:text-white mb-2">Tarjeta de propiedad</Text>
        <View className="flex flex-row space-x-2">
          <View className="basis-1/2">
            <PhotoPicker label="Parte frontal" mode="take"
                         disabled={isSubmitting || isLoading}
                         onSelect={(photo) => {
                           handleDocumentPhoto('property_card_photo_url_front', photo)
                         }}/>

            {
              watch('property_card_photo_url_front') !== undefined &&
              <Text className="text-green-500 text-xs mt-0.5">
                Foto cargada
              </Text>
            }

            {(errors.property_card_photo_url_front !== undefined) &&
              <Text
                className="text-red-500 text-xs  mt-0.5">{errors.property_card_photo_url_front.message}</Text>}
          </View>
          <View className="basis-1/2">
            <PhotoPicker label="Parte trasera" mode="take"
                         disabled={isSubmitting || isLoading}
                         onSelect={(photo) => {
                           handleDocumentPhoto('property_card_photo_url_back', photo)
                         }}/>

            {
              watch('property_card_photo_url_back') !== undefined &&
              <Text className="text-green-500 text-xs mt-0.5">
                Foto cargada
              </Text>
            }

            {(errors.property_card_photo_url_back !== undefined) &&
              <Text
                className="text-red-500 text-xs mt-0.5">{errors.property_card_photo_url_back.message}</Text>}
          </View>
        </View>
      </View>

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
          Enviar
        </Text>
      </Pressable>
    </View>
  )
}

export default RegisterVehicleScreen
