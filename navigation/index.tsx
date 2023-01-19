import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ColorSchemeName } from 'react-native'
import { FC } from 'react'
import SignInScreen from '@screens/auth/sign-in.screen'
import SignUpScreen from '@screens/auth/sign-up.screen'
import { RootStackParamList } from './types'
import HomeScreen from '@screens/home.screen'
import RoleSelectionScreen from '@screens/role-selection.screen'
import RegisterDriverScreen from '@screens/drivers/register.screen'
import DriverDetailsScreen from '@screens/drivers/details.screen'
import RegisterPassengerScreen from '@screens/passengers/register.screen'
import PassengerDetailsScreen from '@screens/passengers/details.screen'

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator: FC = () => {
  return (
    <Stack.Navigator initialRouteName="Home"
                     screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"
                    component={HomeScreen}/>
      <Stack.Screen name="SignUp"
                    component={SignUpScreen}/>
      <Stack.Screen name="SignIn"
                    component={SignInScreen}/>
      <Stack.Screen name="RoleSelection"
                    component={RoleSelectionScreen}/>
      <Stack.Screen name="RegisterDriver"
                    component={RegisterDriverScreen}/>
      <Stack.Screen name="DriverDetails"
                    component={DriverDetailsScreen}/>
      <Stack.Screen name="RegisterPassenger"
                    component={RegisterPassengerScreen}/>
      <Stack.Screen name="PassengerDetails"
                    component={PassengerDetailsScreen}/>
    </Stack.Navigator>
  )
}

const Navigation: FC<{ colorScheme: ColorSchemeName }> = ({ colorScheme }) => {
  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator/>
    </NavigationContainer>
  )
}

export default Navigation
