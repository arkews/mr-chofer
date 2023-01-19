import { FC, useEffect } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { z } from 'zod'
import { RootStackScreenProps } from '@navigation/types'
import useDriver from '@hooks/drivers/use-driver'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'
import cn from 'classnames'
import RadioGroup from '@components/form/radio-group'
import { vehicleTypes } from '@constants/vehicle-types'

const RegisterVehicleSchema = z.object({
  license_plate: z.string({ required_error: 'Placa requerida' })
    .min(1, 'Placa requerida'),
  engine_displacement: z.string({ required_error: 'Cilindrada requerida' })
    .min(1, 'Cilindrada requerida'),
  brand: z.string({ required_error: 'Marca requerida' })
    .min(1, 'Marca requerida'),
  model: z.string({ required_error: 'Modelo requerido' })
    .min(1, 'Modelo requerido'),
  color: z.string({ required_error: 'Color requerido' })
    .min(1, 'Color requerido'),
  type: z.string({ required_error: 'Tipo requerido' })
    .min(1, 'Tipo requerido'),
  owner_id: z.string({ required_error: 'Dueño requerido' })
    .min(1, 'Dueño requerido'),
  soat: z.string().optional(),
  tecnomechanics: z.string().optional()
})

type VehicleData = z.infer<typeof RegisterVehicleSchema>

type Props = RootStackScreenProps<'RegisterVehicle'>

const RegisterVehicleScreen: FC<Props> = ({ navigation }) => {
  const { driver } = useDriver()
  useEffect(() => {
    if (driver !== undefined && driver !== null) {
      setValue('owner_id', driver.id)
    }
  }, [driver])

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<VehicleData>({
    resolver: zodResolver(RegisterVehicleSchema)
  })

  const registerVehicle = async (data: VehicleData): Promise<void> => {
    const { error } = await supabase.from('vehicles').insert(data)

    if (error !== null) {
      throw Error(error.message)
    }
  }

  const { mutate, isLoading, error } = useMutation(registerVehicle, {
    onSuccess: () => {
      navigation.replace('DriverDetails')
    }
  })

  const onSubmit: SubmitHandler<VehicleData> = data => {
    mutate(data)
  }

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      <Text className="text-xl text-center mb-7 dark:text-white">
        Registro de vehículo
      </Text>

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text className="dark:text-white">Placa</Text>
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

            {(errors.license_plate != null) &&
              <Text
                className="text-red-500">{errors.license_plate.message}</Text>}
          </>
        )}
        name="license_plate"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-4">
            <Text className="dark:text-white">Cilindraje (CC)</Text>
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

            {(errors.engine_displacement != null) &&
              <Text
                className="text-red-500">{errors.engine_displacement.message}</Text>}
          </View>
        )}
        name="engine_displacement"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-4">
            <Text className="dark:text-white">Marca</Text>
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

            {(errors.brand != null) &&
              <Text className="text-red-500">{errors.brand.message}</Text>}
          </View>
        )}
        name="brand"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-4">
            <Text className="dark:text-white">Modelo</Text>
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

            {(errors.model != null) &&
              <Text className="text-red-500">{errors.model.message}</Text>}
          </View>
        )}
        name="model"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mt-4">
            <Text className="dark:text-white">Color</Text>
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

            {(errors.color != null) &&
              <Text className="text-red-500">{errors.color.message}</Text>}
          </View>
        )}
        name="color"
      />

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="mt-4">
            <Text className="mb-2 dark:text-white">Tipo</Text>
            <RadioGroup values={vehicleTypes} selected={value}
                        onSelect={onChange}/>

            {(errors.type != null) &&
              <Text className="text-red-500">{errors.type.message}</Text>}
          </View>
        )}
        name="type"
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
          Enviar
        </Text>
      </Pressable>
    </View>
  )
}

export default RegisterVehicleScreen
