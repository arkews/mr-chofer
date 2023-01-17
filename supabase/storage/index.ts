import { supabase } from '../index'
import { Photo } from '@base/types'

export const uploadAvatar = async (userId: string, photo: Photo): Promise<string> => {
  const formData = new FormData()
  // @ts-expect-error
  formData.append('file', photo)

  const fileExt = photo.name.split('.').pop() as string
  const fileName = `${userId}.${fileExt}`

  const {
    error,
    data
  } = await supabase.storage.from('avatars').upload(fileName, formData)

  if (error !== null) {
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
