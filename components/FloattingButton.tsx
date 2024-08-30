import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import Animated, {
  // Extrapolation,
  // interpolate,
  useAnimatedStyle,
  useSharedValue,
  // withSpring,
  withTiming,
} from 'react-native-reanimated'

interface FloatingButtonProps extends ViewProps {
  onPress: () => void
}

export function FloatingButton({ onPress, style, ...rest }: FloatingButtonProps) {
  const rotation = useSharedValue(0)

  const startRotation = () => {
    rotation.value = withTiming(
      360,
      {
        duration: 600, // 动画时长，单位为毫秒
      },
      () => {
        // 重置旋转角度，以便重复动画
        rotation.value = 0
      }
    )
  }
  const rotationAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    }
  })

  return (
    <View style={[styles.container, style]} {...rest}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          onPress()
          startRotation()
        }}
      >
        <Animated.View style={[styles.button, styles.menu, rotationAnimatedStyle]}>
          <Ionicons name="refresh" size={30} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    bottom: 20,
    right: 20,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowColor: '#f02a4b',
    shadowOpacity: 0.3,
    shadowOffset: { height: 10, width: 10 },
    elevation: 10,
  },
  menu: {
    backgroundColor: '#f02a4b',
  },
  secondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
})
