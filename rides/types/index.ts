import { RegisterRideRequest } from '@base/rides/schema'

export enum RideStatus {
  requested = 'requested',
  accepted = 'accepted',
  waiting = 'waiting',
  in_progress = 'in_progress',
  completed = 'completed',
  canceled = 'canceled'
}

type RidePassenger = {
  name: string
  phone: string
  gender: string
  photo_url: string
}

type RideDriverVehicle = {
  license_plate: string
  model: string
  line: string
  brand: string
  color: string
  engine_displacement: string
}

type RideDriver = {
  name: string
  phone: string
  gender: string
  photo_url: string
  rating: number

  vehicles?: RideDriverVehicle
}

export type Ride = RegisterRideRequest & {
  id: number
  driver_id?: string
  status: RideStatus
  request_time: string
  start_time: string
  end_time: string

  passengers?: RidePassenger
  drivers?: RideDriver
}
