import { FC, useEffect } from 'react'
import { Text, View } from 'react-native'
import { RootStackScreenProps } from '@navigation/types'
import useCurrentDriverRide from '@base/rides/hooks/use-current-driver-ride'
import { genders } from '@constants/genders'

type Props = RootStackScreenProps<'DriverRideDetails'>

const DriverRideDetailsScreen: FC<Props> = ({ navigation }) => {
  const { ride, isLoading } = useCurrentDriverRide()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride === undefined) {
      navigation.navigate('RequestedRides')
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
              Información del recorrido
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
              (ride.passengers !== undefined && ride.passengers !== null) && (
                <View>
                  <View>
                    <Text className="text-center font-bold dark:text-white mb-3">
                      Información del pasajero
                    </Text>
                  </View>
                  <View className="flex flex-row justify-between px-2 py-2">
                    <Text className="text-gray-700 dark:text-gray-400">
                      Nombre
                    </Text>
                    <Text className="dark:text-white font-bold">
                      {ride.passengers.name}
                    </Text>
                  </View>

                  <View className="flex flex-row justify-between px-2 py-2">
                    <Text className="text-gray-700 dark:text-gray-400">
                      Genero
                    </Text>
                    <Text className="dark:text-white font-bold">
                      {genders.find((g) => g.value === ride.passengers?.gender)?.title}
                    </Text>
                  </View>

                  <View className="flex flex-row justify-between px-2 py-2">
                    <Text className="text-gray-700 dark:text-gray-400">
                      Número de contacto
                    </Text>
                    <Text className="dark:text-white font-bold">
                      {ride.passengers.phone}
                    </Text>
                  </View>
                </View>
              )
            }
          </View>
        </View>
      )}
    </View>
  )
}

export default DriverRideDetailsScreen
