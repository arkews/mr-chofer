import { FC, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View
} from 'react-native'
import { z } from 'zod'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'
import { RootStackScreenProps } from '@navigation/types'
import { useAuth } from '@base/auth/context'
import { Photo } from '@shared/types'
import { uploadAvatar } from '@base/supabase/storage'
import cn from 'classnames'
import PhotoPicker from '@components/form/photo-picker'
import RadioGroup from '@components/form/radio-group'
import { genders } from '@constants/genders'
import Input from '@components/form/input'
import FieldError from '@components/form/feedback/field/field.error'

const RegisterPassengerSchema = z.object({
  name: z.string({ required_error: 'Nombre requerido' })
    .min(1, 'Nombre requerido'),
  city: z.string({ required_error: 'Ciudad requerida' })
    .min(1, 'Ciudad requerida'),
  phone: z.string({ required_error: 'Número de teléfono requerido' })
    .min(1, 'Número de teléfono requerido'),
  phoneConfirmation: z.string({ required_error: 'Debe confirmar el número de teléfono' })
    .min(1, 'Debe confirmar el número de teléfono'),
  gender: z.string({ required_error: 'Debe seleccionar un sexo' })
    .min(1, 'Debe seleccionar un sexo'),
  photo_url: z.string().optional().nullable(),
  user_id: z.string({ required_error: 'Debe seleccionar un usuario' })
    .min(1, 'Debe seleccionar un usuario')
}).refine(data => data.phone === data.phoneConfirmation, {
  message: 'Los números de teléfono no coinciden',
  path: ['phoneConfirmation']
})

type PassengerData = z.infer<typeof RegisterPassengerSchema>
type PassengerMutationData = Omit<PassengerData, 'phoneConfirmation'>

type Props = RootStackScreenProps<'RegisterPassenger'>

const RegisterPassengerScreen: FC<Props> = ({ navigation }) => {
  const { session } = useAuth()
  useEffect(() => {
    if (session != null && session.user.id !== '') {
      setValue('user_id', session.user.id)
    }
  }, [session])

  const form = useForm<PassengerData>({
    resolver: zodResolver(RegisterPassengerSchema)
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = form

  const [photo, setPhoto] = useState<Photo | null>(null)

  const registerPassenger = async (data: PassengerMutationData): Promise<void> => {
    const { error } = await supabase.from('passengers').insert(data)

    if (error !== null) {
      throw Error(error.message)
    }
  }

  const { mutate, isLoading, error } = useMutation(registerPassenger, {
    onSuccess: () => {
      navigation.replace('PassengerDetails')
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

    const { phoneConfirmation, ...rest } = data

    mutate(rest)
  }

  return (
    <FormProvider {...form}>
      <KeyboardAvoidingView>
        <View className="py-24">
          <View
            className="flex flex-grow w-full px-5 justify-center mx-auto space-y-3">
            <View className="mb-3">
              <Text className="text-xl text-center dark:text-white">
                Cuentanos un poco sobre ti
              </Text>
              <Text
                className="text-gray-500 text-base text-sm mt-3 dark:text-gray-400">
                Solo necesitamos algunos datos para poder crear tu perfil
              </Text>
            </View>

            <View>
              <Input
                name="name"
                label="Nombre"
                enablesReturnKeyAutomatically/>
            </View>

            <View>
              <Input
                name="city"
                label="Ciudad"
                enablesReturnKeyAutomatically/>
            </View>

            <View>
              <Input
                name="phone"
                label="Teléfono"
                keyboardType="numeric"
                enablesReturnKeyAutomatically/>
            </View>

            <View>
              <Input
                name="phoneConfirmation"
                label="Confirmar teléfono"
                keyboardType="numeric"
                enablesReturnKeyAutomatically/>
            </View>

            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="mt-4">
                  <Text className="mb-2 dark:text-white">Sexo</Text>
                  <RadioGroup values={genders} selected={value}
                              onSelect={onChange}/>

                  {(errors.gender != null) &&
                    <FieldError message={errors.gender.message}/>
                  }
                </View>
              )}
              name="gender"
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

            <View className="pt-5">
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
          </View>
        </View>
      </KeyboardAvoidingView>
    </FormProvider>
  )
}

export default RegisterPassengerScreen
