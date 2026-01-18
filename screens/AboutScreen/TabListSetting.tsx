import React from "react";
import { StyleSheet, Switch, ToastAndroid, TouchableOpacity, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import ThemedIcon from "@/components/ThemedIcon";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useStore } from "@/store";

import { EditingModal } from "./EditingModal";
import { SortingModal } from "./SortingModal";

export default function TabListSetting() {
  const { $tabsList, set$tabsList, get$tabsList } = useStore();

  const [editingName, setEditingName] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [sortingItemName, setSortingItemName] = React.useState<string | null>(null);

  const handleSortConfirm = (newOrder: number) => {
    if (!sortingItemName) {
      return;
    }
    const list = [...$tabsList];
    const oldIndex = list.findIndex((v) => v.name === sortingItemName);
    if (oldIndex === -1) {
      return;
    }

    const newIndex = newOrder - 1;
    if (newIndex === oldIndex) {
      return;
    }

    const [removed] = list.splice(oldIndex, 1);
    list.splice(newIndex, 0, removed);
    set$tabsList(list);
  };

  const sortingIndex = React.useMemo(() => {
    return $tabsList.findIndex((v) => v.name === sortingItemName) + 1;
  }, [sortingItemName, $tabsList]);

  return (
    <ThemedView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}># 频道列表：</ThemedText>
        <ThemedButton
          title="添加"
          onPress={() => {
            setIsAdding(true);
          }}
        />
      </View>
      <View>
        {$tabsList.map((item, index) => {
          return (
            <View
              key={item.name}
              style={[
                styles.item,
                {
                  borderTopWidth: index === 0 ? 1 : 0,
                },
              ]}
            >
              <View style={{ flexShrink: 1 }}>
                {!item.builtIn ? (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      setEditingName(item.name);
                    }}
                  >
                    <ThemedText
                      style={[styles.text, { color: "#0969da" }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {index + 1}. <ThemedIcon name="create-outline" size={18} color="#0969da" />{" "}
                      {item.title}
                    </ThemedText>
                  </TouchableOpacity>
                ) : (
                  <ThemedText style={styles.text}>
                    {index + 1}. {item.title}
                  </ThemedText>
                )}
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <TouchableOpacity onPress={() => setSortingItemName(item.name)} hitSlop={10}>
                  <ThemedIcon name="swap-vertical-outline" size={24} style={styles.arrow} />
                </TouchableOpacity>
                <Switch
                  trackColor={{ false: "#767577", true: "#34C759" }}
                  thumbColor={item.show ? "#fff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  value={item.show}
                  onValueChange={() => {
                    const list = [...get$tabsList()];
                    const currentIndex = list.findIndex((v) => v.name === item.name);
                    const toShow = !list[currentIndex].show;
                    if (!toShow) {
                      const showedCount = list.filter((v) => v.show).length;
                      if (showedCount === 1) {
                        ToastAndroid.show("不支持关闭全部", ToastAndroid.SHORT);
                        return;
                      }
                    }
                    if (toShow) {
                      if (!list[currentIndex].builtIn && !list[currentIndex].url) {
                        ToastAndroid.show("请先点击名称编辑", ToastAndroid.SHORT);
                        return;
                      }
                    }

                    const newItem = {
                      ...list[currentIndex],
                      show: toShow,
                    };
                    list[currentIndex] = newItem;
                    set$tabsList(list);
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <EditingModal
        name={editingName}
        isAdding={isAdding}
        visible={!!editingName || isAdding}
        closeModal={() => {
          setEditingName("");
          setIsAdding(false);
        }}
      />
      <SortingModal
        visible={!!sortingItemName}
        currentOrder={sortingIndex}
        maxOrder={$tabsList.length}
        closeModal={() => setSortingItemName(null)}
        onConfirm={handleSortConfirm}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e2e2",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderTopColor: "#e2e2e2",
    height: 50,
  },
  text: {
    textAlign: "left",
    fontSize: 17,
  },
  arrow: {
    fontSize: 24,
    width: 30,
    height: 30,
    lineHeight: 32,
    opacity: 0.6,
    textAlign: "center",
  },
});
