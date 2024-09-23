import React from 'react'
import {
  Button,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native'

import { TabsList } from '@/constants/Tabs'
import { useStore } from '@/store'
import { isHttpUrl } from '@/utils'

import { ThemedTextInput } from '../ThemedInput'
import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

function TabItem(
  props: {
    tab: (typeof TabsList)[0]
    index: number
    last?: boolean
  } & UseStateByKey<'editingName', string>
) {
  const { get$tabsList, set$tabsList } = useStore()
  const handleMove = (direction: 'up' | 'down') => {
    if (props.editingName) {
      ToastAndroid.show('请先完成编辑', ToastAndroid.SHORT)
      return
    }
    const _index = get$tabsList().findIndex(v => v.name === props.tab.name)
    const newIndex = direction === 'up' ? _index - 1 : _index + 1
    const newList = [...get$tabsList()]
    ;[newList[_index], newList[newIndex]] = [newList[newIndex], newList[_index]]
    set$tabsList(newList)
  }

  const [title, setTitle] = React.useState(props.tab.title)
  const [url, setUrl] = React.useState(props.tab.url)
  const handleSaveSub = () => {
    if (!title.trim()) {
      ToastAndroid.show('名称不能为空', ToastAndroid.SHORT)
      return
    }
    if (TabsList.find(v => v.title === title.trim() && v.name !== props.tab.name)) {
      ToastAndroid.show('请换一个名称', ToastAndroid.SHORT)
      return
    }
    if (!url.trim()) {
      ToastAndroid.show('网址不能为空', ToastAndroid.SHORT)
      return
    }
    if (!isHttpUrl(url.trim())) {
      ToastAndroid.show('网址不合法', ToastAndroid.SHORT)
      return
    }
    const newList = [...get$tabsList()]
    const index = newList.findIndex(v => v.name === props.tab.name)
    if (index >= 0) {
      newList[index] = {
        ...newList[index],
        title: title.trim(),
        url: url.trim(),
      }
    }
    set$tabsList(newList)
    props.setEditingName('')
  }
  if (props.editingName !== props.tab.name) {
    return (
      <>
        <View>
          {props.tab.name.startsWith('zidingyi') ? (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                props.setEditingName(props.tab.name)
              }}
            >
              <ThemedText style={[styles.text, { color: '#0969da' }]}>
                {props.index + 1}. {props.tab.title} ✎
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <ThemedText style={styles.text}>
              {props.index + 1}. {props.tab.title}
            </ThemedText>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {props.index === 0 ? null : (
            <TouchableOpacity
              onPress={() => {
                handleMove('up')
              }}
            >
              <ThemedText style={styles.arrow}>⬆</ThemedText>
            </TouchableOpacity>
          )}
          {props.last ? (
            <Text style={styles.arrow}> </Text>
          ) : (
            <TouchableOpacity
              onPress={() => {
                handleMove('down')
              }}
            >
              <ThemedText style={styles.arrow}>⬇</ThemedText>
            </TouchableOpacity>
          )}
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={props.tab.show ? '#80f43e' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            value={props.tab.show}
            onValueChange={() => {
              const list = [...get$tabsList()]
              const index = list.findIndex(v => v.name === props.tab.name)
              const toShow = !list[index].show
              if (!toShow) {
                const showedCount = list.filter(v => v.show).length
                if (showedCount === 1) {
                  ToastAndroid.show('不支持关闭全部', ToastAndroid.SHORT)
                  return
                }
              }
              if (toShow) {
                if (list[index].name.startsWith('zidingyi') && list[index].url === 'https://') {
                  ToastAndroid.show('请先点击名称编辑', ToastAndroid.SHORT)
                  return
                }
              }

              const newItem = {
                ...list[index],
                show: toShow,
              }
              list[index] = newItem
              set$tabsList(list)
            }}
          />
        </View>
      </>
    )
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <ThemedTextInput
        placeholder="名称"
        style={[styles.input, { flexGrow: 1, flexShrink: 1, minWidth: 40 }]}
        value={title}
        onChangeText={setTitle}
      />
      <ThemedTextInput
        style={[styles.input, { flexGrow: 4, flexShrink: 1 }]}
        placeholder="网址(https://)"
        inputMode="url"
        keyboardType="url"
        value={url}
        onChangeText={setUrl}
      />
      <ThemedText
        style={{
          fontSize: 20,
          width: 24,
          textAlign: 'center',
          height: 24,
          lineHeight: 26,
        }}
        onPress={() => {
          setTitle(props.tab.title)
          setUrl(props.tab.url)
          props.setEditingName('')
        }}
      >
        ✕
      </ThemedText>
      <Button title=" 保存 " onPress={handleSaveSub}></Button>
    </View>
  )
}

export default function TabListSetting() {
  const { $tabsList } = useStore()

  const [editingName, setEditingName] = React.useState('')

  return (
    <ThemedView style={{ marginTop: 15 }}>
      {$tabsList.map((tab, index, _list) => {
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
              paddingHorizontal: 5,
              borderTopColor: '#e2e2e2',
              borderTopWidth: index ? 0 : 1,
              height: 50,
            }}
          >
            <TabItem
              tab={tab}
              index={index}
              last={index === _list.length - 1}
              editingName={editingName}
              setEditingName={setEditingName}
            />
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
  input: {
    borderBottomWidth: 1,
    paddingHorizontal: 4,
    fontSize: 16,
  },
})
