import { Ride, RideStatus } from '@base/rides/types'
import { supabase } from '@base/supabase'
import { getAvatarUrl } from '@base/supabase/storage'
import RatingView from '@components/rating.view'
import { genders } from '@constants/genders'
import { useMutation } from '@tanstack/react-query'
import { Audio } from 'expo-av'
import { FC, useEffect, useState } from 'react'
import { Image, Pressable, Text, Vibration, View } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import * as Sentry from 'sentry-expo'

type Props = {
  id: string
  ride: Ride

  onPress: () => void
}

const RideToast: FC<Props> = ({ id, ride, onPress }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (
      ride.drivers?.photo_url !== undefined &&
      ride.drivers?.photo_url !== null
    ) {
      getAvatarUrl(ride.drivers.photo_url).then((url) => {
        setAvatarUrl(url)
      })
    }
  }, [ride])

  const performAcceptRideRequest = async () => {
    const { data: driver } = await supabase
      .from('rides')
      .select('driver_id')
      .eq('status', RideStatus.accepted)
      .eq('driver_id', ride.driver_id)
      .single()

    if (driver !== null) {
      return 'driver_not_available'
    }

    const { error } = await supabase
      .from('rides')
      .update({
        driver_id: ride.driver_id,
        offered_price: ride.offered_price,
        status: RideStatus.accepted
      })
      .eq('id', ride.id)

    if (error !== null) {
      const rawError = new Error(error.message)
      Sentry.Native.captureException(rawError, {
        contexts: {
          ride,
          error
        }
      })
      throw rawError
    }
  }

  const toast = useToast()
  const { mutate: acceptRideRequest } = useMutation(performAcceptRideRequest, {
    onSuccess: (result) => {
      if (result === 'driver_not_available') {
        toast.hide(id)
        toast.show('El conductor ya está ocupado', {
          type: 'error'
        })
        return
      }

      toast.hideAll()
      onPress()
    }
  })

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../assets/sounds/ride-toast.mp3')
    )
    await sound.playAsync()
  }

  useEffect(() => {
    void playSound()
    Vibration.vibrate(1000)
  }, [])

  return (
    <View className="px-7 w-full center-items">
      <View className="px-2 py-2 pb-1 mt-2 w-full mx-auto bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800">
        <View>
          <View className="flex flex-row">
            <View className="items-center justify-center w-1/5 mr-1">
              <View>
                {avatarUrl !== null
                  ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-14 h-14 rounded-full mx-auto"
                  />
                    )
                  : (
                  <View className="w-14 h-14 rounded-full mx-auto bg-gray-200" />
                    )}
              </View>
            </View>

            <View className="w-4/5">
              <View className="flex flex-col space-y-2">
                <View className="flex flex-row space-x-4 -ml-3 flex-wrap justify-center">
                  <View>
                    <Text className="dark:text-white">
                      {ride.drivers?.name},{' '}
                      {
                        genders.find((g) => g.value === ride.drivers?.gender)
                          ?.title
                      }
                    </Text>
                  </View>

                  <View className="flex flex-row justify-center">
                    <View className="flex flex-col justify-center align-middle">
                      <RatingView
                        rating={ride.drivers?.rating ?? 0.0}
                        size={16}
                      />
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 dark:text-gray-400">
                    {ride.drivers?.vehicles !== undefined &&
                      ride.drivers?.vehicles !== null && (
                        <Text>
                          {ride.drivers?.vehicles.license_plate},{' '}
                          {ride.drivers?.vehicles.brand}{' '}
                          {ride.drivers?.vehicles.line}{' '}
                          {ride.drivers?.vehicles.model}
                          {'. '}
                          {ride.drivers?.vehicles.color}
                        </Text>
                    )}
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-700 dark:text-gray-400">
                    {ride.drivers?.vehicles !== undefined &&
                      ride.drivers?.vehicles !== null && (
                        <Text>
                          Cilindraje:{' '}
                          {ride.drivers?.vehicles.engine_displacement}
                        </Text>
                    )}
                  </Text>
                </View>

                <View className="mt-1.5">
                  <Text className="text-sm font-medium text-green-700 dark:text-green-400">
                    {Intl.NumberFormat('es', {
                      style: 'currency',
                      currency: 'COP'
                    }).format(ride.offered_price)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex justify-end mt-3">
            <Pressable
              onPress={() => {
                acceptRideRequest()
              }}
              className="px-3 py-2 text-center text-white bg-green-700 rounded-md active:bg-green-800"
            >
              <Text className="text-xs text-white text-center font-medium">
                Aceptar conductor
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}

export default RideToast
