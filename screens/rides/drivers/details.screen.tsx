import { FC, useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import { RootStackScreenProps } from '@navigation/types'
import useCurrentDriverRide from '@base/rides/hooks/use-current-driver-ride'
import { genders } from '@constants/genders'
import { RideStatus } from '@base/rides/types'
import cn from 'classnames'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'
import { MaterialIcons } from '@expo/vector-icons'
import { styled } from 'nativewind'
import useRealtimeCurrentDriverRide
  from '@base/rides/hooks/realtime/use-realtime-current-driver-ride'

const StyledIcon = styled(MaterialIcons)

type Props = RootStackScreenProps<'DriverRideDetails'>

const DriverRideDetailsScreen: FC<Props> = ({ navigation }) => {
  const { ride, isLoading } = useCurrentDriverRide()

  useRealtimeCurrentDriverRide()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride === undefined) {
      navigation.replace('RequestedRides')
    }
  }, [ride, isLoading])

  useEffect(() => navigation.addListener('beforeRemove', (e) => {
    if (ride === undefined) {
      return
    }

    e.preventDefault()
  }), [navigation, ride])

  const updateRideStatus = async (newStatus: RideStatus) => {
    const newValues = {
      status: newStatus,
      ...(newStatus === RideStatus.in_progress && {
        start_time: new Date().toISOString()
      }),
      ...(newStatus === RideStatus.completed && {
        end_time: new Date().toISOString()
      })
    }

    const { error } = await supabase.from('rides')
      .update(newValues)
      .eq('id', ride?.id)

    if (error !== null) {
      throw Error(error.message)
    }
  }

  const performStartRide = async () => {
    await updateRideStatus(RideStatus.in_progress)
  }

  const {
    mutate: startRide,
    isLoading: startingRide
  } = useMutation(performStartRide)

  const performFinishRide = async () => {
    await updateRideStatus(RideStatus.completed)
  }

  const {
    mutate: finishRide,
    isLoading: isEndingRide
  } = useMutation(performFinishRide)

  const performCancelRide = async () => {
    await updateRideStatus(RideStatus.canceled)
  }

  const {
    mutate: cancelRide,
    isLoading: isCancelingRide
  } = useMutation(performCancelRide)

  const disableButtons = isLoading || startingRide || isEndingRide || isCancelingRide

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">
      {isLoading &&
        <Text className="dark:text-white">Cargando recorrido...</Text>}
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
              (ride.passengers !== undefined && ride.passengers !== null) && (
                <View className="pt-2">
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

          <View className="flex flex-row space-x-5 justify-around">
            {
              ride.status === RideStatus.accepted && (
                <View className="flex-1">
                  <Pressable
                    onPress={() => {
                      startRide()
                    }}
                    disabled={disableButtons}
                    className={
                      cn('text-base px-4 py-3.5 bg-blue-700 rounded-lg border border-transparent',
                        'active:bg-blue-800',
                        (disableButtons) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                        (disableButtons) && 'dark:bg-gray-800 dark:text-gray-400')
                    }
                  >
                    <Text
                      className="text-white text-center text-white">
                      Iniciar recorrido
                    </Text>
                  </Pressable>
                </View>
              )
            }

            {
              ride.status === RideStatus.in_progress && (
                <View className="flex-1">
                  <Pressable
                    onPress={() => {
                      finishRide()
                    }}
                    disabled={disableButtons}
                    className={
                      cn('text-base px-4 py-3.5 bg-green-700 rounded-lg border border-transparent',
                        'active:bg-blue-800',
                        (disableButtons) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                        (disableButtons) && 'dark:bg-gray-800 dark:text-gray-400')
                    }
                  >
                    <Text
                      className="text-white text-center text-white">
                      Finalizar
                    </Text>
                  </Pressable>
                </View>
              )
            }

            <View className="flex-1">
              <Pressable
                onPress={() => {
                  cancelRide()
                }}
                disabled={disableButtons}
                className={
                  cn('text-base px-4 py-3.5 border border-red-700 rounded-lg dark:border-red-500 active:border-red-900 dark:active:border-red-700',
                    (disableButtons) && 'border-gray-300 cursor-not-allowed dark:border-gray-800'
                  )
                }
              >
                <Text
                  className={
                    cn('text-center text-red-700 dark:text-red-500',
                      (disableButtons) && 'text-gray-700 dark:text-gray-400')
                  }>
                  Cancelar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default DriverRideDetailsScreen
