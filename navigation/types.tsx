import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Home: undefined

  SignIn: undefined
  SignUp: undefined

  RegisterDriver: undefined
  DriverDetails: undefined

  RegisterPassenger: undefined
  PassengerDetails: undefined

  RegisterVehicle: undefined

  RegisterRideRequest: undefined
  RequestedRides: undefined

  PassengerRideDetails: undefined
  DriverRideDetails: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
RootStackParamList,
Screen
>
