import { useAuth } from '@base/auth/context'
import SafeAreaInsetsView from '@base/components/view/safe-area-insets.view'
import { supabase } from '@base/supabase'
import { uploadAvatar, uploadDocumentPhoto } from '@base/supabase/storage'
import FieldError from '@components/form/feedback/field/field.error'
import Input from '@components/form/input'
import PhotoPicker from '@components/form/photo-picker'
import { zodResolver } from '@hookform/resolvers/zod'
import usePassenger from '@hooks/passengers/use-passenger'
import { RootStackScreenProps } from '@navigation/types'
import { Photo } from '@shared/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import { FC, useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

const RegisterDriverSchema = z.object({
  id: z
    .string({ required_error: 'Identificación requerida' })
    .min(1, 'Identificación requerida')
    .refine(async (id) => {
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('id', id)
        .single()

      if (driverError !== null) {
        const { details } = driverError
        return details.includes('Results contain 0 rows')
      }

      return driver === null || driver === undefined || driver.id === ''
    }, 'La identificación ya está registrada'),
  name: z
    .string({ required_error: 'Nombre requerido' })
    .min(1, 'Nombre requerido'),
  city: z
    .string({ required_error: 'Ciudad requerida' })
    .min(1, 'Ciudad requerida'),
  phone: z
    .string({ required_error: 'Número de teléfono requerido' })
    .min(1, 'Número de teléfono requerido'),
  gender: z
    .string({ required_error: 'Debe seleccionar un sexo' })
    .min(1, 'Debe seleccionar un sexo'),
  photo_url: z
    .string({
      required_error: 'Debe seleccionar una foto',
      invalid_type_error: 'Debe seleccionar una foto'
    })
    .min(1, 'Debe seleccionar una foto'),
  id_photo_url_front: z
    .string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  license_photo_url_front: z
    .string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  id_photo_url_back: z
    .string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  license_photo_url_back: z
    .string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  user_id: z
    .string({ required_error: 'Debe seleccionar un usuario' })
    .min(1, 'Debe seleccionar un usuario')
})

type DriverData = z.infer<typeof RegisterDriverSchema>
type DriverMutationData = Omit<DriverData, 'phoneConfirmation'>

type Props = RootStackScreenProps<'RegisterDriver'>

type DocumentPhotoField =
  | 'id_photo_url_front'
  | 'id_photo_url_back'
  | 'license_photo_url_front'
  | 'license_photo_url_back'

type DocumentPhotos = Map<DocumentPhotoField, Photo>

