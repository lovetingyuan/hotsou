import { Image, ImageProps, ImageSource } from "expo-image";
import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";

interface FallbackImageProps extends Omit<ImageProps, "source" | "onError"> {
  source: ImageSource;
  fallbackSource: ImageSource;
  defaultSource?: ImageSource;
  onError?: (error: any) => void;
  onLoadSuccess?: () => void;
}

const FallbackImage: React.FC<FallbackImageProps> = ({
  source,
  fallbackSource,
  defaultSource,
  style,
  onError,
  onLoadSuccess,
  contentFit = "cover",
  ...props
}) => {
  // Use state to trigger re-render on error
  const [isFallback, setIsFallback] = useState(false);

  const handleError = useCallback(
    (event: any) => {
      if (!isFallback) {
        setIsFallback(true);
        onError?.(event);
      }
    },
    [isFallback, onError],
  );

  const handleLoadSuccess = useCallback(() => {
    if (!isFallback) {
      onLoadSuccess?.();
    }
  }, [isFallback, onLoadSuccess]);

  const displaySource = isFallback ? fallbackSource : source;

  return (
    <Image
      {...props}
      source={displaySource}
      placeholder={defaultSource}
      style={[styles.image, style]}
      onError={handleError}
      onLoad={handleLoadSuccess}
      contentFit={contentFit}
      transition={200}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
});

export default FallbackImage;
