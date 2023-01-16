import 'react-native-url-polyfill/auto'

import { Buffer } from 'buffer'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import { AuthProvider } from './auth/context'
import { FC } from 'react'

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
            <Navigation colorScheme={colorScheme}/>
            <StatusBar/>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    )
  }
}

export default App
