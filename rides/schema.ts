import { supabase } from '@base/supabase'
import { z } from 'zod'

export const RegisterRideRequestSchema = z.object({
  passenger_id: z.string({ required_error: 'El pasajero es requerido' })
    .min(1, 'El pasajero es requerido'),
  pickup_location: z.string({ required_error: 'La ubicación de recogida es requerida' })
    .min(1, 'La ubicación de recogida es requerida'),
  destination: z.string({ required_error: 'La ubicación de destino es requerida' })
    .min(1, 'La ubicación de destino es requerida'),
  offered_price: z.coerce.number({
    invalid_type_error: 'Digite un valor númerico',
    required_error: 'El precio es requerido'
  })
    .positive('El precio debe ser mayor a 0'),
  payment_method: z.enum(['cash']),
  gender: z.string({ required_error: 'El género es requerido' })
    .min(1, 'El género es requerido'),
  comments: z.string().optional().nullable()
})
  .refine(async data => {
    const key = data.gender === 'Male' ? 'MINIMUM_MALE_FARE' : 'MINIMUM_FEMALE_FARE'
    const { data: config, error } = await supabase.from('configuration')
      .select('value')
      .eq('key', key)
      .single()

    if (error !== null) {
      return true
    }

    if (config === null) {
      return true
    }

    const minimumFare = Number(config.value)

    return data.offered_price >= minimumFare
  }, {
    message: 'El precio debe ser mayor o igual al mínimo permitido',
    path: ['offered_price']
  })

export type RegisterRideRequest = z.infer<typeof RegisterRideRequestSchema>
