import { FC, useEffect, useState } from 'react'
import { RootStackScreenProps } from '@navigation/types'
import { useAuth } from '@base/auth/context'
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@base/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cn from 'classnames'
import PhotoPicker from '@components/form/photo-picker'
import { uploadAvatar, uploadDocumentPhoto } from '@base/supabase/storage'
import { Photo } from '@shared/types'
import usePassenger from '@hooks/passengers/use-passenger'

const RegisterDriverSchema = z.object({
  id: z.string({ required_error: 'Identificación requerida' })
    .min(1, 'Identificación requerida'),
  name: z.string({ required_error: 'Nombre requerido' })
    .min(1, 'Nombre requerido'),
  city: z.string({ required_error: 'Ciudad requerida' })
    .min(1, 'Ciudad requerida'),
  phone: z.string({ required_error: 'Número de teléfono requerido' })
    .min(1, 'Número de teléfono requerido'),
  gender: z.string({ required_error: 'Debe seleccionar un sexo' })
    .min(1, 'Debe seleccionar un sexo'),
  photo_url: z.string({ required_error: 'Debe seleccionar una foto' })
    .min(1, 'Debe seleccionar una foto'),
  id_photo_url_front: z.string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  license_photo_url_front: z.string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  id_photo_url_back: z.string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  license_photo_url_back: z.string({ required_error: 'Debe subir este documento' })
    .min(1, 'Debe subir este documento'),
  user_id: z.string({ required_error: 'Debe seleccionar un usuario' })
    .min(1, 'Debe seleccionar un usuario')
})

type DriverData = z.infer<typeof RegisterDriverSchema>
type DriverMutationData = Omit<DriverData, 'phoneConfirmation'>

type Props = RootStackScreenProps<'RegisterDriver'>

