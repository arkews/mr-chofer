import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ColorSchemeName } from 'react-native'
import { FC } from 'react'
import SignInScreen from '../screens/sign-in.screen'

const Stack = createNativeStackNavigator()

const RootNavigator: FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={SignInScreen}
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
