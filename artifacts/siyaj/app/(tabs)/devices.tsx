import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DeviceCard } from "@/components/DeviceCard";
import { useColors } from "@/hooks/useColors";
import { useRouterData } from "@/hooks/useRouterData";

type Filter = "all" | "active" | "blocked";

export default function DevicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, toggleBlock, setSpeedLimit } = useRouterData();
  const [filter, setFilter] = useState<Filter>("all");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const filtered = data.devices.filter((d) => {
    if (filter === "active") return !d.blocked;
    if (filter === "blocked") return d.blocked;
    return true;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          الأجهزة
        </Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {data.devices.length} جهاز
          </Text>
        </View>
      </View>

      <View style={[styles.filters, { paddingHorizontal: 20 }]}>
        {(["all", "active", "blocked"] as Filter[]).map((f) => {
          const labels = { all: "الكل", active: "نشط", blocked: "محجوب" };
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: active ? colors.primary : colors.secondary,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: active
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                {labels[f]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              لا توجد أجهزة
            </Text>
          </View>
        ) : (
          filtered.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggleBlock={() => toggleBlock(device.id)}
              onSetSpeedLimit={(limit) => setSpeedLimit(device.id, limit)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
