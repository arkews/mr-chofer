import { FC } from 'react'
import { Text, View } from 'react-native'
import useRequestedRides from '@base/rides/hooks/use-requested-rides'

const RequestedRidesScreen: FC = () => {
  const { rides, isLoading } = useRequestedRides()

  return (
    <View className="flex flex-grow w-full px-5 justify-center mx-auto space-y-3">
      {isLoading && <Text className="dark:text-white">Loading...</Text>}
      {rides !== undefined && (
        <View className="flex flex-col space-y-3">
          {rides.map((ride) => (
            <View key={ride.id} className="flex flex-col space-y-3">
              <Text className="dark:text-white">Ride ID: {ride.id}</Text>
              <Text className="dark:text-white">Ride Status: {ride.status}</Text>
              <Text className="dark:text-white">Ride Driver ID: {ride.driver_id}</Text>
              <Text className="dark:text-white">Ride Passenger ID: {ride.passenger_id}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default RequestedRidesScreen
