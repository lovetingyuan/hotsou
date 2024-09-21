import { type StyleProp, TextInput, type TextInputProps, type TextStyle } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedInputProps = TextInputProps & {
  lightColor?: string
  darkColor?: string
}

export function ThemedTextInput({ style, lightColor, darkColor, ...rest }: ThemedInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border')
  const colorStyle: StyleProp<TextStyle> = [{ color, borderColor }]
  if (Array.isArray(style)) {
    colorStyle.push(...style)
  } else {
    colorStyle.push(style)
  }
  return <TextInput placeholderTextColor={'#888'} style={colorStyle} {...rest} />
}
