import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

import { ThemedText } from './ThemedText'

export type ButtonType = 'primary' | 'secondary' | 'danger'

export interface ThemedButtonProps extends PressableProps {
  title: string
  type?: ButtonType
  style?: ViewStyle
  textStyle?: TextStyle
  isLoading?: boolean
}

export function ThemedButton({
  title,
  type = 'primary',
  style,
  textStyle,
  isLoading,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const primaryColor = useThemeColor({}, 'primary')

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) {
      return '#ccc'
    }

    switch (type) {
      case 'primary':
        return pressed ? primaryColor + 'cc' : primaryColor // 80% opacity on press
      case 'danger':
        return pressed ? '#ff4444' : '#ff6666'
      case 'secondary':
        return pressed ? '#888' : '#aaa'
      default:
        return pressed ? primaryColor + 'cc' : primaryColor
    }
  }

  const getTextColor = () => {
    if (disabled) {
      return '#666'
    }
    return '#fff'
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: getBackgroundColor(pressed) },
        style,
      ]}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <ThemedText style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</ThemedText>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
})
