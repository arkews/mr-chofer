import { FC, useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import useCurrentPassengerRide
  from '@base/rides/hooks/use-current-passenger-ride'
import { RootStackScreenProps } from '@navigation/types'
import { RideStatus } from '@base/rides/types'
import cn from 'classnames'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'
import { styled } from 'nativewind'
import { MaterialIcons } from '@expo/vector-icons'
import useRealtimeCurrentPassengerRide
  from '@base/rides/hooks/realtime/use-realtime-current-passenger-ride'
import useRealtimePassengerRideBroadcast
  from '@base/rides/hooks/realtime/use-realtime-passenger-ride-broadcast'

const StyledIcon = styled(MaterialIcons)

type Props = RootStackScreenProps<'PassengerRideDetails'>

const PassengerRideDetailsScreen: FC<Props> = ({ navigation }) => {
  const { ride, isLoading } = useCurrentPassengerRide()

  useRealtimeCurrentPassengerRide()
  useRealtimePassengerRideBroadcast()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride === undefined) {
      navigation.replace('PassengerDetails')
    }
  }, [ride, isLoading])

  useEffect(() => navigation.addListener('beforeRemove', (e) => {
    if (ride === undefined) {
      return
    }

    e.preventDefault()
  }), [navigation, ride])

  const performCancelRide = async () => {
    const { error } = await supabase.from('rides')
      .update({
        status: RideStatus.canceled
      })
      .eq('id', ride?.id)

    if (error !== null) {
      throw Error(error.message)
    }
  }

  const {
    mutate: cancelRide,
    isLoading: isCancelingRide
  } = useMutation(performCancelRide)

  const disableButtons = isLoading || isCancelingRide
  const canCancelRide = [RideStatus.requested, RideStatus.accepted]
    .includes(ride?.status ?? RideStatus.requested)

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '',
      headerRight: () => (
        <View>
          {
            (canCancelRide) && (
              <Pressable
                onPress={() => {
                  cancelRide()
                }}
                disabled={disableButtons}
                className={
                  cn('text-base px-3 py-2 border border-red-700 rounded-lg dark:border-red-500 active:border-red-900 dark:active:border-red-700',
                    (disableButtons) && 'border-gray-300 cursor-not-allowed dark:border-gray-800'
                  )
                }>
                <Text
                  className={
                    cn('text-xs font-bold text-center text-red-700 dark:text-red-500',
                      (disableButtons) && 'text-gray-700 dark:text-gray-400')
                  }>
                  Cancelar
                </Text>
              </Pressable>
            )
          }
        </View>
      )
    })
  }, [navigation, disableButtons])

  return (
    <View className="mt-7">
      <View
        className="flex w-full px-5 justify-center mx-auto space-y-5">
        {isLoading &&
          <Text className="dark:text-white">Cargando recorrido...</Text>}
        {ride !== undefined && (
          <View className="flex flex-col space-y-5">
            <View className="mb-3">
              <Text className="text-xl font-bold text-center dark:text-white">
                Tu recorrido
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
                (ride.comments !== undefined && ride.comments !== null && ride.comments.length > 0) &&
                (
                  <View className="flex flex-row px-2 space-x-2">
                    <StyledIcon name="comment" size={24}
                                className="text-gray-700 dark:text-gray-400"/>
                    <Text className="text-gray-700 dark:text-gray-400">
                      {ride.comments}
                    </Text>
                  </View>
                )
              }

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
    </View>
  )
}

export default PassengerRideDetailsScreen
