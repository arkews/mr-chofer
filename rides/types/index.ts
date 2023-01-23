import { RegisterRideRequest } from '@base/rides/schema'

export type RideStatus =
  'requested'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'canceled'

type RidePassenger = {
  name: string
  phone: string
}

type RideDriver = {
  name: string
  phone: string
}

export type Ride = RegisterRideRequest & {
  id: number
  driver_id?: string
  status: RideStatus
  request_time: string
  start_time: string
  end_time: string

  passenger?: RidePassenger
  driver?: RideDriver
}
