import React, { FC, useCallback } from 'react'
import { Pressable, Text } from 'react-native'
import DocumentPicker, { types } from 'react-native-document-picker'
import { Photo } from '@shared/types'
import { launchCamera } from 'react-native-image-picker'
import ImageResizer from '@bam.tech/react-native-image-resizer'

type Mode = 'take' | 'pick'

type Props = {
  disabled?: boolean
  label?: string
  mode?: Mode

  onSelect?: (photo: Photo) => void
}

const PhotoPicker: FC<Props> = ({ disabled, label, mode, onSelect }) => {
  const finalMode = mode ?? 'pick'

  const handlePickPhoto = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
        type: types.images,
        mode: 'open'
      })

      const resized = await ImageResizer.createResizedImage(
        res.uri,
        500,
        500,
        'JPEG',
        80
      )

      const photo: Photo = {
        uri: resized.uri,
        type: 'image/jpeg',
        name: resized.name ?? 'photo'
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

  const handleTakePhoto = useCallback(async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      maxHeight: 500,
      maxWidth: 500,
      saveToPhotos: true
    })

    if (result.didCancel === true) {
      return
    }

    if (result.errorCode !== undefined) {
      throw new Error(result.errorMessage)
    }

    if (result.assets === undefined) {
      return
    }

    const asset = result.assets.pop()
    if (asset === undefined) {
      return
    }

    const photo: Photo = {
      uri: asset.uri as string,
      type: asset.type ?? 'image/jpeg',
      name: asset.fileName ?? 'photo'
    }

    onSelect?.(photo)
  }, [])

  return (
    <Pressable
      disabled={disabled}
      onPress={finalMode === 'take' ? handleTakePhoto : handlePickPhoto}
      className="text-base px-6 py-3.5 border-blue-500 rounded-lg border dark:border-blue-300">
      <Text className="text-blue-500 text-center dark:text-blue-300">
        {label ?? 'Seleccionar foto'}
      </Text>
    </Pressable>
  )
}

export default PhotoPicker
