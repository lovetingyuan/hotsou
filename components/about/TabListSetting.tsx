import React from 'react'
import {
  Button,
  Modal,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native'

import { TabsList } from '@/constants/Tabs'
import { useColorScheme } from '@/hooks/useColorScheme'
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
    set$tabsList(list => {
      const _index = list.findIndex(v => v.name === props.tab.name)
      const newIndex = direction === 'up' ? _index - 1 : _index + 1
      const newList = [...list]
      ;[newList[_index], newList[newIndex]] = [newList[newIndex], newList[_index]]
      return newList
    })
  }

  return (
    <View style={[styles.item, { borderTopWidth: props.index ? 0 : 1 }]}>
      <View style={{ flexShrink: 1 }}>
        {!props.tab.builtIn ? (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              props.setEditingName(props.tab.name)
            }}
          >
            <ThemedText
              style={[styles.text, { color: '#0969da' }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {props.index + 1}. ✎ {props.tab.title}
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
          thumbColor={props.tab.show ? '#819cff' : '#f4f3f4'}
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
              if (!list[index].builtIn && !list[index].url) {
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
    </View>
  )
}

function EditingModal(props: { name: string; visible: boolean; closeModal: () => void }) {
  const { get$tabsList, set$tabsList } = useStore()
  const colorScheme = useColorScheme()
  const tabList = get$tabsList()
  const tab = tabList.find(v => v.name === props.name)
  const [title, setTitle] = React.useState(tab?.title ?? '')
  const [url, setUrl] = React.useState(tab?.url ?? '')
  React.useEffect(() => {
    if (tab) {
      setTitle(tab.title)
    }
    if (tab) {
      setUrl(tab.url)
    }
  }, [tab])
  if (!props.name || !tab) {
    return null
  }

  const handleSaveSub = () => {
    if (!title.trim()) {
      ToastAndroid.show('名称不能为空', ToastAndroid.SHORT)
      return
    }
    if (TabsList.find(v => v.title === title.trim() && v.name !== tab.name)) {
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
    set$tabsList(list => {
      const newList = [...list]
      const index = newList.findIndex(v => v.name === tab.name)
      if (index >= 0) {
        newList[index] = {
          ...newList[index],
          title: title.trim(),
          url: url.trim(),
        }
      }
      return newList
    })
    props.closeModal()
  }
  const handleCancel = () => {
    setTitle(tab?.title ?? '')
    setUrl(tab?.url ?? '')
    props.closeModal()
  }
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={() => {
        props.closeModal()
      }}
    >
      <View style={styles.centeredView}>
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>编辑站点</ThemedText>
          <ThemedTextInput
            placeholder="名称"
            autoFocus
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <ThemedTextInput
            style={styles.input}
            placeholder="网址(https://)"
            inputMode="url"
            keyboardType="url"
            value={url}
            numberOfLines={3}
            multiline
            onChangeText={setUrl}
          />
          <View
            style={{ flexDirection: 'row', gap: 30, marginTop: 20, justifyContent: 'flex-end' }}
          >
            <Button title=" 取消 " color={'#888'} onPress={handleCancel}></Button>
            <Button title=" 保存 " onPress={handleSaveSub}></Button>
          </View>
        </ThemedView>
      </View>
    </Modal>
  )
}

export default function TabListSetting() {
  const { $tabsList } = useStore()

  const [editingName, setEditingName] = React.useState('')

  return (
    <ThemedView style={{ marginTop: 15 }}>
      <ThemedText style={{ fontSize: 20, marginBottom: 14 }}>频道列表：</ThemedText>
      {$tabsList.map((tab, index, _list) => {
        return (
          <TabItem
            key={tab.name}
            tab={tab}
            index={index}
            last={index === _list.length - 1}
            editingName={editingName}
            setEditingName={setEditingName}
          />
        )
      })}
      <EditingModal
        name={editingName}
        visible={!!editingName}
        closeModal={() => {
          setEditingName('')
        }}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderTopColor: '#e2e2e2',
    height: 50,
  },
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
  },
  modalView: {
    margin: 20,
    // backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 25,
    paddingHorizontal: 20,
    width: '70%',
    // shadowColor: 'white',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
    gap: 20,
  },
})
