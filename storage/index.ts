import AsyncStorage from '@react-native-async-storage/async-storage'

export const storeValue = async (key: string, value: string): Promise<void> => {
  await AsyncStorage.setItem(key, value)
}

export const queryValue = async (key: string): Promise<string | null> => {
  return await AsyncStorage.getItem(key)
}
