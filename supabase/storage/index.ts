import { supabase } from '../index'
import { Photo } from '@base/types'
import { Alert } from 'react-native'

export const uploadAvatar = async (userId: string, photo: Photo): Promise<string> => {
  const formData = new FormData()
  // @ts-expect-error
  formData.append('file', photo)

  const fileExt = photo.name.split('.').pop() as string
  const fileName = `${userId}.${fileExt}`

  const {
    error,
    data
  } = await supabase.storage.from('avatars').update(fileName, formData)

  if (error !== null) {
    Alert.alert('Error uploading photo', error.message)
    throw error
  }

  return data?.path
}

export const getAvatarUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage.from('avatars').download(path)

  if (error !== null) {
    throw error
  }

  const fr = new FileReader()
  fr.readAsDataURL(data)

  return await new Promise((resolve, reject) => {
    fr.onload = () => {
      resolve(fr.result as string)
    }
    fr.onerror = () => {
      reject(fr.error)
    }
  })
}
