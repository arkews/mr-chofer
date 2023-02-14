import { schedulePushNotification } from '@base/notifications'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
} from '@supabase/supabase-js'
import { Audio } from 'expo-av'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { Vibration } from 'react-native'
import { NewRidesChannel } from '../realtime/channels'
import { RideStatus } from '../types'

const CHECK_RIDES = 'check-rides'

TaskManager.defineTask(CHECK_RIDES, async () => {
  const channel = NewRidesChannel()

  channel
    .on(
      REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
      {
        event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
        schema: 'public',
        table: 'rides',
        filter: `status=eq.${RideStatus.requested}`
      },
      async () => {
        Vibration.vibrate(1500)
        const { sound } = await Audio.Sound.createAsync(
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('../../assets/sounds/ride-toast.mp3')
        )
        await sound.playAsync()
        await schedulePushNotification({
          title: 'Hay una nueva solicitud'
        })
      }
    )
    .subscribe()

  return BackgroundFetch.BackgroundFetchResult.NewData
})

export const registerCheckRidesBackgroundTask = async () => {
  await BackgroundFetch.registerTaskAsync(CHECK_RIDES, {
    minimumInterval: 15,
    stopOnTerminate: false,
    startOnBoot: true
  })
}

export const unregisterCheckRidesBackgroundTask = async () => {
  await BackgroundFetch.unregisterTaskAsync(CHECK_RIDES)
}

export const checkStatusForCheckRides = async () => {
  const status = await BackgroundFetch.getStatusAsync()
  const isRegistered = await TaskManager.isTaskRegisteredAsync(CHECK_RIDES)

  if (process.env.NODE_ENV === 'development') {
    console.log(
      'Background fetch status:',
      status !== null && BackgroundFetch.BackgroundFetchStatus[status]
    )
    console.log('Background fetch is registered:', isRegistered)
  }
}
