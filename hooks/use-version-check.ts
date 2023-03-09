import { useEffect } from 'react'
import { Alert, BackHandler, Linking } from 'react-native'
import VersionCheck from 'react-native-version-check'

const useVersionCheck = () => {
  const checkVersion = async () => {
    try {
      const updateNeeded = await VersionCheck.needUpdate()

      if (updateNeeded === null || updateNeeded === undefined) {
        return
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!updateNeeded.isNeeded) {
        return
      }

      Alert.alert(
        'Nueva versión disponible',
        'Por favor, actualiza la aplicación para seguir disfrutando de ella.',
        [
          {
            text: 'Actualizar',
            onPress: async () => {
              BackHandler.exitApp()

              Linking.openURL(updateNeeded.storeUrl)
            }
          }
        ],
        { cancelable: false }
      )
    } catch (error) {}
  }

  useEffect(() => {
    checkVersion()
  }, [])
}

export default useVersionCheck