const RegisterDriverScreen: FC<Props> = ({ navigation }) => {
  const { session } = useAuth()
  useEffect(() => {
    if (session != null && session.user.id !== '') {
      setValue('user_id', session.user.id)
    }
  }, [session])

  const { passenger } = usePassenger()

  const form = useForm<DriverData>({
    resolver: zodResolver(RegisterDriverSchema),
    defaultValues: {
      ...passenger,
      id: undefined,
      photo_url: undefined
    }
  })

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = form

  const [documentPhotos, setDocumentPhotos] = useState<DocumentPhotos>(
    new Map()
  )
  const handleDocumentPhotoChange = (
    field: DocumentPhotoField,
    photo: Photo
  ) => {
    setDocumentPhotos(new Map(documentPhotos.set(field, photo)))
    setValue(field, photo.uri)
  }

  const [profilePhoto, setProfilePhoto] = useState<Photo | null>(null)

  const onSelectProfilePhoto = (photo: Photo): void => {
    setProfilePhoto(photo)
    setValue('photo_url', photo.uri)
  }

  const registerDriver = async (data: DriverMutationData): Promise<void> => {
    const { error } = await supabase.from('drivers').insert(data)

    if (error != null) {
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
  const { mutate, isLoading, error } = useMutation(registerDriver, {
    onSuccess: () => {
      void queryClient.invalidateQueries(['passenger', session?.user.id])
      navigation.replace('RegisterVehicle')
    }
  })

  const onSubmit: SubmitHandler<DriverData> = async (data) => {
    if (profilePhoto !== null) {
      const photoUrl = await uploadAvatar(data.user_id, profilePhoto)
      if (photoUrl === undefined) {
        Alert.alert('Tuvimos un problema al subir tu foto, intenta de nuevo')
        return
      }

      data.photo_url = photoUrl
    }

    for (const [field, photo] of documentPhotos) {
      const documentUrl = await uploadDocumentPhoto(
        `${data.user_id}-${field}`,
        photo
      )
      if (documentUrl === undefined) {
        Alert.alert(
          'Tuvimos un problema al subir tus documentos, intenta de nuevo'
        )
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
      setErrorText(
        'Ya existe un conductor registrado con los datos ingresados'
      )
      return
    }

    setErrorText('Ha ocurrido un error, intenta de nuevo')
  }, [error])

  return (
    <SafeAreaInsetsView>
      <FormProvider {...form}>
        <View className="min-h-screen py-3 flex flex-col flex-1 flex-grow justify-center">
          <View>
            <ScrollView className="flex flex-grow w-full px-3 mx-auto space-y-3">
              <View className="mb-3">
                <Text className="text-xl text-center font-bold dark:text-white">
                  ¿Quieres ser conductor?
                </Text>
                <Text className="text-gray-500 text-sm mt-3 dark:text-gray-400">
                  Ya tenemos tu información básica, ahora necesitamos que nos
                  proporciones algunos datos para poder crear tu perfil de
                  conductor.
                </Text>
              </View>

              <View>
                <Input
                  name="id"
                  label="Identificación"
                  keyboardType="numeric"
                  disabled={isDisabled}
                />
              </View>

              <View>
                <PhotoPicker
                  label="Foto de perfil"
                  mode="take"
                  disabled={isDisabled}
                  onSelect={onSelectProfilePhoto}
                />

                {watch('photo_url') !== undefined && (
                  <Text className="text-green-600 text-xs font-medium mt-0.5 dark:text-green-500">
                    Foto cargada
                  </Text>
                )}

                {errors.photo_url !== undefined && (
                  <FieldError message={errors.photo_url.message} />
                )}
              </View>

              <Text className="font-medium text-base text-center text-gray-900 dark:text-gray-200">
                Documentos
              </Text>

              <View>
                <View>
                  <Text className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Documento de identidad
                  </Text>
                </View>
                <View className="flex flex-row justify-center space-x-1">
                  <View className="basis-1/2">
                    <PhotoPicker
                      label="Parte frontal"
                      mode="take"
                      disabled={isDisabled}
                      onSelect={(photo) => {
                        handleDocumentPhotoChange('id_photo_url_front', photo)
                      }}
                    />

                    {watch('id_photo_url_front') !== undefined && (
                      <Text className="text-green-600 text-xs font-medium mt-0.5 dark:text-green-500">
                        Foto cargada
                      </Text>
                    )}

                    {errors.id_photo_url_front !== undefined && (
                      <FieldError message={errors.id_photo_url_front.message} />
                    )}
                  </View>
                  <View className="basis-1/2">
                    <PhotoPicker
                      label="Parte trasera"
                      mode="take"
                      disabled={isDisabled}
                      onSelect={(photo) => {
                        handleDocumentPhotoChange('id_photo_url_back', photo)
                      }}
                    />

                    {watch('id_photo_url_back') !== undefined && (
                      <Text className="text-green-600 text-xs font-medium mt-0.5 dark:text-green-500">
                        Foto cargada
                      </Text>
                    )}

                    {errors.id_photo_url_back !== undefined && (
                      <FieldError message={errors.id_photo_url_back.message} />
                    )}
                  </View>
                </View>
              </View>

              <View>
                <Text className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Licencia de conducir
                </Text>
                <View className="flex flex-row justify-center space-x-1">
                  <View className="basis-1/2">
                    <PhotoPicker
                      label="Parte frontal"
                      mode="take"
                      disabled={isSubmitting || isLoading}
                      onSelect={(photo) => {
                        handleDocumentPhotoChange(
                          'license_photo_url_front',
                          photo
                        )
                      }}
                    />

                    {watch('license_photo_url_front') !== undefined && (
                      <Text className="text-green-600 text-xs font-medium mt-0.5 dark:text-green-500">
                        Foto cargada
                      </Text>
                    )}

                    {errors.license_photo_url_front !== undefined && (
                      <FieldError
                        message={errors.license_photo_url_front.message}
                      />
                    )}
                  </View>
                  <View className="basis-1/2">
                    <PhotoPicker
                      label="Parte trasera"
                      mode="take"
                      disabled={isDisabled}
                      onSelect={(photo) => {
                        handleDocumentPhotoChange(
                          'license_photo_url_back',
                          photo
                        )
                      }}
                    />

                    {watch('license_photo_url_back') !== undefined && (
                      <Text className="text-green-600 text-xs font-medium mt-0.5 dark:text-green-500">
                        Foto cargada
                      </Text>
                    )}

                    {errors.license_photo_url_back !== undefined && (
                      <FieldError
                        message={errors.license_photo_url_back.message}
                      />
                    )}
                  </View>
                </View>
              </View>

              {error !== null && <FieldError message={errorText} />}

              <View>
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isDisabled}
                  className={cn(
                    'text-base px-6 py-3.5 bg-blue-700 mt-6 rounded-lg border border-transparent',
                    'active:bg-blue-800',
                    isDisabled &&
                      'bg-gray-300 text-gray-700 cursor-not-allowed',
                    isDisabled && 'dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  <Text className="text-base font-medium text-center text-white">
                    Enviar
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </FormProvider>
    </SafeAreaInsetsView>
  )
}

export default RegisterDriverScreen
