import { Linking, Platform, Pressable, ViewStyle } from "react-native";

type Props = {
  href: string;
  style?: ViewStyle;
  onPress?: (event: any) => void;
  children: React.ReactNode;
};

export function ExternalLink({ href, style, onPress, children }: Props) {
  const handlePress = async (event: any) => {
    if (Platform.OS !== "web") {
      await Linking.openURL(href);
    } else {
      window.open(href, "_blank");
    }
    onPress?.(event);
  };

  return (
    <Pressable onPress={handlePress} style={style}>
      {children}
    </Pressable>
  );
}
