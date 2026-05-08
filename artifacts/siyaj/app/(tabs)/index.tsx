import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpeedGauge } from "@/components/SpeedGauge";
import { useColors } from "@/hooks/useColors";
import { useRouterData } from "@/hooks/useRouterData";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, refreshSpeeds } = useRouterData();

  const activeDevices = data.devices.filter((d) => !d.blocked);
  const blockedDevices = data.devices.filter((d) => d.blocked);

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshSpeeds();
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPadding + 16,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.primary }]}>سياج</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              إدارة الراوتر
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusDot, {
              backgroundColor: data.routerStatus === "online" ? colors.success : colors.destructive
            }]} />
            <Text style={[styles.statusText, { color: data.routerStatus === "online" ? colors.success : colors.destructive }]}>
              {data.routerStatus === "online" ? "متصل" : "غير متصل"}
            </Text>
            <TouchableOpacity
              style={[styles.refreshBtn, { backgroundColor: colors.secondary }]}
              onPress={handleRefresh}
            >
              <Feather name="refresh-cw" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient
          colors={[colors.card, colors.card]}
          style={[styles.speedCard, { borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
            سرعة الإنترنت
          </Text>
          <View style={styles.gaugesRow}>
            <SpeedGauge
              value={data.downloadSpeed}
              maxValue={200}
              label="تحميل"
              unit="Mbps"
              color={colors.primary}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SpeedGauge
              value={data.uploadSpeed}
              maxValue={100}
              label="رفع"
              unit="Mbps"
              color={colors.info}
            />
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatCard
            colors={colors}
            icon="users"
            value={`${activeDevices.length}`}
            label="أجهزة متصلة"
            color={colors.primary}
          />
          <StatCard
            colors={colors}
            icon="slash"
            value={`${blockedDevices.length}`}
            label="محجوبة"
            color={colors.destructive}
          />
          <StatCard
            colors={colors}
            icon="clock"
            value={data.uptime.split(" ")[0]}
            label={data.uptime.split(" ")[1]}
            color={colors.warning}
          />
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              الأجهزة النشطة
            </Text>
            <Feather name="wifi" size={16} color={colors.primary} />
          </View>
          {activeDevices.slice(0, 3).map((device) => (
            <View
              key={device.id}
              style={[styles.deviceRow, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.deviceDot, { backgroundColor: colors.primary + "44" }]}>
                <View style={[styles.deviceDotInner, { backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.deviceName, { color: colors.foreground }]}>
                {device.name}
              </Text>
              <Text style={[styles.deviceIp, { color: colors.mutedForeground }]}>
                {device.ip}
              </Text>
            </View>
          ))}
          {activeDevices.length > 3 && (
            <Text style={[styles.more, { color: colors.mutedForeground }]}>
              +{activeDevices.length - 3} أجهزة أخرى
            </Text>
          )}
        </View>

        <View style={[styles.creditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.creditTitle, { color: colors.mutedForeground }]}>
            المطور
          </Text>
          <Text style={[styles.creditName, { color: colors.primary }]}>
            نداء الرحمن محمد عبّود
          </Text>
          <Text style={[styles.creditContact, { color: colors.mutedForeground }]}>
            @15coder
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  colors,
  icon,
  value,
  label,
  color,
}: {
  colors: ReturnType<typeof useColors>;
  icon: string;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  speedCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginBottom: 16,
  },
  gaugesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 80,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  deviceDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  deviceIp: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  more: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 10,
  },
  creditCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 10,
  },
  creditTitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  creditName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  creditContact: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
