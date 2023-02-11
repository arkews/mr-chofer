import { useAuth } from '@base/auth/context'
import { Document } from '@base/shared/types'
import { supabase } from '@base/supabase'
import { uploadDocumentPhoto } from '@base/supabase/storage'
import DocumentPickerInput from '@components/form/document-picker'
import SafeAreaInsetsView from '@components/view/safe-area-insets.view'
import useDriver from '@hooks/drivers/use-driver'
import { RootStackScreenProps } from '@navigation/types'
import { useFocusEffect } from '@react-navigation/native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FC, useCallback } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'

type Props = RootStackScreenProps<'AttachDriverDocuments'>

type DocumentType = 'contract_url' | 'notary_power_url'
type UploadDocumentArgs = { type: DocumentType, document: Document }

const AttachDriverDocumentsScreen: FC<Props> = ({ navigation }) => {
  const { driver } = useDriver()

  const checkDocuments = useCallback(() => {
    if (driver?.contract_url !== null && driver?.notary_power_url !== null) {
      navigation.replace('DriverDetails')
    }
  }, [driver])

  useFocusEffect(checkDocuments)

  const uploadDocument = async ({ type, document }: UploadDocumentArgs) => {
    if (driver === undefined || driver === null) {
      return
    }

    const documentUrl = await uploadDocumentPhoto(
      `${driver.id}-${type}`,
      document
    )
    if (documentUrl === undefined) {
      Alert.alert('Error', 'No se pudo subir el documento')
      return
    }

    const { error } = await supabase
      .from('drivers')
      .update({ [type]: documentUrl })
      .eq('id', driver.id)

    if (error !== null) {
      const rawError = new Error(error.message)
      Sentry.Native.captureException(rawError, {
        contexts: {
          driver,
          error
        }
      })
      throw rawError
    }
  }

  const queryClient = useQueryClient()
  const { session } = useAuth()
  const { mutate, isLoading, error } = useMutation(uploadDocument, {
    onSuccess: () => {
      void queryClient.invalidateQueries(['driver', session?.user?.id])
    }
  })

  const uploadContract = (document: Document) => {
    mutate({ type: 'contract_url', document })
  }

  const uploadNotaryPower = (document: Document) => {
    mutate({ type: 'notary_power_url', document })
  }

  const disabled = isLoading

  return (
    <SafeAreaInsetsView>
      <ScrollView
        className="min-h-screen px-2 py-3"
        contentContainerStyle={styles.container}
      >
        <View>
          <View className="flex flex-grow w-full justify-center mx-auto space-y-5">
            <View>
              <Text className="text-2xl font-bold text-center my-auto text-gray-900 dark:text-gray-100">
                Anexar documentos adicinales
              </Text>

              <Text className="text-base text-center my-auto text-gray-500 dark:text-gray-400">
                <Text className="font-bold">{driver?.name}</Text>
                <Text>
                  , por favor anexa los documentos adicionales para poder
                  continuar.
                </Text>
              </Text>
            </View>

            <View className="pt-7">
              <View className="flex flex-col space-y-3 justify-center">
                {driver?.contract_url === null && (
                  <View>
                    <DocumentPickerInput
                      label="Subir contrato"
                      disabled={disabled}
                      onSelect={uploadContract}
                    />
                  </View>
                )}

                {driver?.notary_power_url === null && (
                  <View>
                    <DocumentPickerInput
                      label="Subir poder notarial"
                      disabled={disabled}
                      onSelect={uploadNotaryPower}
                    />
                  </View>
                )}
              </View>
            </View>

            {error !== null && (
              <View className="flex flex-col space-y-3 justify-center">
                <Text className="text-red-500 text-center">
                  Ha ocurrido un error al subir el documento
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaInsetsView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default AttachDriverDocumentsScreen
