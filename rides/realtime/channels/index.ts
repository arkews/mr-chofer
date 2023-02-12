import { supabase } from '@base/supabase'

export const RideChangesChannel = () => supabase.channel('rides-changes')
export const RideChangesBroadcastChannel = () => supabase.channel('rides-changes')
export const NewRidesChannel = () => supabase.channel('new-rides')
export const PassengerRideChannel = () => supabase.channel('passenger-ride')
export const DriverRideChannel = () => supabase.channel('driver-ride')
export const ActiveDriversChannel = () => supabase.channel('active-drivers')
