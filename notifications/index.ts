
import * as Device from 'expo-device'
import { Subscription } from 'expo-modules-core'
import * as Notifications from 'expo-notifications'
import { NotificationContentInput, NotificationTriggerInput } from 'expo-notifications'
import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

export type UserNotification = {
  token: string
  user_id: string
  user_type: string
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
})

export const schedulePushNotification = async (content: NotificationContentInput, trigger: NotificationTriggerInput = null) => {
  await Notifications.scheduleNotificationAsync({
    content,
    trigger
  })
}

async function registerForPushNotificationsAsync () {
  let token

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
      return
    }
    token = (await Notifications.getExpoPushTokenAsync()).data
    console.log(token)
  } else {
    alert('Must use physical device for Push Notifications')
  }

  return token
}

const useNotifications = () => {
  const [token, setExpoPushToken] = useState<string | undefined>('')
  const [, setNotification] = useState<Notifications.Notification>()
  const notificationListener = useRef<Subscription>()
  const responseListener = useRef<Subscription>()

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => { setExpoPushToken(token) })

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response)
    })

    return () => {
      if (notificationListener.current !== undefined) Notifications.removeNotificationSubscription(notificationListener.current)
      if (responseListener.current !== undefined) Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  return {
    token
  }
}

export default useNotifications
