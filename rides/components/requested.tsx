import { FC, useEffect, useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native'
import { Ride } from '@base/rides/types'
import { genders } from '@constants/genders'
import { getAvatarUrl } from '@base/supabase/storage'
import { styled } from 'nativewind'
import { MaterialIcons } from '@expo/vector-icons'
import OfferForm from '@base/rides/components/offer.form'

const StyledIcon = styled(MaterialIcons)

type Props = {
  ride: Ride

  onAccept: (rideId: number, price?: number) => void
}

const RequestedRideCard: FC<Props> = ({ ride, onAccept }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [makeOffer, setMakeOffer] = useState(false)

  useEffect(() => {
    if (ride.passengers?.photo_url !== undefined && ride.passengers?.photo_url !== null) {
      getAvatarUrl(ride.passengers.photo_url)
        .then(url => {
          setAvatarUrl(url)
        })
    }
  }, [ride])

  const handleAccept = (): void => {
    setIsAccepting(true)
    onAccept(ride.id)

    // After 5s set is accepting false
    setTimeout(() => {
      setIsAccepting(false)
    }, 5000)
  }

  const handleOpenMakeOffer = (): void => {
    setMakeOffer(true)
  }

  const handleCloseMakeOffer = (offer?: number): void => {
    setMakeOffer(false)
    const price = offer ?? Number.NaN

    if (isNaN(price)) {
      onAccept(ride.id)
    }

    onAccept(ride.id, price)

    setIsAccepting(true)
    setTimeout(() => {
      setIsAccepting(false)
    }, 5000)
  }

  return (
    <>
      <View
        className="px-1 py-2 pb-1 mt-2 w-full bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800">
        <View>
          <View className="flex flex-row">
            <View className="items-center justify-center w-1/5 mr-1">
              <View>
                {
                  avatarUrl !== null
                    ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-14 h-14 rounded-full mx-auto"
                      />
                      )
                    : (
                      <View
                        className="w-14 h-14 rounded-full mx-auto bg-gray-200"/>
                      )
                }
              </View>
            </View>

            <View className="w-4/5">
              <View className="flex flex-col">
                {
                  ride.passengers !== undefined && (
                    <Text
                      className="text-xs font-medium leading-none text-gray-500 dark:text-gray-400">
                      {ride.passengers?.name}
                    </Text>
                  )
                }

                <View className="flex flex-col justify-between my-1">
                  <Text
                    className="text-base dark:text-white text-pink-800 font-medium dark:text-pink-300">
                    Origen: {ride.pickup_location}
                  </Text>

                  <Text
                    className="text-base text-gray-900 dark:text-gray-100 font-medium">
                    Destino: {ride.destination}
                  </Text>

                  <Text className="text-gray-600 dark:text-gray-400 mt-1">
                    Genero: {genders.find((g) => g.value === ride.gender)?.title}
                  </Text>
                </View>

                <View className="mt-1">
                  <Text
                    className="text-md font-medium text-green-700 dark:text-green-400">
                    {Intl.NumberFormat('es', {
                      style: 'currency',
                      currency: 'COP'
                    }).format(ride.offered_price)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {
            ride.comments !== undefined && ride.comments !== null && (
              <View className="flex flex-row px-2 space-x-2">
                <StyledIcon name="comment"
                            className="text-sm text-gray-700 dark:text-gray-400"/>
                <Text className="text-gray-700 dark:text-gray-400">
                  {ride.comments?.replace(/(\r\n|\n|\r)/gm, '')}
                </Text>
              </View>
            )
          }

          <View className="mt-1.5">
            {
              isAccepting
                ? (
                  <View className="mt-3">
                    <Text
                      className="text-xs text-center text-green-700 dark:text-green-400">
                      Solicitud enviada
                    </Text>
                  </View>
                  )
                : (
                  <View className="flex flex-row justify-around space-x-2">
                    <View className="basis-1/2">
                      <Pressable
                        onPress={handleAccept}
                        className="px-3 py-2 text-center text-white bg-green-700 rounded-md border border-transparent active:bg-green-800">
                        <Text
                          className="text-xs text-white text-center font-medium">
                          Enviar solicitud
                        </Text>
                      </Pressable>
                    </View>

                    <View className="basis-1/2">
                      <Pressable
                        onPress={handleOpenMakeOffer}
                        className="px-3 py-2 text-center border border-sky-700 rounded-md active:border-sky-800 dark:border-sky-300 dark:active:border-sky-200">
                        <Text
                          className="text-xs text-sky-700 text-center font-medium dark:text-sky-300">
                          Hacer oferta
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  )
            }
          </View>
        </View>
      </View>

      <Modal animationType="slide" transparent visible={makeOffer}>
        <View className="absolute bottom-0 w-full">
          <OfferForm onClose={handleCloseMakeOffer}/>
        </View>
      </Modal>
    </>
  )
}

export default RequestedRideCard
