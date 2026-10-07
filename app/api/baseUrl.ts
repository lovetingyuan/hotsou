import Constants from 'expo-constants'

function getDevBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '')
  }

  // API 和 Metro 在同一台开发机上，复用 Expo 的地址，避免自行猜测网卡 IP。
  const hostUri = Constants.expoConfig?.hostUri ?? globalThis.location?.host ?? 'localhost'
  const url = new URL(`http://${hostUri}`)
  url.port = '8787'
  return url.origin
}

export const BASE_URL = __DEV__ ? getDevBaseUrl() : 'https://hotsou.tingyuan.in'
