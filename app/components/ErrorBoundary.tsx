import * as Updates from 'expo-updates'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface State {
  error: Error | null
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  handleRestart = () => {
    Updates.reloadAsync()
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }
    const { error } = this.state
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>:(</Text>
        <Text style={styles.title}>应用出错了</Text>
        <Text style={styles.apology}>非常抱歉，应用遇到了一个未知错误。</Text>
        <ScrollView style={styles.errorBox}>
          <Text style={styles.errorText} selectable>
            {error.message}
            {error.stack ? '\n\n' + error.stack : ''}
          </Text>
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={this.handleRestart} activeOpacity={0.7}>
          <Text style={styles.buttonText}>重启应用</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
    color: '#999',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  apology: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 12,
    color: '#c00',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
