import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ColorSchemeName } from 'react-native'
import { FC } from 'react'
import SignInScreen from '@screens/auth/sign-in.screen'
import SignUpScreen from '@screens/auth/sign-up.screen'
import { RootStackParamList } from './types'
import HomeScreen from '@screens/home.screen'
import RegisterDriverScreen from '@screens/drivers/register.screen'
import DriverDetailsScreen from '@screens/drivers/details.screen'
import RegisterPassengerScreen from '@screens/passengers/register.screen'
import PassengerDetailsScreen from '@screens/passengers/details.screen'
import RegisterVehicleScreen from '@screens/vehicles/register.screen'
import { useAuth } from '@base/auth/context'
import PassengerRideDetailsScreen
  from '@screens/rides/passengers/details.screen'
import RequestedRidesScreen from '@screens/rides/requested.screen'
import DriverRideDetailsScreen from '@screens/rides/drivers/details.screen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { styled } from 'nativewind'
import { MaterialIcons } from '@expo/vector-icons'
import { darkTheme, lightTheme } from '@constants/theme'

const DriverTabNavigation = createBottomTabNavigator<RootStackParamList>()
const StyledIcon = styled(MaterialIcons)

const DriverNavigation: FC = () => {
  return (
    <DriverTabNavigation.Navigator
      initialRouteName="RequestedRides"
      screenOptions={{ headerShown: false }}>
      <DriverTabNavigation.Screen
        name="RequestedRides"
        options={{
          title: 'Solicitudes',
          tabBarIcon: () => (
            <StyledIcon name="near-me"
                        className="h-30 w-30 text-2xl dark:text-white"/>)

        }}
        component={RequestedRidesScreen}/>
      <DriverTabNavigation.Screen
        name="DriverDetails"
        options={{
          title: 'Perfil',
          tabBarIcon: () => (
            <StyledIcon name="person"
                        className="h-30 w-30 text-2xl dark:text-white"/>)
        }}
        component={DriverDetailsScreen}/>
    </DriverTabNavigation.Navigator>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const RootNavigator: FC = () => {
  const { session } = useAuth()

  return (
    <Stack.Navigator initialRouteName="Home"
                     screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"
                    component={HomeScreen}/>
      {
        session === null && (
          <>
            <Stack.Screen name="SignIn"
                          component={SignInScreen}/>
            <Stack.Screen name="SignUp"
                          component={SignUpScreen}/>
          </>
        )
      }
      {
        session !== null && (
          <>
            <Stack.Screen
              name="PassengerDetails"
              component={PassengerDetailsScreen}/>
            <Stack.Screen name="RegisterPassenger"
                          component={RegisterPassengerScreen}/>
            <Stack.Screen name="RegisterDriver"
                          component={RegisterDriverScreen}/>
            <Stack.Screen name="DriverNavigation"
                          component={DriverNavigation}/>
            <Stack.Screen name="RegisterVehicle"
                          component={RegisterVehicleScreen}/>
            <Stack.Screen name="PassengerRideDetails"
                          component={PassengerRideDetailsScreen}/>
            <Stack.Screen name="DriverRideDetails"
                          component={DriverRideDetailsScreen}/>
          </>
        )
      }
    </Stack.Navigator>
  )
}

const Navigation: FC<{ colorScheme: ColorSchemeName }> = ({ colorScheme }) => {
  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <RootNavigator/>
    </NavigationContainer>
  )
}

export default Navigation
