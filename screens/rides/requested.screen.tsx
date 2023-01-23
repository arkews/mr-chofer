import { FC } from 'react'
import { Text, View } from 'react-native'
import useRequestedRides from '@base/rides/hooks/use-requested-rides'
import RequestedRideCard from '@base/rides/components/requested'

const RequestedRidesScreen: FC = () => {
  const { rides, isLoading } = useRequestedRides()

  return (
    <View className="flex flex-grow w-full px-5 justify-center mx-auto space-y-3">
      {isLoading && <Text className="dark:text-white">Loading...</Text>}
      {rides !== undefined && (
        <View className="flex flex-col space-y-3">
          {rides.map((ride) => (
            <RequestedRideCard key={ride.id} ride={ride} />
          ))}
        </View>
      )}
    </View>
  )
}

export default RequestedRidesScreen
