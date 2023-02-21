import { DrawerNavigationProp } from '@react-navigation/drawer'
import { NavigationProp } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Home: undefined

  SignIn: undefined
  SignUp: undefined

  DriverNavigation: undefined
  RegisterDriver: undefined
  AttachDriverDocuments: undefined
  DriverDetails: undefined

  RegisterPassenger: undefined
  PassengerDetails: undefined

  RegisterVehicle: undefined

  RegisterRideRequest: undefined
  RequestedRides: undefined

  PassengerRideDetails: undefined
  DriverRideDetails: undefined

  RegisterRating: {
    type: 'passenger' | 'driver'
    passengerId: string
    driverId: string
  }

  MainDrawer: undefined

  MakeNequiPayment: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>

export type StackNavigation = NavigationProp<RootStackParamList>
export type DrawerNavigation = DrawerNavigationProp<RootStackParamList>
