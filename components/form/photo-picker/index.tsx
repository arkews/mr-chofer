import React, { FC, useCallback } from 'react'
import { Pressable, Text } from 'react-native'
import DocumentPicker, { types } from 'react-native-document-picker'
import { Photo } from '../../../types'

type Props = {
  disabled?: boolean

  onSelect?: (photo: Photo) => void
}

const PhotoPicker: FC<Props> = ({ disabled, onSelect }) => {
  const handlePickPhoto = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
        type: types.images,
        mode: 'open'
      })

      const photo: Photo = {
        uri: res.uri,
        type: res.type ?? 'image/jpeg',
        name: res.name ?? 'photo'
      }

      onSelect?.(photo)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.warn('cancelled')
      } else {
        throw err
      }
    }
  }, [])

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePickPhoto}
      className="text-base px-6 py-3.5 border-blue-500 rounded-lg border dark:border-blue-300">
      <Text className="text-blue-500 text-center dark:text-blue-300">
        Seleccionar foto
      </Text>
    </Pressable>
  )
}

export default PhotoPicker
