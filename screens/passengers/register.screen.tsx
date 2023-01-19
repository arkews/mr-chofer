import { FC, useEffect, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'
import { RootStackScreenProps } from '@navigation/types'
import { useAuth } from '@base/auth/context'
import { Photo } from '@base/types'
import { uploadAvatar } from '@base/supabase/storage'
import cn from 'classnames'
import PhotoPicker from '@components/form/photo-picker'
import RadioGroup from '@components/form/radio-group'
import { genders } from '@constants/genders'

const RegisterPassengerSchema = z.object({
  name: z.string({ required_error: 'Nombre requerido' })
    .min(1, 'Nombre requerido'),
  gender: z.string({ required_error: 'Debe seleccionar un sexo' })
    .min(1, 'Debe seleccionar un sexo'),
  phone: z.string({ required_error: 'Número de teléfono requerido' })
    .min(1, 'Número de teléfono requerido'),
  photo_url: z.string().optional(),
  user_id: z.string({ required_error: 'Debe seleccionar un usuario' })
    .min(1, 'Debe seleccionar un usuario')
})

type PassengerData = z.infer<typeof RegisterPassengerSchema>

type Props = RootStackScreenProps<'RegisterPassenger'>

const RegisterPassengerScreen: FC<Props> = ({ navigation }) => {
  const { session } = useAuth()
  useEffect(() => {
    if (session != null && session.user.id !== '') {
      setValue('user_id', session.user.id)
    }
  }, [session])

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PassengerData>({
    resolver: zodResolver(RegisterPassengerSchema)
  })
  const [photo, setPhoto] = useState<Photo | null>(null)

  const registerPassenger = async (data: PassengerData): Promise<void> => {
    const { error } = await supabase.from('passengers').insert(data)

    if (error !== null) {
      throw Error(error.message)
    }
  }

  const { mutate, isLoading, error } = useMutation(registerPassenger, {
    onSuccess: () => {
      navigation.navigate('PassengerDetails')
    }
  })

  const onSubmit: SubmitHandler<PassengerData> = async data => {
    if (photo !== null) {
      const photoUrl = await uploadAvatar(data.user_id, photo)
      if (photoUrl === undefined) {
        Alert.alert('Tuvimos un problema al subir tu foto, intenta de nuevo')
        return
      }

      data.photo_url = photoUrl
    }

    mutate(data)
  }

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      <Text className="text-xl text-center mb-7 dark:text-white">
        Registro de pasajero
      </Text>

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text className="dark:text-white">Nombre</Text>
            <TextInput
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

            {(errors.name != null) &&
              <Text className="text-red-500">{errors.name.message}</Text>}
          </>
        )}
        name="name"
      />

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="mt-4">
            <Text className="mb-2 dark:text-white">Sexo</Text>
            <RadioGroup values={genders} selected={value} onSelect={onChange}/>

            {(errors.gender != null) &&
              <Text className="text-red-500">{errors.gender.message}</Text>}
          </View>
        )}
        name="gender"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-4">
            <Text className="dark:text-white">Teléfono</Text>
            <TextInput
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

            {(errors.phone != null) &&
              <Text className="text-red-500">{errors.phone.message}</Text>}
          </View>
        )}
        name="phone"
      />

      <View>
        <PhotoPicker onSelect={setPhoto}/>
        {
          photo !== null &&
          <Text className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            Foto seleccionada {photo.name}
          </Text>
        }
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

export default RegisterPassengerScreen
