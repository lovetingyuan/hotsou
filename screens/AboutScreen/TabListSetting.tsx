import React from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native'
import { NestableDraggableFlatList, RenderItemParams } from 'react-native-draggable-flatlist'

import { ThemedButton } from '@/components/ThemedButton'
import ThemedIcon from '@/components/ThemedIcon'
import { ThemedTextInput } from '@/components/ThemedInput'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useStore } from '@/store'
import { isHttpUrl } from '@/utils'

type TabType = {
  name: string
  title: string
  url: string
  show: boolean
  builtIn?: boolean
  icon?: string
}

function EditingModal(props: {
  name: string
  visible: boolean
  isAdding: boolean
  closeModal: () => void
}) {
  const { get$tabsList, set$tabsList } = useStore()
  const colorScheme = useColorScheme()
  const tabList = get$tabsList()
  const tab = tabList.find(v => v.name === props.name)
  const [title, setTitle] = React.useState('')
  const [url, setUrl] = React.useState('')
  const inputRef = React.useRef<TextInput>(null)

  React.useEffect(() => {
    if (props.visible) {
      if (props.isAdding) {
        setTitle('')
        setUrl('')
      } else if (tab) {
        setTitle(tab.title)
        setUrl(tab.url)
      }
    }
  }, [props.visible, props.isAdding, tab])

  const onShow = () => {
    // Delay to ensure modal is visible and animation is done
    setTimeout(() => {
      inputRef.current?.focus()
    }, 600)
  }

  if (!props.visible) {
    return null
  }

  const handleSaveSub = () => {
    if (!title.trim()) {
      ToastAndroid.show('名称不能为空', ToastAndroid.SHORT)
      return
    }
    // Check for duplicate titles in the current list
    const currentList = get$tabsList()
    if (
      currentList.find(v => v.title === title.trim() && (props.isAdding || v.name !== props.name))
    ) {
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
      if (props.isAdding) {
        newList.push({
          name: `custom_${Date.now()}`,
          title: title.trim(),
          url: url.trim(),
          show: true,
          builtIn: false,
          icon: '', // Optional: add default icon or allow user to input
        } as any)
      } else {
        const index = newList.findIndex(v => v.name === props.name)
        if (index >= 0) {
          newList[index] = {
            ...newList[index],
            title: title.trim(),
            url: url.trim(),
            show: true,
            builtIn: false,
            icon: '', // Optional: add default icon or allow user to input
          }
        }
      }
      return newList
    })
    props.closeModal()
  }

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个站点吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          set$tabsList(list => list.filter(v => v.name !== props.name))
          props.closeModal()
        },
      },
    ])
  }

  const handleCancel = () => {
    props.closeModal()
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.visible}
      statusBarTranslucent={true}
      onRequestClose={() => {
        props.closeModal()
      }}
      onShow={onShow}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centeredView}
      >
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
            {props.isAdding ? '添加站点' : '编辑站点'}
          </ThemedText>
          <ThemedTextInput
            ref={inputRef}
            placeholder="名称"
            autoFocus
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <ThemedTextInput
            style={styles.input}
            placeholder="网址(http完整地址)"
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
            {!props.isAdding && !tab?.builtIn && (
              <ThemedButton title="删除" type="danger" onPress={handleDelete}></ThemedButton>
            )}
            <ThemedButton title="取消" type="secondary" onPress={handleCancel}></ThemedButton>
            <ThemedButton title="保存" onPress={handleSaveSub}></ThemedButton>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default function TabListSetting() {
  const { $tabsList, set$tabsList, get$tabsList } = useStore()

  const [editingName, setEditingName] = React.useState('')
  const [isAdding, setIsAdding] = React.useState(false)

  return (
    <ThemedView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}># 频道列表：</ThemedText>
        <ThemedButton
          title="添加"
          onPress={() => {
            setIsAdding(true)
          }}
        />
      </View>
      <NestableDraggableFlatList
        data={$tabsList}
        renderItem={({ item, getIndex, drag, isActive }: RenderItemParams<TabType>) => {
          const index = getIndex() ?? -1
          return (
            <View
              style={[
                styles.item,
                {
                  borderTopWidth: index ? 0 : 1,
                  backgroundColor: isActive ? '#f0f0f0' : undefined,
                  opacity: isActive ? 0.8 : 1,
                },
              ]}
            >
              <View style={{ flexShrink: 1 }}>
                {!item.builtIn ? (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      setEditingName(item.name)
                    }}
                  >
                    <ThemedText
                      style={[styles.text, { color: '#0969da' }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {index + 1}. <ThemedIcon name="create-outline" size={18} color="#0969da" />{' '}
                      {item.title}
                    </ThemedText>
                  </TouchableOpacity>
                ) : (
                  <ThemedText style={styles.text}>
                    {index + 1}. {item.title}
                  </ThemedText>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity onPressIn={drag} hitSlop={10}>
                  <ThemedIcon name="menu-outline" size={24} style={styles.arrow} />
                </TouchableOpacity>
                <Switch
                  trackColor={{ false: '#767577', true: '#34C759' }}
                  thumbColor={item.show ? '#fff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  value={item.show}
                  onValueChange={() => {
                    const list = [...get$tabsList()]
                    const currentIndex = list.findIndex(v => v.name === item.name)
                    const toShow = !list[currentIndex].show
                    if (!toShow) {
                      const showedCount = list.filter(v => v.show).length
                      if (showedCount === 1) {
                        ToastAndroid.show('不支持关闭全部', ToastAndroid.SHORT)
                        return
                      }
                    }
                    if (toShow) {
                      if (!list[currentIndex].builtIn && !list[currentIndex].url) {
                        ToastAndroid.show('请先点击名称编辑', ToastAndroid.SHORT)
                        return
                      }
                    }

                    const newItem = {
                      ...list[currentIndex],
                      show: toShow,
                    }
                    list[currentIndex] = newItem
                    set$tabsList(list)
                  }}
                />
              </View>
            </View>
          )
        }}
        keyExtractor={item => item.name}
        onDragEnd={({ data }) => set$tabsList(data)}
      />
      <EditingModal
        name={editingName}
        isAdding={isAdding}
        visible={!!editingName || isAdding}
        closeModal={() => {
          setEditingName('')
          setIsAdding(false)
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
    fontSize: 17,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
