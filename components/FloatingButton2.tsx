import { Entypo } from '@expo/vector-icons'
import React, { useCallback, useState } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Link, useFocusEffect } from 'expo-router'

interface FloatingButtonProps extends ViewProps {
  onPress: (action?: string) => void
  color?: string
}

export function FloatingButton({ onPress, color, style, ...rest }: FloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const animation = useSharedValue(0)

  const colorStyle = color
    ? {
        shadowColor: color,
        backgroundColor: color,
      }
    : null

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
    const translateYAnimation = interpolate(animation.value, [0, 1], [0, -15], Extrapolation.CLAMP)

    return {
      transform: [
        {
          scale: withSpring(animation.value),
        },
        {
          translateY: withSpring(translateYAnimation),
        },
      ],
    }
  })

  const shareAnimatedStyle = useAnimatedStyle(() => {
    const translateYAnimation = interpolate(animation.value, [0, 1], [0, -30], Extrapolation.CLAMP)

    return {
      transform: [
        {
          scale: withSpring(animation.value),
        },
        {
          translateY: withSpring(translateYAnimation),
        },
      ],
    }
  })

  const heartAnimatedStyle = useAnimatedStyle(() => {
    const translateYAnimation = interpolate(animation.value, [0, 1], [0, -45], Extrapolation.CLAMP)

    return {
      transform: [
        {
          scale: withSpring(animation.value),
        },
        {
          translateY: withSpring(translateYAnimation),
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

  function toggleMenu() {
    // onPress()
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
  const infoBtn = (
    <Animated.View
      style={[styles.button, styles.secondary, heartAnimatedStyle, opacityAnimatedStyle]}
    >
      <Entypo name="info" size={24} color="#f02a4b" />
    </Animated.View>
  )
  return (
    <View style={[styles.container, style, { height: isOpen ? 233 : 52 }]} {...rest}>
      {isOpen ? <Link href="/about">{infoBtn}</Link> : infoBtn}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={evt => {
          if (!isOpen) {
            return
          }
          onPress('share')
          toggleMenu()
        }}
      >
        <Animated.View
          style={[styles.button, styles.secondary, shareAnimatedStyle, opacityAnimatedStyle]}
        >
          <Entypo name="forward" size={24} color="#f02a4b" />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={evt => {
          if (!isOpen) {
            return
          }
          onPress('reload')
          toggleMenu()
        }}
      >
        <Animated.View
          style={[styles.button, styles.secondary, reloadAnimatedStyle, opacityAnimatedStyle]}
        >
          <Entypo name="cw" size={24} color="#f02a4b" />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.8} onPress={toggleMenu}>
        <Animated.View style={[styles.button, styles.menu, colorStyle, rotationAnimatedStyle]}>
          <Entypo name="plus" size={32} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
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
  },
  menu: {
    backgroundColor: '#f02a4b',
  },
  secondary: {
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
})
