import AsyncStorage from '@react-native-async-storage/async-storage'

import { getStoreMethods } from '@/store'
import { getDefaultSyncPayload, SyncDataKeys } from '@/store/syncData'

export async function clearLocalSyncData() {
  const defaults = getDefaultSyncPayload()
  const methods = getStoreMethods()

  for (const key of SyncDataKeys) {
    const setKey = `set${key}` as keyof typeof methods
    ;(methods[setKey] as (value: (typeof defaults)[typeof key]) => void)(defaults[key])
  }

  await AsyncStorage.multiRemove(SyncDataKeys as unknown as string[])
}
