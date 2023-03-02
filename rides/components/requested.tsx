import { paymentOptions } from '@base/constants/payment-options'
import OfferForm from '@base/rides/components/offer.form'
import { Ride } from '@base/rides/types'
import { useConfig } from '@base/shared/configuration'
import { getAvatarUrl } from '@base/supabase/storage'
import { genders } from '@constants/genders'
import { MaterialIcons } from '@expo/vector-icons'
import { styled } from 'nativewind'
import { FC, useEffect, useReducer, useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native'
import ConfirmMalePassengerModal from './confirm-male-passenger.modal'

const StyledIcon = styled(MaterialIcons)

enum RequestedRideCardActionKind {
  Idle = 'idle',
  Accept = 'accept',
  MakeOffer = 'make_offer',

  OpenMakeOfferModal = 'open_make_offer_modal',
  OpenMaleModal = 'open_male_modal',
}

type RequestedRideCardActionPayload = {
  [RequestedRideCardActionKind.Idle]: undefined
  [RequestedRideCardActionKind.Accept]: undefined
  [RequestedRideCardActionKind.MakeOffer]: {
    offer: number
  }
  [RequestedRideCardActionKind.OpenMakeOfferModal]: undefined
  [RequestedRideCardActionKind.OpenMaleModal]: undefined
}

type RequestedRideCardAction = {
  kind: RequestedRideCardActionKind
  payload: RequestedRideCardActionPayload[RequestedRideCardActionKind]
}

type RequestedRideCardState = {
  finalPrice: number
  isAccepting: boolean
  makeOffer: boolean

  openMaleModal: boolean

  onAccept: (rideId: number, price?: number) => void
}

const initialState: RequestedRideCardState = {
  finalPrice: 0,
  isAccepting: false,
  makeOffer: false,

  openMaleModal: false,

  onAccept: () => {}
}

type Props = {
  ride: Ride

  onAccept: (rideId: number, price?: number) => void
}

const RequestedRideCard: FC<Props> = ({ ride, onAccept }) => {
  const { config } = useConfig('IS_MALE_PASSENGER_ACTIVE')

  const [state, dispatch] = useReducer(
    (state: RequestedRideCardState, action: RequestedRideCardAction) => {
      switch (action.kind) {
        case RequestedRideCardActionKind.Idle:
          return {
            ...state,
            isAccepting: false,
            makeOffer: false,
            openMaleModal: false
          }
        case RequestedRideCardActionKind.Accept: {
          onAccept(ride.id, state.finalPrice)

          return {
            ...state,
            isAccepting: true,
            makeOffer: false,
            openMaleModal: false
          }
        }
        case RequestedRideCardActionKind.MakeOffer:
          return {
            ...state,
            isAccepting: false,
            makeOffer: false,
            openMaleModal: false,
            finalPrice: action.payload?.offer ?? state.finalPrice
          }
        case RequestedRideCardActionKind.OpenMakeOfferModal:
          return {
            ...state,
            isAccepting: false,
            makeOffer: true,
            openMaleModal: false
          }
        case RequestedRideCardActionKind.OpenMaleModal:
          return {
            ...state,
            isAccepting: false,
            makeOffer: false,
            openMaleModal: true
          }
        default:
          return state
      }
    },
    {
      ...initialState,
      finalPrice: ride.offered_price,
      onAccept
    }
  )

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (
      ride.passengers?.photo_url !== undefined &&
      ride.passengers?.photo_url !== null
    ) {
      getAvatarUrl(ride.passengers.photo_url).then((url) => {
        setAvatarUrl(url)
      })
    }
  }, [ride])

  const handleAccept = () => {
    if (config === undefined || config === null) {
      return
    }

    const isEnableMalePassenger =
      config.value === 'true' && ride.gender === 'Male'
    if (isEnableMalePassenger) {
      dispatch({
        kind: RequestedRideCardActionKind.OpenMaleModal,
        payload: undefined
      })
      return
    }

    dispatch({
      kind: RequestedRideCardActionKind.Accept,
      payload: undefined
    })
  }

  // set isAccepting to false when 5 seconds has passed
  useEffect(() => {
    if (state.isAccepting) {
      const timer = setTimeout(() => {
        dispatch({
          kind: RequestedRideCardActionKind.Idle,
          payload: undefined
        })
      }, 10000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [state.isAccepting])

  const paymentOption = paymentOptions.find(
    (option) => option.value === ride.payment_method
  )

  return (
    <>
      <View className="px-1 py-2 pb-1 mt-2 w-full bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800">
        <View>
          <ConfirmMalePassengerModal
            open={state.openMaleModal}
            onClose={() => {
              dispatch({
                kind: RequestedRideCardActionKind.Accept,
                payload: undefined
              })
            }}
          />
        </View>
        <View>
          <View className="flex flex-row">
            <View className="items-center justify-center w-1/5 mr-1">
              <View>
                {avatarUrl !== null
                  ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-14 h-14 rounded-full mx-auto"
                  />
                    )
                  : (
                  <View className="w-14 h-14 rounded-full mx-auto bg-gray-200" />
                    )}
              </View>
            </View>

            <View className="w-4/5">
              <View className="flex flex-col">
                <View className="flex flex-row justify-between">
                  {ride.passengers !== undefined && (
                    <Text className="text-xs font-medium leading-none text-gray-500 dark:text-gray-400">
                      {ride.passengers?.name}
                    </Text>
                  )}

                  {ride.affiliate_id !== null && (
                    <StyledIcon
                      name="star"
                      size={17}
                      className="text-yellow-400 dark:text-yellow-300 mr-3"
                    />
                  )}
                </View>

                <View className="flex flex-col justify-between">
                  <Text className="text-base text-pink-800 font-medium dark:text-pink-300">
                    Origen: {ride.pickup_location}
                  </Text>

                  <View className="flex flex-row align-middle items-center">
                    <Text className="text-base text-gray-900 dark:text-gray-100 font-medium">
                      Destino: {ride.destination}{' '}
                    </Text>
                    {ride.affiliate_id !== null && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        (Aliado)
                      </Text>
                    )}
                  </View>

                  <Text className="text-gray-600 dark:text-gray-400 mt-1">
                    Genero:{' '}
                    {genders.find((g) => g.value === ride.gender)?.title}
                  </Text>
                </View>

                <View className="mt-0.5">
                  <View className="flex flex-row space-x-3 items-center">
                    <Text className="text-base font-medium text-green-700 dark:text-green-400">
                      {Intl.NumberFormat('es', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(ride.offered_price)}
                    </Text>

                    <View className="flex flex-row items-center space-x-1">
                      {paymentOption?.icon !== undefined
                        ? (
                            paymentOption.icon
                          )
                        : (
                        <StyledIcon
                          name="attach-money"
                          size={17}
                          color="#9CA3AF"
                        />
                          )}
                      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {paymentOption?.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {ride.comments !== undefined && ride.comments !== null && (
            <View className="flex flex-row px-2 space-x-2 mt-1">
              <StyledIcon
                name="comment"
                className="text-sm text-gray-700 dark:text-gray-400"
              />
              <Text className="text-gray-700 dark:text-gray-400">
                {ride.comments?.replace(/(\r\n|\n|\r)/gm, '')}
              </Text>
            </View>
          )}

          <View className="mt-1.5">
            {state.isAccepting
              ? (
              <View className="mt-3">
                <Text className="text-xs text-center text-green-700 dark:text-green-400">
                  Solicitud enviada
                </Text>
              </View>
                )
              : (
              <View className="flex flex-row justify-around space-x-2">
                <View className="basis-1/2">
                  <Pressable
                    onPress={() => {
                      dispatch({
                        kind: RequestedRideCardActionKind.MakeOffer,
                        payload: {
                          offer: ride.offered_price
                        }
                      })

                      handleAccept()
                    }}
                    className="px-3 py-2 text-center text-white bg-green-700 rounded-md border border-transparent active:bg-green-800"
                  >
                    <Text className="text-xs text-white text-center font-medium">
                      Enviar solicitud
                    </Text>
                  </Pressable>
                </View>

                <View className="basis-1/2">
                  <Pressable
                    onPress={() => {
                      dispatch({
                        kind: RequestedRideCardActionKind.OpenMakeOfferModal,
                        payload: undefined
                      })
                    }}
                    className="px-3 py-2 text-center border border-sky-700 rounded-md active:border-sky-800 dark:border-sky-300 dark:active:border-sky-200"
                  >
                    <Text className="text-xs text-sky-700 text-center font-medium dark:text-sky-300">
                      Hacer oferta
                    </Text>
                  </Pressable>
                </View>
              </View>
                )}
          </View>
        </View>
      </View>

      <Modal animationType="slide" transparent visible={state.makeOffer}>
        <View className="absolute bottom-0 w-full">
          <OfferForm
            onClose={(offer?: number) => {
              dispatch({
                kind: RequestedRideCardActionKind.MakeOffer,
                payload: {
                  offer: offer ?? state.finalPrice
                }
              })
              handleAccept()
            }}
          />
        </View>
      </Modal>
    </>
  )
}

export default RequestedRideCard
