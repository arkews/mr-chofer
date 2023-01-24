import { FC, useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { Ride } from '@base/rides/types'
import { genders } from '@constants/genders'
import { getAvatarUrl } from '@base/supabase/storage'

type Props = {
  ride: Ride

  onAccept: (rideId: number) => void
}

const RequestedRideCard: FC<Props> = ({ ride, onAccept }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (ride.passengers?.photo_url !== undefined && ride.passengers?.photo_url !== null) {
      getAvatarUrl(ride.passengers.photo_url)
        .then(url => {
          setAvatarUrl(url)
        })
    }
  }, [ride])

  return (
    <View
      className="px-1 py-2 pb-1 mt-2 w-full bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800">
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
                    <View className="w-14 h-14 rounded-full mx-auto bg-gray-200"/>
                    )
              }
            </View>
          </View>

          <View className="w-4/5">
            <View className="flex flex-col">
              {
                ride.passengers !== undefined && (
                  <Text
                    className="text-xs font-medium leading-none text-gray-500 dark:text-gray-400">
                    {ride.passengers?.name}, {genders.find((g) => g.value === ride.passengers?.gender)?.title}
                  </Text>
                )
              }

              <View className="flex flex-col justify-between my-1">
                <Text
                  className="text-base dark:text-white text-pink-800 font-medium dark:text-pink-300">
                  Origen: {ride.pickup_location}
                </Text>
                <Text className="dark:text-white">
                  Destino: {ride.destination}
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
            onPress={() => { onAccept(ride.id) }}
            className="px-3 py-2 text-center text-white bg-green-700 rounded-md active:bg-green-800">
            <Text className="text-xs text-white text-center font-medium">
              Aceptar solicitud
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default RequestedRideCard
