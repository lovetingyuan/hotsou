import React, { useCallback, useRef } from 'react'
import { Image, ImageProps, ImageSourcePropType, Platform, StyleSheet } from 'react-native'

interface FallbackImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType
  fallbackSource: number
  defaultSource?: number
  onError?: (error: any) => void
  onLoadSuccess?: () => void
}

const FallbackImage: React.FC<FallbackImageProps> = ({
  source,
  fallbackSource,
  defaultSource,
  style,
  onError,
  onLoadSuccess,
  ...props
}) => {
  // 使用useRef来追踪当前是否在显示fallback图片
  const isFallback = useRef(false)
  // 使用useRef来存储原始source
  const originalSource = useRef(source)

  // 只在原始图片加载失败时触发错误处理
  const handleError = useCallback(
    (error: any) => {
      if (!isFallback.current) {
        isFallback.current = true
        onError?.(error)
      }
    },
    [onError]
  )

  // 处理加载成功
  const handleLoadSuccess = useCallback(() => {
    if (!isFallback.current) {
      onLoadSuccess?.()
    }
  }, [onLoadSuccess])

  // 获取当前应该显示的图片源
  const displaySource = isFallback.current ? fallbackSource : originalSource.current

  return (
    <Image
      {...props}
      source={displaySource}
      style={[styles.image, style]}
      onError={handleError}
      onLoad={handleLoadSuccess}
      {...(Platform.OS === 'android' && { fallback: true })}
      defaultSource={defaultSource}
    />
  )
}

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
})

export default FallbackImage
