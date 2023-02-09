import { FC, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import useCurrentPassengerRide
  from '@base/rides/hooks/use-current-passenger-ride'
import cn from 'classnames'
import { supabase } from '@base/supabase'
import { useMutation } from '@tanstack/react-query'
import Sentry from '@sentry/react-native'

const PassengerNewFare: FC = () => {
  const { ride, isLoading } = useCurrentPassengerRide()
  const [fareIncrementDecrement] = useState(500)
  const [fare, setFare] = useState(ride?.offered_price ?? 0)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (ride === undefined) {
      return
    }

    if (fare !== 0) {
      return
    }

    setFare(ride.offered_price)
  }, [fare, ride, isLoading])

  const offeredPrice = ride?.offered_price ?? 0
  const decrementFare = (): void => {
    if (fare <= offeredPrice) {
      return
    }

    if (fare === 0) {
      return
    }

    if (fare < fareIncrementDecrement) {
      setFare(0)
      return
    }

    setFare(prevState => prevState - fareIncrementDecrement)
  }

  const incrementFare = (): void => {
    setFare(prevState => prevState + fareIncrementDecrement)
  }

  const performNewOffer = async () => {
    const { error } = await supabase.from('rides').update({
      offered_price: fare
    }).eq('id', ride?.id)

    if (error !== null) {
      Sentry.captureException(error, {
        contexts: {
          ride
        }
      })
      throw Error(error.message)
    }
  }

  const { mutate, isLoading: isMakingNewOffer } = useMutation(performNewOffer)

  const makeNewOffer = (): void => {
    mutate()
  }

  const isDisabled = isLoading || isMakingNewOffer
  const isDisableDecrement = isDisabled || fare === 0 || fare <= offeredPrice
  const isDisableRaiseOffer = isDisabled || fare === offeredPrice

  return (
    <View className="absolute bottom-20 w-full">
      <View>
        <View className="flex items-center justify-center px-3 pb-2">
          <View
            className="w-full p-4 px-1 pb-1 bg-white rounded-lg border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700">
            <View className="flex flex-col space-y-2">
              <View className="justify-center">
                <Text
                  className="text-xs text-center text-gray-400 dark:text-gray-300">
                  Tarifa actual
                </Text>
              </View>

              <View>
                <View className="flex flex-row justify-between px-2">
                  <View>
                    <Pressable
                      onPress={decrementFare}
                      disabled={isDisableDecrement}
                      className={
                        cn('px-5 py-3 bg-green-100 rounded-lg active:bg-green-200 shadow-none',
                          (isDisableDecrement) && 'bg-gray-200 text-gray-700 cursor-not-allowed',
                          (isDisableDecrement) && 'dark:bg-gray-800 dark:text-gray-400')
                      }>
                      <Text
                        className={
                          cn('text-base text-green-900 text-center font-medium',
                            (isDisableDecrement) && 'text-gray-500 dark:text-gray-400')
                        }>
                        -500
                      </Text>
                    </Pressable>
                  </View>

                  <View className="justify-center">
                    <Text
                      className="text-xl font-medium text-gray-400 dark:text-gray-300">
                      {isLoading
                        ? 'Cargando...'
                        : Intl.NumberFormat('es', {
                          style: 'currency',
                          currency: 'COP'
                        }).format(fare)
                      }
                    </Text>
                  </View>

                  <View>
                    <Pressable
                      onPress={incrementFare}
                      disabled={isDisabled}
                      className={
                        cn('px-5 py-3 bg-green-100 rounded-lg active:bg-green-200 shadow-none',
                          (isDisabled) && 'bg-gray-200 text-gray-700 cursor-not-allowed',
                          (isDisabled) && 'dark:bg-gray-800 dark:text-gray-400')
                      }>
                      <Text
                        className={
                          cn('text-base text-green-900 text-center font-medium',
                            (isDisabled) && 'text-gray-500 dark:text-gray-400')
                        }>
                        +500
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View className="justify-center pt-2">
                <Pressable
                  onPress={makeNewOffer}
                  disabled={isDisableRaiseOffer}
                  className={
                    cn('px-5 py-3 bg-green-700 rounded-lg active:bg-green-800 shadow-none',
                      (isDisableRaiseOffer) && 'bg-gray-200 text-gray-700 cursor-not-allowed',
                      (isDisableRaiseOffer) && 'dark:bg-gray-800 dark:text-gray-400')
                  }>
                  <Text
                    className={
                      cn('text-base text-white text-center font-medium',
                        (isDisableRaiseOffer) && 'text-gray-500 dark:text-gray-400')
                    }>
                    Lanzar oferta
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PassengerNewFare
