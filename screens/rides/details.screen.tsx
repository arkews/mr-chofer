import { FC } from 'react'
import { Text, View } from 'react-native'
import useCurrentPassengerRide
  from '@base/rides/hooks/use-current-passenger-ride'
import { RootStackScreenProps } from '@navigation/types'

type Props = RootStackScreenProps<'RideDetails'>

const RideDetailsScreen: FC<Props> = () => {
  const { ride, isLoading } = useCurrentPassengerRide()
  return (
    <View className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {isLoading && <Text className="dark:text-white">Loading...</Text>}
      {ride !== undefined && (
        <View className="flex flex-col space-y-5">
          <Text className="dark:text-white">Ride ID: {ride.id}</Text>
          <Text className="dark:text-white">Ride Status: {ride.status}</Text>
          <Text className="dark:text-white">Ride Driver ID: {ride.driver_id}</Text>
          <Text className="dark:text-white">Ride Passenger ID: {ride.passenger_id}</Text>
        </View>
      )}
    </View>
  )
}

export default RideDetailsScreen
