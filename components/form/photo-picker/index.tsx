import React, { FC } from 'react'
import { Pressable, Text } from 'react-native'
import DocumentPicker, { types } from 'react-native-document-picker'

type Props = {}

const PhotoPicker: FC<Props> = () => {
  const pickPhoto = async (): Promise<void> => {
    try {
      const res = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
        type: types.images,
        mode: 'open'
      })

      console.log('res', res)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.warn('cancelled')
      } else {
        throw err
      }
    }
  }

  return (
    <Pressable onPress={pickPhoto} className="mt-7">
      <Text className="dark:text-white">Seleccionar foto</Text>
    </Pressable>
  )
}

export default PhotoPicker
