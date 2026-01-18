import Ionicons from "@expo/vector-icons/Ionicons";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function ThemedIcon(props: React.ComponentProps<typeof Ionicons>) {
  const colorScheme = useColorScheme();
  return (
    <Ionicons
      {...props}
      color={props.color || (colorScheme === "dark" ? "white" : "black")}
    ></Ionicons>
  );
}
