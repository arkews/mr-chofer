import 'intl'
import 'intl/locale-data/jsonp/en'
import 'intl/locale-data/jsonp/es'
import 'react-native-url-polyfill/auto'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Buffer } from 'buffer'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ToastProvider } from 'react-native-toast-notifications'

import RideToast from '@base/rides/components/toast'
import Constants from 'expo-constants'
import { FC } from 'react'
import * as Sentry from 'sentry-expo'
import { AuthProvider } from './auth/context'
import useVersionCheck from './hooks/use-version-check'
import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import useNotifications from './notifications'

global.Buffer = Buffer

const queryClient = new QueryClient()

Sentry.init({
  dsn: Constants.manifest?.extra?.sentry.dsn,
  enableInExpoDevelopment: true,
  debug: true,
  tracesSampleRate: 1.0
})

const App: FC = () => {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  useNotifications()
  useVersionCheck()

  if (!isLoadingComplete) {
    return null
  } else {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider
              offsetTop={50}
              renderType={{
                ride_toast: (toast) => (
                  <RideToast
                    id={toast.id}
                    ride={toast.data}
                    onPress={toast.onHide}
                  />
                )
              }}
            >
              <Navigation colorScheme={colorScheme} />
              <StatusBar />
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    )
  }
}

export default App
