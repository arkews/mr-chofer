import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Home: undefined

  SignIn: undefined
  SignUp: undefined

  RoleSelection: undefined

  RegisterDriver: undefined
  DriverDetails: undefined

  RegisterPassenger: undefined
  PassengerDetails: undefined

  RegisterVehicle: undefined

  RegisterRideRequest: undefined
  RideDetails: undefined
  RequestedRides: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
RootStackParamList,
Screen
>
