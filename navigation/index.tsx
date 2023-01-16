import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ColorSchemeName } from 'react-native'
import { FC } from 'react'
import SignInScreen from '../screens/auth/sign-in.screen'
import SignUpScreen from '../screens/auth/sign-up.screen'

const Stack = createNativeStackNavigator()

const RootNavigator: FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignUp" component={SignUpScreen}
                    options={{ headerShown: false }}/>
      <Stack.Screen name="SignIn" component={SignInScreen}
                    options={{ headerShown: false }}/>
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
