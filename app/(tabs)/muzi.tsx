import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import { Button, Text, TextInput, View } from 'react-native'

import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'
import { useColorScheme } from '@/hooks/useColorScheme'
import { SimpleCrypto } from '@/utils'

const ch = new SimpleCrypto(process.env.EXPO_PUBLIC_LI_URL_ENC_KEY!)

export default function Li() {
  const [showValue, setShowValue] = React.useState('-1')
  const [text, setText] = React.useState('')
  const colorScheme = useColorScheme()
  React.useEffect(() => {
    AsyncStorage.getItem('__LI_SHOW').then(r => {
      if (r === '1') {
        setShowValue('1')
      } else {
        setShowValue('0')
      }
    })
  }, [])
  if (showValue === '-1') {
    return <Text style={{ fontSize: 18, padding: 20 }}>loading...</Text>
  }

  if (showValue === '0') {
    const color = colorScheme === 'dark' ? 'white' : 'black'
    return (
      <View style={{ flexDirection: 'column', marginTop: 100, padding: 20, gap: 20 }}>
        <TextInput
          style={{
            height: 40,
            borderWidth: 1,
            padding: 10,
            borderColor: color,
            color: color,
          }}
          placeholderTextColor={'#555'}
          onChangeText={setText}
          autoFocus
          placeholder="input text"
          value={text}
        />
        <Button
          title="ok"
          onPress={() => {
            const bingo = text === process.env.EXPO_PUBLIC_LI_SHOW_KEY
            AsyncStorage.setItem('__LI_SHOW', bingo ? '1' : '0').then(() => {
              if (bingo) {
                setShowValue('1')
              }
            })
          }}
        ></Button>
      </View>
    )
  }

  return (
    <WebView
      name={TabsName.muzi}
      css={`
        .tgme_widget_message_bubble {
          margin: 0;
          margin-left: 5px;
          border-radius: 10px;
        }
        .tgme_widget_message_user_photo {
          display: none;
        }
        .tgme_widget_message_bubble_tail {
          display: none;
        }
        .tgme_widget_message_inline_keyboard {
          display: none;
        }
      `}
      url={ch.decrypt(process.env.EXPO_PUBLIC_LI_URL_MI_TEXT!)}
    />
  )
}
