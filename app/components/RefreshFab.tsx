import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import React, { useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  ToastAndroid,
  Vibration,
} from 'react-native'

import { useStore } from '@/store'

const FAB_TIP_KEY = 'fab_long_press_tip_shown'

export default function RefreshFab() {
  const { setReloadTab, setReloadAllTab, $tabsList, activeTab, $fabPosition } = useStore()
  const scaleAnim = useRef(new Animated.Value(1)).current
  const page = $tabsList.find((t) => t.name === activeTab)

  const handlePress = () => {
    if (!page) return
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
    setReloadTab([page.name, false])
    AsyncStorage.getItem(FAB_TIP_KEY).then((v) => {
      if (!v) {
        ToastAndroid.show('长按可刷新全部页面', ToastAndroid.SHORT)
        AsyncStorage.setItem(FAB_TIP_KEY, '1')
      }
    })
  }

  const handleLongPress = () => {
    Vibration.vibrate(20)
    setReloadAllTab(Date.now())
  }

  if (!page) return null

  return (
    <Animated.View style={[styles.fabContainer, $fabPosition === 'left' ? { left: 20 } : { right: 20 }, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={styles.fab}
        android_ripple={{ color: '#4a8a00', borderless: true }}
      >
        <Ionicons name="reload" size={22} color="#fff" />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    zIndex: 999,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#66B105',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
