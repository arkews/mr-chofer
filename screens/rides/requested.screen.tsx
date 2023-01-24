import { FC } from 'react'
import { ScrollView, Text, View } from 'react-native'
import useRequestedRides from '@base/rides/hooks/use-requested-rides'
import RequestedRideCard from '@base/rides/components/requested'

const RequestedRidesScreen: FC = () => {
  const { rides, isLoading } = useRequestedRides()

  return (
    <View className="flex flex-grow w-full px-5 justify-center mx-auto space-y-3">
      <View className="flex flex-col w-full mt-16">
        <Text className="text-2xl font-bold text-center dark:text-white">
          Solicitudes de viaje
        </Text>
      </View>

      {isLoading && <Text className="dark:text-white">Loading...</Text>}
      {rides !== undefined && (
        <ScrollView className="w-full">
          <View className="flex flex-col space-y-3">
            {rides.map((ride) => (
              <RequestedRideCard key={ride.id} ride={ride} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default RequestedRidesScreen
