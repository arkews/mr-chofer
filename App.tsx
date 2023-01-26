import 'react-native-url-polyfill/auto'
import 'intl'
import 'intl/locale-data/jsonp/en'
import 'intl/locale-data/jsonp/es'

import { Buffer } from 'buffer'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from 'react-native-toast-notifications'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import { AuthProvider } from './auth/context'
import { FC } from 'react'
import RideToast from '@base/rides/components/toast'

global.Buffer = Buffer

const queryClient = new QueryClient()

const App: FC = () => {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  if (!isLoadingComplete) {
    return null
  } else {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider offsetTop={50} renderType={{
              ride_toast: (toast) => (
                <RideToast ride={toast.data} onPress={toast.onHide}/>
              )
            }}>
              <Navigation colorScheme={colorScheme}/>
              <StatusBar/>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    )
  }
}

export default App
