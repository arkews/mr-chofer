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

export type RegisterRideRequest = z.infer<typeof RegisterRideRequestSchema>