type DocumentPhotoField =
  'id_photo_url_front'
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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<DriverData>({
    resolver: zodResolver(RegisterDriverSchema),
    defaultValues: {
      ...passenger,
      id: undefined
    }
  })

  const [documentPhotos, setDocumentPhotos] = useState<DocumentPhotos>(new Map())
  const handleDocumentPhotoChange = (field: DocumentPhotoField, photo: Photo) => {
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
      throw Error(error.message)
    }
  }

  const queryClient = useQueryClient()
  const { mutate, isLoading, error } = useMutation(registerDriver, {
    onSuccess: () => {
      void queryClient.invalidateQueries(['passenger', session?.user.id])
      navigation.replace('RegisterVehicle')
    }
  })

  const onSubmit: SubmitHandler<DriverData> = async data => {
    if (profilePhoto !== null) {
      const photoUrl = await uploadAvatar(data.user_id, profilePhoto)
      if (photoUrl === undefined) {
        Alert.alert('Tuvimos un problema al subir tu foto, intenta de nuevo')
        return
      }

      data.photo_url = photoUrl
    }

    for (const [field, photo] of documentPhotos) {
      const documentUrl = await uploadDocumentPhoto(`${data.user_id}-${field}`, photo)
      if (documentUrl === undefined) {
        Alert.alert('Tuvimos un problema al subir tus documentos, intenta de nuevo')
        return
      }

      data[field] = documentUrl
    }

    mutate(data)
  }

  return (
    <KeyboardAvoidingView>
      <View className="py-36">
        <View
          className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
          <View className="mb-7">
            <Text className="text-xl text-center dark:text-white">
              ¿Quieres ser conductor?
            </Text>
            <Text
              className="text-gray-500 text-base text-sm mt-3 dark:text-gray-400">
              Ya tenemos tu información básica, ahora necesitamos que nos
              proporciones algunos datos para poder crear tu perfil de
              conductor.
            </Text>
          </View>

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text className="dark:text-white">Identificación</Text>
                <TextInput
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting && !isLoading}
                  className={
                    cn('border text-lg px-4 py-3 mt-2 rounded-lg border-gray-200 text-gray-900 outline-none',
                      'focus:border-blue-600 focus:ring-0',
                      'dark:text-white',
                      isSubmitting && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                      isSubmitting && 'dark:bg-gray-800 dark:text-gray-400')
                  }
                />

                {(errors.id !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.id.message}
                  </Text>}
              </View>
            )}
            name="id"
          />

          {
            (passenger?.photo_url === undefined || passenger.photo_url === null) &&
            <View>
              <PhotoPicker label="Foto de perfil"
                           onSelect={onSelectProfilePhoto}/>

              {
                watch('photo_url') !== undefined &&
                <Text className="text-green-500 text-xs mt-0.5">
                  Foto cargada
                </Text>
              }

              {(errors.photo_url !== undefined) &&
                <Text className="text-red-500 text-xs mt-0.5">
                  {errors.photo_url.message}
                </Text>}
            </View>
          }

          <Text
            className="dark:text-white text-center text-base">Documentos</Text>

          <View>
            <Text className="dark:text-white mb-2">Documento de identidad</Text>
            <View className="flex flex-row space-x-2">
              <View className="basis-1/2">
                <PhotoPicker label="Parte frontal" mode="take"
                             disabled={isSubmitting || isLoading}
                             onSelect={(photo) => {
                               handleDocumentPhotoChange('id_photo_url_front', photo)
                             }}/>

                {
                  watch('id_photo_url_front') !== undefined &&
                  <Text className="text-green-500 text-xs mt-0.5">
                    Foto cargada
                  </Text>
                }

                {(errors.id_photo_url_front !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.id_photo_url_front.message}
                  </Text>}
              </View>
              <View className="basis-1/2">
                <PhotoPicker label="Parte trasera" mode="take"
                             disabled={isSubmitting || isLoading}
                             onSelect={(photo) => {
                               handleDocumentPhotoChange('id_photo_url_back', photo)
                             }}/>

                {
                  watch('id_photo_url_back') !== undefined &&
                  <Text className="text-green-500 text-xs mt-0.5">
                    Foto cargada
                  </Text>
                }

                {(errors.id_photo_url_back !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.id_photo_url_back.message}
                  </Text>}
              </View>
            </View>
          </View>

          <View>
            <Text className="dark:text-white mb-2">Licencia de conducir</Text>
            <View className="flex flex-row space-x-2">
              <View className="basis-1/2">
                <PhotoPicker label="Parte frontal" mode="take"
                             disabled={isSubmitting || isLoading}
                             onSelect={(photo) => {
                               handleDocumentPhotoChange('license_photo_url_front', photo)
                             }}/>

                {
                  watch('license_photo_url_front') !== undefined &&
                  <Text className="text-green-500 text-xs mt-0.5">
                    Foto cargada
                  </Text>
                }

                {(errors.license_photo_url_front !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.license_photo_url_front.message}
                  </Text>}
              </View>
              <View className="basis-1/2">
                <PhotoPicker label="Parte trasera" mode="take"
                             disabled={isSubmitting || isLoading}
                             onSelect={(photo) => {
                               handleDocumentPhotoChange('license_photo_url_back', photo)
                             }}/>

                {
                  watch('license_photo_url_back') !== undefined &&
                  <Text className="text-green-500 text-xs mt-0.5">
                    Foto cargada
                  </Text>
                }

                {(errors.license_photo_url_back !== undefined) &&
                  <Text className="text-red-500 text-xs mt-0.5">
                    {errors.license_photo_url_back.message}
                  </Text>}
              </View>
            </View>
          </View>

          {
            error !== null &&
            <Text className="text-red-500 text-xs">
              Ha ocurrido un error, verifique los datos e intente nuevamente.
            </Text>
          }

          <View>
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || isLoading}
              className={
                cn('text-base px-6 py-3.5 bg-blue-700 mt-6 rounded-lg border border-transparent',
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
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default RegisterDriverScreen
