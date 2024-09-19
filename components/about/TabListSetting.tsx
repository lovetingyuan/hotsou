import React from 'react'
import {
  StyleSheet,
  Switch,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'

import { TabsName } from '@/constants/Tabs'
import { useStore } from '@/store'

import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

export default function TabListSetting() {
  const { $tabsList, set$tabsList, $liKey, set$liKey, showMuziToggle } = useStore()

  const handleMove = (direction: 'up' | 'down', index: number) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newList = [...$tabsList]
    ;[newList[index], newList[newIndex]] = [newList[newIndex], newList[index]]
    set$tabsList(newList)
  }
  const colorScheme = useColorScheme()

  const color = colorScheme === 'dark' ? 'white' : 'black'
  const [liKey, setLiKey] = React.useState('')
  const liValid = $liKey === process.env.EXPO_PUBLIC_LI_SHOW_KEY

  return (
    <ThemedView style={{ marginTop: 15 }}>
      {$tabsList
        .filter(v => {
          return !(!showMuziToggle && v.name === TabsName.muzi)
        })
        .map((tab, index) => {
          return (
            <View
              key={tab.name}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#e2e2e2',
                paddingVertical: 5,
                paddingHorizontal: 2,
                paddingRight: 5,
                borderTopColor: '#e2e2e2',
                borderTopWidth: index ? 0 : 1,
              }}
            >
              <ThemedText style={styles.text}>
                {index + 1}. {tab.title}
              </ThemedText>
              {tab.name === TabsName.muzi ? (
                <TextInput
                  style={{
                    height: 40,
                    borderBottomWidth: 1,
                    padding: 5,
                    borderColor: color,
                    color: color,
                  }}
                  placeholderTextColor={'#555'}
                  onChangeText={setLiKey}
                  value={liKey}
                />
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {index === 0 ? null : (
                  <TouchableOpacity
                    onPress={() => {
                      handleMove('up', index)
                    }}
                  >
                    <ThemedText style={styles.arrow}>⬆</ThemedText>
                  </TouchableOpacity>
                )}
                {index === $tabsList.length - 1 ? null : (
                  <TouchableOpacity
                    onPress={() => {
                      handleMove('down', index)
                    }}
                  >
                    <ThemedText style={styles.arrow}>⬇</ThemedText>
                  </TouchableOpacity>
                )}
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={tab.show ? '#80f43e' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  value={tab.show}
                  onValueChange={() => {
                    const list = [...$tabsList]
                    const index = list.findIndex(v => v.name === tab.name)
                    const toShow = !list[index].show
                    if (!toShow) {
                      const showedCount = list.filter(v => v.show).length
                      if (showedCount === 1) {
                        ToastAndroid.show('不支持关闭全部', ToastAndroid.SHORT)
                        return
                      }
                    }
                    if (list[index].name === TabsName.muzi && toShow && !liValid) {
                      set$liKey(liKey)
                      ToastAndroid.show('暂不支持', ToastAndroid.SHORT)
                    } else {
                      const newItem = {
                        ...list[index],
                        show: toShow,
                      }
                      list[index] = newItem
                      set$tabsList(list)
                    }
                  }}
                />
              </View>
            </View>
          )
        })}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'left',
    fontSize: 18,
  },
  arrow: {
    fontSize: 24,
    width: 30,
    height: 30,
    lineHeight: 32,
    opacity: 0.6,
    textAlign: 'center',
  },
})
