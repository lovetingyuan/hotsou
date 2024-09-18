import 'react-native-reanimated'

const _push = Array.prototype.push
/**
 *  {
    props: {},
    route: {
      children: [Array],
      contextKey: './(tabs)/li.tsx',
      dynamic: null,
      loadRoute: [],
      route: 'ppp',
      type: 'route',
    },
  },
 */
/**
 * Hack node_modules/expo-router/build/useScreens.js L:50
 */
// eslint-disable-next-line sonarjs/no-extend-native, no-extend-native
Array.prototype.push = function push(...args) {
  const route = args[0]?.route
  if (
    route &&
    route.type === 'route' &&
    typeof route.route === 'string' &&
    typeof route.contextKey === 'string'
  ) {
    return _push.call(this)
  }
  return _push.call(this, ...args)
}
