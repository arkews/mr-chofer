import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  SignIn: undefined
  SignUp: undefined
  Home: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
RootStackParamList,
Screen
>
