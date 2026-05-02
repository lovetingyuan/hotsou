import { useEffect, useState } from 'react'
import { Appearance, ColorSchemeName, useColorScheme as useRNColorScheme } from 'react-native'

export function useColorScheme(): ColorSchemeName {
  const rnScheme = useRNColorScheme()
  const [listenerScheme, setListenerScheme] = useState<ColorSchemeName | null>(
    Appearance.getColorScheme() ?? null,
  )

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setListenerScheme(colorScheme ?? null)
    })
    return () => subscription.remove()
  }, [])

  return listenerScheme ?? rnScheme ?? 'light'
}
