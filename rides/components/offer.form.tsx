import { FC } from 'react'
import { z } from 'zod'
import Input from '@components/form/input'
import { Text, View } from 'react-native'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const MakeOfferSchema = z.object({
  offer: z.coerce.number({ invalid_type_error: 'Debe digitar un valor numérico' })
    .min(1, 'El precio ofrecido no puede ser 0').optional()
})

type MakeOfferData = z.infer<typeof MakeOfferSchema>

type Props = {
  onClose: (offer?: number) => void
}

const OfferForm: FC<Props> = ({ onClose }) => {
  const form = useForm<MakeOfferData>({
    resolver: zodResolver(MakeOfferSchema)
  })

  const {
    handleSubmit
  } = form

  const onSubmit: SubmitHandler<MakeOfferData> = data => {
    onClose(data.offer)
  }

  return (
    <FormProvider {...form}>
      <View className="flex items-center justify-center px-3 pb-2">
        <View
          className="w-full p-4 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700">
          <View
            className="flex flex-col space-y-5 items-center justify-center">
            <View>
              <Text
                className="text-xl font-medium text-gray-900 dark:text-gray-200">
                ¿Quieres hacer una oferta?
              </Text>
            </View>

            <View className="w-full">
              <Input
                name="offer"
                label="Precio ofrecido"
                keyboardType="numeric"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        </View>
      </View>
    </FormProvider>
  )
}

export default OfferForm
