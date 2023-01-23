import { FC } from 'react'
import { Text, View, Pressable } from 'react-native'
import { Ride } from '@base/rides/types'
import { genders } from '@constants/genders'

type Props = {
  ride: Ride
}

const RequestedRideCard: FC<Props> = ({ ride }) => {
  return (
    <View
      className="p-2 mt-3 w-full text-gray-500 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-400">
      <View className="flex">
        <View className="flex flex-row flex-wrap">
          <View className="flex-shrink-0 items-center justify-center w-1/5 mr-3">
            <View>
              <Text className="text-sm font-medium leading-none dark:text-white">
                User picture
              </Text>
            </View>
          </View>

          <View className="flex flex-col">
            {
              ride.passengers !== undefined && (
                <Text className="text-xs font-medium leading-none dark:text-white">
                  {ride.passengers?.name}, {genders.find((g) => g.value === ride.passengers?.gender)?.title}
                </Text>
              )
            }
            <View className="flex flex-row">
              <Text className="text-sm font-medium leading-none dark:text-white">De: </Text>
              <Text className="text-sm leading-none dark:text-white">{ride.pickup_location}</Text>
            </View>

            <View className="flex flex-row">
              <Text className="text-sm font-medium leading-none dark:text-white">Para: </Text>
              <Text className="text-sm leading-none dark:text-white">{ride.destination}</Text>
            </View>

            <View className="flex flex-row">
              <Text className="text-sm font-medium leading-none dark:text-white">
                Precio ofrecido:{' '}
              </Text>
              <Text className="text-sm leading-none text-green-700 dark:text-green-400">
                {Intl.NumberFormat('es', {
                  style: 'currency',
                  currency: 'COP'
                }).format(ride.offered_price)}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex justify-end mt-3">
          <Pressable
            className="px-3 py-2 text-sm text-center font-medium text-white bg-green-700 rounded-lg active:bg-green-800">
            <Text className="text-xs text-white text-center">Aceptar solicitud</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default RequestedRideCard
