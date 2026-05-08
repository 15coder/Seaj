import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
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
  const { data, toggleBlock, setSpeedLimit, toggleBlockNewDevices, simulateNewDevice } =
    useRouterData();
  const [filter, setFilter] = useState<Filter>("all");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const filtered = data.devices.filter((d) => {
    if (filter === "active") return !d.blocked;
    if (filter === "blocked") return d.blocked;
    return true;
  });

  const activeCount = data.devices.filter((d) => !d.blocked).length;
  const blockedCount = data.devices.filter((d) => d.blocked).length;

  const handleToggleBlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleBlockNewDevices();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>الأجهزة</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {data.devices.length} جهاز
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.blockNewCard,
          {
            backgroundColor: data.blockNewDevices
              ? colors.destructive + "18"
              : colors.card,
            borderColor: data.blockNewDevices
              ? colors.destructive + "66"
              : colors.border,
            marginHorizontal: 20,
          },
        ]}
      >
        <View style={styles.blockNewLeft}>
          <Switch
            value={data.blockNewDevices}
            onValueChange={handleToggleBlock}
            trackColor={{
              false: colors.border,
              true: colors.destructive + "88",
            }}
            thumbColor={
              data.blockNewDevices ? colors.destructive : colors.mutedForeground
            }
          />
        </View>
        <View style={styles.blockNewRight}>
          <View style={styles.blockNewTitleRow}>
            <Feather
              name="shield-off"
              size={15}
              color={
                data.blockNewDevices ? colors.destructive : colors.mutedForeground
              }
            />
            <Text
              style={[
                styles.blockNewTitle,
                {
                  color: data.blockNewDevices
                    ? colors.destructive
                    : colors.foreground,
                },
              ]}
            >
              حظر الأجهزة الجديدة
            </Text>
          </View>
          <Text style={[styles.blockNewSub, { color: colors.mutedForeground }]}>
            {data.blockNewDevices
              ? "أي جهاز جديد سيُحظر تلقائياً مع إشعار"
              : "السماح للأجهزة الجديدة بالاتصال"}
          </Text>
        </View>
      </View>

      <View style={[styles.statsRow, { paddingHorizontal: 20, marginTop: 12 }]}>
        <View style={[styles.statChip, { backgroundColor: colors.primary + "22" }]}>
          <View style={[styles.statDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.statChipText, { color: colors.primary }]}>
            {activeCount} نشط
          </Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: colors.destructive + "22" }]}>
          <View style={[styles.statDot, { backgroundColor: colors.destructive }]} />
          <Text style={[styles.statChipText, { color: colors.destructive }]}>
            {blockedCount} محجوب
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.simulateBtn, { backgroundColor: colors.secondary }]}
          onPress={simulateNewDevice}
        >
          <Feather name="plus-circle" size={13} color={colors.mutedForeground} />
          <Text style={[styles.simulateBtnText, { color: colors.mutedForeground }]}>
            محاكاة جهاز
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.filters, { paddingHorizontal: 20, marginTop: 12 }]}>
        {(["all", "active", "blocked"] as Filter[]).map((f) => {
          const labels = { all: "الكل", active: "نشط", blocked: "محجوب" };
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                { backgroundColor: active ? colors.primary : colors.secondary },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? colors.primaryForeground : colors.mutedForeground },
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
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
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
            <View key={device.id}>
              {device.isNew && (
                <View style={[styles.newBadge, { backgroundColor: device.blocked ? colors.destructive + "22" : colors.primary + "22" }]}>
                  <Feather name="zap" size={11} color={device.blocked ? colors.destructive : colors.primary} />
                  <Text style={[styles.newBadgeText, { color: device.blocked ? colors.destructive : colors.primary }]}>
                    {device.blocked ? "تم حظره تلقائياً" : "جهاز جديد"}
                  </Text>
                </View>
              )}
              <DeviceCard
                device={device}
                onToggleBlock={() => toggleBlock(device.id)}
                onSetSpeedLimit={(limit) => setSpeedLimit(device.id, limit)}
              />
            </View>
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
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  countBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  countText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  blockNewCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
    flexDirection: "row-reverse",
  },
  blockNewLeft: {},
  blockNewRight: { flex: 1, alignItems: "flex-end" },
  blockNewTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
    flexDirection: "row-reverse",
  },
  blockNewTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  blockNewSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  simulateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: "auto",
  },
  simulateBtnText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  filters: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  newBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
