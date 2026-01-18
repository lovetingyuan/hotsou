import React from 'react'
import { type StyleProp, TextInput, type TextInputProps, type TextStyle } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedInputProps = TextInputProps & {
  lightColor?: string
  darkColor?: string
  ref?: React.Ref<TextInput>
}

export const ThemedTextInput = React.forwardRef<TextInput, ThemedInputProps>(
  ({ style, lightColor, darkColor, ...rest }, ref) => {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
    const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border')
    const colorStyle: StyleProp<TextStyle> = [{ color, borderColor }]
    if (Array.isArray(style)) {
      colorStyle.push(...style)
    } else {
      colorStyle.push(style)
    }
    return <TextInput ref={ref} placeholderTextColor={'#888'} style={colorStyle} {...rest} />
  },
)

ThemedTextInput.displayName = 'ThemedTextInput'
