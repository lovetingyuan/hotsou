export const BASE_URL = __DEV__
  ? `http://${process.env.EXPO_PUBLIC_IPV4}:8787`
  : 'https://hotsou-server.tingyuan.workers.dev'
