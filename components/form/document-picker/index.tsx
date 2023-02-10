import React, { FC, useCallback } from 'react'
import { Pressable, Text } from 'react-native'
import DocumentPicker, { types } from 'react-native-document-picker'
import { Document } from '@shared/types'
import { styled } from 'nativewind'
import { MaterialIcons } from '@expo/vector-icons'

type Props = {
  disabled?: boolean
  label?: string

  onSelect?: (document: Document) => void
}

const StyledIcon = styled(MaterialIcons)

const DocumentPickerInput: FC<Props> = ({ disabled, label, onSelect }) => {
  const handlePickDocument = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
        type: types.pdf,
        mode: 'open'
      })

      const document: Document = {
        uri: res.uri,
        type: res.type ?? 'application/pdf',
        name: res.name ?? 'document'
      }

      onSelect?.(document)
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
      onPress={handlePickDocument}
      className="flex flex-row justify-center items-center space-x-2 px-6 py-3.5 border-blue-500 rounded-lg border dark:border-blue-300">
      <Text
        className="text-blue-500 text-center font-medium dark:text-blue-300">
        <StyledIcon name="file-upload"
                    className="text-2xl text-white"/>
        {label ?? 'Seleccionar documento'}
      </Text>
    </Pressable>
  )
}

export default DocumentPickerInput
