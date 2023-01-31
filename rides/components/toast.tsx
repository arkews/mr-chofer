import { FC, useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { Ride, RideStatus } from '@base/rides/types'
import { getAvatarUrl } from '@base/supabase/storage'
import { genders } from '@constants/genders'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'

type Props = {
  ride: Ride

  onPress: () => void
}

const RideToast: FC<Props> = ({ ride, onPress }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (ride.drivers?.photo_url !== undefined && ride.drivers?.photo_url !== null) {
      getAvatarUrl(ride.drivers.photo_url)
        .then(url => {
          setAvatarUrl(url)
        })
    }
  }, [ride])

  const performAcceptRideRequest = async () => {
    const { error } = await supabase
      .from('rides')
      .update({
        driver_id: ride.driver_id,
        offered_price: ride.offered_price,
        status: RideStatus.accepted
      })
      .eq('id', ride.id)

    if (error !== null) {
      throw Error(error.message)
    }
  }

  const {
    mutate: acceptRideRequest
  } = useMutation(performAcceptRideRequest, {
    onSuccess: () => {
      onPress()
    }
  })

  return (
    <View className="px-7 w-full center-items">
      <View
        className="px-2 py-2 pb-1 mt-2 w-full mx-auto bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800">
        <View>
          <View className="flex flex-row">
            <View className="items-center justify-center w-1/5 mr-1">
              <View>
                {
                  avatarUrl !== null
                    ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-14 h-14 rounded-full mx-auto"
                      />
                      )
                    : (
                      <View
                        className="w-14 h-14 rounded-full mx-auto bg-gray-200"/>
                      )
                }
              </View>
            </View>

            <View className="w-4/5">
              <View className="flex flex-col space-y-2">
                <View>
                  <Text className="dark:text-white">
                    {ride.drivers?.name}, {genders.find((g) => g.value === ride.drivers?.gender)?.title}
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-700 dark:text-gray-400">
                    {
                      ride.drivers?.vehicles !== undefined && ride.drivers?.vehicles !== null && ride.drivers?.vehicles.length > 0 && (
                        <Text>
                          {ride.drivers?.vehicles[0].license_plate},{' '}
                          {ride.drivers?.vehicles[0].brand}{' '}
                          {ride.drivers?.vehicles[0].line}{' '}
                          {ride.drivers?.vehicles[0].model}{'. '}
                          {ride.drivers?.vehicles[0].color}
                        </Text>
                      )
                    }
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-700 dark:text-gray-400">
                    {
                      ride.drivers?.vehicles !== undefined && ride.drivers?.vehicles !== null && ride.drivers?.vehicles.length > 0 && (
                        <Text>
                          Cilindraje: {ride.drivers?.vehicles[0].engine_displacement}
                        </Text>
                      )
                    }
                  </Text>
                </View>

                <View className="mt-1.5">
                  <Text
                    className="text-sm font-medium text-green-700 dark:text-green-400">
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
              className="px-3 py-2 text-center text-white bg-green-700 rounded-md active:bg-green-800">
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
