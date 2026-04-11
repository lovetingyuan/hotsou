import { Ionicons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native'

import { useColorScheme } from '@/hooks/useColorScheme'
import { useStore } from '@/store'

import { ThemedText } from './ThemedText'

export default function RefreshFab() {
  const { setReloadTab, setReloadAllTab, $tabsList, activeTab, $fabPosition } = useStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [menuVisible, setMenuVisible] = useState(false)
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
  }

  const handleLongPress = () => {
    Vibration.vibrate(20)
    setMenuVisible(true)
  }

  const handleRefreshAll = () => {
    setMenuVisible(false)
    setReloadAllTab(Date.now())
  }

  if (!page) return null

  return (
    <>
      <Animated.View style={[styles.fabContainer, $fabPosition === 'left' ? { left: 20 } : { right: 20 }, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          style={[styles.fab, { backgroundColor: isDark ? '#333' : '#fff' }]}
          android_ripple={{ color: isDark ? '#555' : '#ddd', borderless: true }}
        >
          <Ionicons name="reload" size={22} color={isDark ? '#fff' : '#333'} />
        </Pressable>
      </Animated.View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={[styles.overlay, $fabPosition === 'left' ? { alignItems: 'flex-start', paddingLeft: 20 } : { alignItems: 'flex-end', paddingRight: 20 }]} onPress={() => setMenuVisible(false)}>
          <Pressable
            style={[styles.menu, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity style={styles.menuItem} onPress={handleRefreshAll} activeOpacity={0.6}>
              <Ionicons name="refresh-outline" size={20} color={isDark ? '#fff' : '#333'} />
              <ThemedText style={styles.menuText}>刷新全部</ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 90,
  },
  menu: {
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 140,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  menuText: {
    fontSize: 16,
  },
})
