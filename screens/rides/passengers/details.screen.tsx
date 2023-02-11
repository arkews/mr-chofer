import { FC, useEffect, useState } from 'react'
import { Linking, Pressable, Text, View } from 'react-native'
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
import FloatingObject from '@components/animations/floating-object'
import SkeletonView from '@components/animations/skeleton-view'
import DriverArriveNotificationModal
  from '@base/rides/components/driver-arrive-notification.modal'
import ConfirmModal from '@components/confirm.modal'
import PassengerNewFare from '@base/rides/components/passenger-new-fare'
import * as Sentry from 'sentry-expo'

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
      Sentry.Native.captureException(error, {
        contexts: {
          ride
        }
      })
      throw Error(error.message)
    }
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

  const performPhoneCall = async () => {
    if (ride?.drivers === undefined) {
      return
    }

    await Linking.openURL(`tel:${ride.drivers.phone}`)
  }

  const performStartRide = async () => {
    const { error } = await supabase.from('rides')
      .update({
        status: RideStatus.in_progress,
        start_time: new Date().toISOString()
      })
      .eq('id', ride?.id)

    if (error !== null) {
      Sentry.Native.captureException(error, {
        contexts: {
          ride
        }
      })
      throw Error(error.message)
    }
  }

  const {
    mutate: startRideMutation,
    isLoading: isStartingRide
  } = useMutation(performStartRide)

  const [isDriverArriveNotificationModalOpen, setIsDriverArriveNotificationModalOpen] = useState(false)
  const openDriverArriveNotificationModal = () => {
    setIsDriverArriveNotificationModalOpen(true)
  }

  const closeDriverArriveNotificationModal = () => {
    startRideMutation()
    setIsDriverArriveNotificationModalOpen(false)
  }

  useEffect(() => {
    if (ride === undefined) {
      return
    }

    if (ride.status === RideStatus.waiting) {
      openDriverArriveNotificationModal()
    }
  }, [ride])

  const disableButtons = isLoading || isCancelingRide || isStartingRide
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
                onPress={openCancelRideModal}
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
    <View className="mt-7 min-h-screen">
      <View>
        <DriverArriveNotificationModal
          open={isDriverArriveNotificationModalOpen}
          onClose={closeDriverArriveNotificationModal}/>
      </View>

      {
        ride?.status === RideStatus.requested && (
          <PassengerNewFare/>
        )
      }

      <View>
        <ConfirmModal
          open={isCancelRideModalOpen}
          title="¿Estas seguro de cancelar tu recorrido?"
          onClosed={closeCancelRideModal}/>
      </View>
      <View
        className="flex w-full px-5 justify-center mx-auto space-y-5">
        {isLoading && ride === undefined &&
          <SkeletonView amount={3}/>
        }
        {ride !== undefined && (
          <View className="flex flex-col space-y-5">
            <View className="mb-3">
              <Text className="text-xl font-bold text-center dark:text-white">
                {ride.status === 'requested' && 'Su solicitud ha sido enviada a los conductores disponibles'}
                {ride.status === 'accepted' && 'Su solicitud ha sido aceptada, el conductor se encuentra en camino'}
                {ride.status === 'waiting' && 'Su conductor ha llegado!'}
                {ride.status === 'in_progress' && 'Su recorrido ha comenzado'}
                {ride.status === 'completed' && 'Su recorrido ha finalizado'}
                {ride.status === 'canceled' && 'Su recorrido ha sido cancelado'}
              </Text>
            </View>

            {
              (ride.status === 'requested') && (
                <View className="mb-10">
                  <FloatingObject>
                    <StyledIcon name="search" size={70}
                                className="text-gray-700 dark:text-gray-400"/>
                  </FloatingObject>
                </View>
              )
            }

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
                                className="text-gray-700 dark:text-gray-400"/>
                    <Text className="text-gray-700 dark:text-gray-400">
                      {ride.comments}
                    </Text>
                  </View>
                )
              }

              {
                (ride.drivers !== undefined && ride.drivers !== null) && (
                  <View>
                    <View className="flex flex-row justify-between px-2 py-2">
                      <Text className="text-gray-700 dark:text-gray-400">
                        Conductor
                      </Text>
                      <Text className="dark:text-white font-bold">
                        {ride.drivers.name}
                      </Text>
                    </View>

                    {
                      ride.drivers.vehicles !== undefined && (
                        <View>
                          <View className="flex flex-row justify-between px-2 py-2">
                            <Text className="text-gray-700 dark:text-gray-400">
                              Vehículo
                            </Text>
                            <Text className="dark:text-white font-bold">
                              {ride.drivers.vehicles.license_plate}, {ride.drivers.vehicles.brand}{' '}
                              {ride.drivers.vehicles.line} {ride.drivers.vehicles.model} {ride.drivers.vehicles.color}
                            </Text>
                          </View>
                        </View>
                      )
                    }

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
          </View>
        )}
      </View>
    </View>
  )
}

export default PassengerRideDetailsScreen
