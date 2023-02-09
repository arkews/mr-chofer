import { supabase } from '../index'
import { Photo } from '@shared/types'
import * as Sentry from 'sentry-expo'

const uploadFile = async (bucketName: string, fileName: string, data: FormData) => {
  return await supabase.storage.from(bucketName).upload(fileName, data, {
    cacheControl: '3600',
    upsert: true
  })
}

const updateFile = async (bucketName: string, fileName: string, data: FormData) => {
  return await supabase.storage.from(bucketName).update(fileName, data, {
    cacheControl: '3600',
    upsert: true
  })
}

const fetchFile = async (bucketName: string, fileName: string): Promise<string> => {
  const {
    data,
    error
  } = await supabase.storage.from(bucketName).download(fileName)

  if (error !== null) {
    Sentry.Native.captureException(error)
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

export const uploadAvatar = async (userId: string, photo: Photo): Promise<string | undefined> => {
  const formData = new FormData()
  // @ts-expect-error
  formData.append('file', photo)

  const fileExt = photo.name.split('.').pop() as string
  const fileName = `${userId}.${fileExt}`

  const { error, data } = await uploadFile('avatars', fileName, formData)

  if ((error?.message.includes('already exists')) === true) {
    const { error, data } = await updateFile('avatars', fileName, formData)

    if (error !== null) {
      Sentry.Native.captureException(error)
      return undefined
    }

    return data?.path
  }

  return data?.path
}

export const getAvatarUrl = async (path: string): Promise<string> => {
  return await fetchFile('avatars', path)
}

export const uploadDocumentPhoto = async (documentName: string, photo: Photo) => {
  const formData = new FormData()
  // @ts-expect-error
  formData.append('file', photo)

  const fileExt = photo.name.split('.').pop() as string
  const fileName = `${documentName}.${fileExt}`

  const { error, data } = await uploadFile('documents', fileName, formData)

  if ((error?.message.includes('already exists')) === true) {
    const { error, data } = await updateFile('documents', fileName, formData)

    if (error !== null) {
      Sentry.Native.captureException(error)
      return undefined
    }

    return data?.path
  }

  return data?.path
}
