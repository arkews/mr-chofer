import { useAuth } from '@base/auth/context'
import CustomDrawer from '@base/components/drawer'
import MakeNequiPaymentScreen from '@base/screens/payments/nequi/make-payment.screen'
import { darkTheme, lightTheme } from '@constants/theme'
import { MaterialIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SignInScreen from '@screens/auth/sign-in.screen'
import SignUpScreen from '@screens/auth/sign-up.screen'
import AttachDriverDocumentsScreen from '@screens/drivers/attach-documents.screen'
import DriverDetailsScreen from '@screens/drivers/details.screen'
import RegisterDriverScreen from '@screens/drivers/register.screen'
import HomeScreen from '@screens/home.screen'
import PassengerDetailsScreen from '@screens/passengers/details.screen'
import RegisterPassengerScreen from '@screens/passengers/register.screen'
import RegisterRatingScreen from '@screens/rating/register.screen'
import DriverRideDetailsScreen from '@screens/rides/drivers/details.screen'
import PassengerRideDetailsScreen from '@screens/rides/passengers/details.screen'
import RequestedRidesScreen from '@screens/rides/requested.screen'
import RegisterVehicleScreen from '@screens/vehicles/register.screen'
import { styled } from 'nativewind'
import { FC } from 'react'
import { ColorSchemeName } from 'react-native'
import { RootStackParamList } from './types'

const DriverTabNavigation = createBottomTabNavigator<RootStackParamList>()
const StyledIcon = styled(MaterialIcons)

const DriverNavigation: FC = () => {
  return (
    <DriverTabNavigation.Navigator
      initialRouteName="RequestedRides"
      screenOptions={{ headerShown: false }}
    >
      <DriverTabNavigation.Screen
        name="RequestedRides"
        options={{
          title: 'Solicitudes',
          tabBarIcon: () => (
            <StyledIcon
              name="near-me"
              className="h-30 w-30 text-2xl dark:text-white"
            />
          )
        }}
        component={RequestedRidesScreen}
      />
      <DriverTabNavigation.Screen
        name="DriverDetails"
        options={{
          title: 'Perfil',
          tabBarIcon: () => (
            <StyledIcon
              name="person"
              className="h-30 w-30 text-2xl dark:text-white"
            />
          )
        }}
        component={DriverDetailsScreen}
      />
    </DriverTabNavigation.Navigator>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const RootNavigator: FC = () => {
  const { session } = useAuth()

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      {session === null && (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
      {session !== null && (
        <>
          <Stack.Screen
            name="PassengerDetails"
            component={PassengerDetailsScreen}
          />
          <Stack.Screen
            name="RegisterPassenger"
            component={RegisterPassengerScreen}
          />
          <Stack.Screen
            name="RegisterDriver"
            component={RegisterDriverScreen}
          />
          <Stack.Screen
            name="AttachDriverDocuments"
            component={AttachDriverDocumentsScreen}
          />
          <Stack.Screen name="DriverNavigation" component={DriverNavigation} />
          <Stack.Screen
            name="RegisterVehicle"
            component={RegisterVehicleScreen}
          />
          <Stack.Screen
            name="PassengerRideDetails"
            component={PassengerRideDetailsScreen}
          />
          <Stack.Screen
            name="DriverRideDetails"
            component={DriverRideDetailsScreen}
          />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen
              name="RegisterRating"
              component={RegisterRatingScreen}
            />
          </Stack.Group>

          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen
              name="MakeNequiPayment"
              component={MakeNequiPaymentScreen}
            />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  )
}

const Drawer = createDrawerNavigator<RootStackParamList>()

const DrawerNavigation: FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainDrawer"
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="MainDrawer" component={RootNavigator} />
    </Drawer.Navigator>
  )
}

const Navigation: FC<{ colorScheme: ColorSchemeName }> = ({ colorScheme }) => {
  return (
    <NavigationContainer
      theme={colorScheme === 'dark' ? darkTheme : lightTheme}
    >
      <DrawerNavigation />
    </NavigationContainer>
  )
}

export default Navigation
