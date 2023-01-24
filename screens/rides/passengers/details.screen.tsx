import { FC, useEffect } from 'react'
import { Text, View } from 'react-native'
import useCurrentPassengerRide
  from '@base/rides/hooks/use-current-passenger-ride'
import { RootStackScreenProps } from '@navigation/types'

type Props = RootStackScreenProps<'PassengerRideDetails'>

const PassengerRideDetailsScreen: FC<Props> = ({ navigation }) => {
  const { ride, isLoading } = useCurrentPassengerRide()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride === undefined) {
      navigation.replace('RegisterRideRequest')
    }
  }, [ride, isLoading])

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {isLoading && <Text className="dark:text-white">Cargando recorrido...</Text>}
      {ride !== undefined && (
        <View className="flex flex-col space-y-5">
          <View className="mb-5">
            <Text className="text-xl text-center dark:text-white">
              Información de tu recorrido
            </Text>
          </View>

          <View className="flex flex-row justify-between">
            <View
              className="bg-blue-100 mr-2 px-2.5 py-0.5 rounded border border-blue-400 dark:bg-gray-700 w-min">
              <Text
                className="text-blue-800 text-xs font-medium dark:text-blue-400">
                {ride.status === 'requested' && 'Solicitado'}
                {ride.status === 'accepted' && 'Aceptado'}
                {ride.status === 'in_progress' && 'En progreso'}
                {ride.status === 'completed' && 'Finalizado'}
                {ride.status === 'canceled' && 'Cancelado'}
              </Text>
            </View>
          </View>

          <View className="flex flex-col space-y-3">
            <View className="flex flex-row justify-between px-2 py-2">
              <Text className="text-gray-700 dark:text-gray-400">
                Origen
              </Text>
              <Text
                className="dark:text-white font-bold">
                {ride.pickup_location}
              </Text>
            </View>

            <View className="flex flex-row justify-between px-2 py-2">
              <Text className="text-gray-700 dark:text-gray-400">
                Destino
              </Text>
              <Text
                className="dark:text-white font-bold">
                {ride.destination}
              </Text>
            </View>

            <View className="flex flex-row justify-between px-2 py-2">
              <Text className="text-gray-700 dark:text-gray-400">
                Precio ofrecido
              </Text>
              <Text
                className="font-medium text-green-700 dark:text-green-400">
                {Intl.NumberFormat('es', {
                  style: 'currency',
                  currency: 'COP'
                }).format(ride.offered_price)}
              </Text>
            </View>

            {
              (ride.drivers !== undefined && ride.drivers !== null) && (
                <View className="flex flex-row justify-between px-2 py-2">
                  <Text className="text-gray-700 dark:text-gray-400">
                    Conductor
                  </Text>
                  <Text className="dark:text-white font-bold">
                    {ride.drivers.name}
                  </Text>
                </View>
              )
            }
          </View>
        </View>
      )}
    </View>
  )
}

export default PassengerRideDetailsScreen
