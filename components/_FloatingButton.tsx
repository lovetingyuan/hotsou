import Entypo from '@expo/vector-icons/Entypo'
import { Link, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { StyleSheet, TouchableOpacity, ViewProps } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { useAppStateChange } from '@/hooks/useAppState'

interface FloatingButtonProps extends ViewProps {
  onPress: (action?: string) => void
  onLongPress?: (action?: string) => void
  color?: string
}

export function FloatingButton({
  onPress,
  onLongPress,
  color,
  style,
  ...rest
}: FloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const animation = useSharedValue(0)

  const colorStyle = color
    ? {
        shadowColor: color,
        backgroundColor: color,
      }
    : null

  useAppStateChange(state => {
    if (state === 'background') {
      setIsOpen(false)
    }
  })

  const rotationAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(isOpen ? '45deg' : '0deg'),
        },
      ],
    }
  })

  const reloadAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(animation.value),
        },
      ],
    }
  })

  const shareAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(animation.value),
        },
      ],
    }
  })

  const infoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(animation.value),
        },
      ],
    }
  })

  const opacityAnimatedStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      animation.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolation.CLAMP
    )

    return {
      opacity: withSpring(opacityAnimation),
    }
  })

  const gapAnimatedStyle = useAnimatedStyle(() => {
    const gapAnimation = interpolate(animation.value, [0, 1], [0, 15], Extrapolation.CLAMP)

    return {
      gap: withSpring(gapAnimation),
    }
  })

  const toggleMenu = () => {
    setIsOpen(current => {
      animation.value = current ? 0 : 1
      return !current
    })
  }
  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsOpen(false)
        animation.value = 0
      }
    }, [animation])
  )

  const buttons = isOpen ? (
    <>
      <Link href="/about">
        <Animated.View
          style={[styles.button, styles.secondary, infoAnimatedStyle, opacityAnimatedStyle]}
        >
          <Entypo name="info" size={24} color="#f02a4b" />
        </Animated.View>
      </Link>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (!isOpen) {
            return
          }
          onPress('share')
          toggleMenu()
        }}
        onLongPress={
          onLongPress
            ? () => {
                onLongPress?.('share')
                toggleMenu()
              }
            : undefined
        }
      >
        <Animated.View
          style={[styles.button, styles.secondary, shareAnimatedStyle, opacityAnimatedStyle]}
        >
          <Entypo name="forward" size={24} color="#f02a4b" />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (!isOpen) {
            return
          }
          onPress('reload')
          toggleMenu()
        }}
        onLongPress={
          onLongPress
            ? () => {
                onLongPress?.('reload')
                toggleMenu()
              }
            : undefined
        }
      >
        <Animated.View
          style={[styles.button, styles.secondary, reloadAnimatedStyle, opacityAnimatedStyle]}
        >
          <Entypo name="cw" size={24} color="#f02a4b" />
        </Animated.View>
      </TouchableOpacity>
    </>
  ) : null
  return (
    <Animated.View style={[styles.container, style, gapAnimatedStyle]} {...rest}>
      {buttons}
      <TouchableOpacity activeOpacity={0.8} onPress={toggleMenu}>
        <Animated.View style={[styles.button, colorStyle, rotationAnimatedStyle]}>
          <Entypo name="plus" size={32} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 9,
    justifyContent: 'flex-end',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowColor: '#f02a4b',
    shadowOpacity: 0.3,
    shadowOffset: { height: 10, width: 10 },
    elevation: 10,
    opacity: 0.9,
  },

  secondary: {
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
})
