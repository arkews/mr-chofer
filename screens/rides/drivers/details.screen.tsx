import { FC, useEffect, useState } from 'react'
import { Linking, Pressable, Text, View } from 'react-native'
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
import ConfirmModal from '@components/confirm.modal'

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
      navigation.replace('DriverNavigation')
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
    await updateRideStatus(RideStatus.waiting)
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

  const [isFinishRideModalOpen, setIsFinishRideModalOpen] = useState(false)
  const openFinishRideModal = () => {
    setIsFinishRideModalOpen(true)
  }
  const closeFinishRideModal = (confirmed: boolean) => {
    if (confirmed) {
      finishRide()
    }

    setIsFinishRideModalOpen(false)
  }

  const performCancelRide = async () => {
    await updateRideStatus(RideStatus.canceled)
  }

  const {
    mutate: cancelRide,
    isLoading: isCancelingRide
  } = useMutation(performCancelRide)

  const [isCancelRideModalOpen, setIsCancelRideModalOpen] = useState(false)
  const openCancelRideModal = () => {
    setIsCancelRideModalOpen(true)
  }

  const closeCancelRideModal = (confirmed: boolean) => {
    if (confirmed) {
      cancelRide()
    }

    setIsCancelRideModalOpen(false)
  }

  const disableButtons = isLoading || startingRide || isEndingRide || isCancelingRide

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '',
      headerRight: () => (
        <View>
          <Pressable
            onPress={openCancelRideModal}
            disabled={disableButtons}
            className={
              cn('text-base px-3 py-2 border border-red-700 rounded-lg dark:border-red-500 active:border-red-900 dark:active:border-red-700',
                (disableButtons) && 'border-gray-300 cursor-not-allowed dark:border-gray-800'
              )
            }
          >
            <Text
              className={
                cn('text-xs font-bold text-center text-red-700 dark:text-red-500',
                  (disableButtons) && 'text-gray-700 dark:text-gray-400')
              }>
              Cancelar
            </Text>
          </Pressable>
        </View>
      ),
      headerLeft: () => (<View></View>)
    })
  }, [navigation, disableButtons])

  const performPhoneCall = async () => {
    if (ride?.passengers === undefined) {
      return
    }

    await Linking.openURL(`tel:${ride.passengers.phone}`)
  }

  return (
    <View
      className="flex flex-grow w-full px-5 justify-center mx-auto space-y-5">

      <View>
        <ConfirmModal
          open={isFinishRideModalOpen}
          title="¿Estas seguro de finalizar el recorrido?"
          onClosed={closeFinishRideModal}/>
      </View>

      <View>
        <ConfirmModal
          open={isCancelRideModalOpen}
          title="¿Estas seguro de cancelar el recorrido?"
          onClosed={closeCancelRideModal}/>
      </View>

      {isLoading &&
        <Text className="dark:text-white">Cargando recorrido...</Text>}
      {ride !== undefined && (
        <View className="flex flex-col space-y-5">
          <View className="mb-5">
            <Text
              className="text-2xl text-center font-bold text-gray-900 dark:text-gray-200">
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
                {ride.status === 'waiting' && 'Esperando'}
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
                Precio final
              </Text>
              <Text
                className="font-bold text-green-700 dark:text-green-400">
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
                              className="text-gray-600 dark:text-gray-400"/>
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
                      {genders.find((g) => g.value === ride?.gender)?.title}
                    </Text>
                  </View>

                  <View className="pt-5">
                    <View className="flex flex-row justify-end space-x-5">
                      <Pressable
                        onPress={async () => {
                          await performPhoneCall()
                        }}
                        className="border rounded-full p-2 border-gray-700 dark:border-gray-400 active:border-gray-800 dark:active:border-gray-300">
                        <StyledIcon
                          name="call"
                          size={30}
                          className="text-gray-700 dark:text-gray-400"/>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )
            }
          </View>

          <View className="flex flex-row justify-around pt-3">
            {
              ride.status === RideStatus.accepted && (
                <View className="flex-1">
                  <Pressable
                    onPress={() => {
                      startRide()
                    }}
                    disabled={disableButtons}
                    className={
                      cn('text-base px-5 py-3 bg-blue-700 rounded-lg border border-transparent',
                        'active:bg-blue-800',
                        (disableButtons) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                        (disableButtons) && 'dark:bg-gray-800 dark:text-gray-400')
                    }
                  >
                    <Text
                      className="text-base text-center text-white font-medium">
                      ¡Ya llegue!
                    </Text>
                  </Pressable>
                </View>
              )
            }

            {
              ride.status === RideStatus.in_progress && (
                <View className="flex-1">
                  <Pressable
                    onPress={openFinishRideModal}
                    disabled={disableButtons}
                    className={
                      cn('text-base px-5 py-3 bg-green-700 rounded-lg border border-transparent',
                        'active:bg-green-800',
                        (disableButtons) && 'bg-gray-300 text-gray-700 cursor-not-allowed',
                        (disableButtons) && 'dark:bg-gray-800 dark:text-gray-400')
                    }
                  >
                    <Text
                      className="text-base text-center text-white font-medium">
                      Finalizar
                    </Text>
                  </Pressable>
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
