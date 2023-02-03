import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { NavigationProp } from '@react-navigation/native'

export type RootStackParamList = {
  Home: undefined

  SignIn: undefined
  SignUp: undefined

  DriverNavigation: undefined
  RegisterDriver: undefined
  DriverDetails: undefined

  RegisterPassenger: undefined
  PassengerDetails: undefined

  RegisterVehicle: undefined

  RegisterRideRequest: undefined
  RequestedRides: undefined

  PassengerRideDetails: undefined
  DriverRideDetails: undefined

  RegisterRating: { type: 'passenger' | 'driver', passengerId: string, driverId: string }
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
RootStackParamList,
Screen
>

export type StackNavigation = NavigationProp<RootStackParamList>
