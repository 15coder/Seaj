import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useRouterData } from "@/hooks/useRouterData";

function SignalBar({
  name,
  strength,
  colors,
}: {
  name: string;
  strength: number;
  colors: ReturnType<typeof useColors>;
}) {
  const color =
    strength >= 75
      ? colors.success
      : strength >= 50
      ? colors.warning
      : colors.destructive;

  const label =
    strength >= 75
      ? "ممتازة"
      : strength >= 50
      ? "جيدة"
      : "ضعيفة";

  return (
    <View
      style={[
        styles.barCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.barTop}>
        <View style={[styles.strengthBadge, { backgroundColor: color + "22" }]}>
          <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
        </View>
        <View style={styles.barNameRow}>
          <Text style={[styles.barPercent, { color }]}>{strength}%</Text>
          <Text style={[styles.barName, { color: colors.foreground }]}>{name}</Text>
          <Feather name="home" size={14} color={colors.mutedForeground} />
        </View>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.barFill,
            { width: `${strength}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function HeatmapView({ colors }: { colors: ReturnType<typeof useColors> }) {
  const size = 220;
  return (
    <View style={[styles.heatmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.heatmapTitle, { color: colors.foreground }]}>
        خريطة التغطية
      </Text>
      <View style={styles.heatmapSvgContainer}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="h1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
              <Stop offset="40%" stopColor={colors.primary} stopOpacity="0.4" />
              <Stop offset="70%" stopColor={colors.warning} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={colors.destructive} stopOpacity="0.15" />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#h1)`} />
          <Circle cx={size / 2} cy={size / 2} r={size / 2 * 0.65} fill={colors.primary} fillOpacity={0.15} />
          <Circle cx={size / 2} cy={size / 2} r={size / 2 * 0.35} fill={colors.primary} fillOpacity={0.25} />
          <Circle cx={size / 2} cy={size / 2} r={10} fill={colors.primary} />
        </Svg>
      </View>
      <View style={styles.legend}>
        {[
          { color: colors.primary, label: "قوية جداً" },
          { color: colors.warning, label: "متوسطة" },
          { color: colors.destructive, label: "ضعيفة" },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SignalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data } = useRouterData();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const avgStrength = Math.round(
    data.signalRooms.reduce((s, r) => s + r.strength, 0) / data.signalRooms.length
  );

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
        <Text style={[styles.title, { color: colors.foreground }]}>
          تحليل الإشارة
        </Text>

        <View style={[styles.avgCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avgCircle, { borderColor: colors.primary }]}>
            <Text style={[styles.avgValue, { color: colors.primary }]}>{avgStrength}%</Text>
            <Text style={[styles.avgLabel, { color: colors.mutedForeground }]}>متوسط</Text>
          </View>
          <View style={styles.avgInfo}>
            <Text style={[styles.avgTitle, { color: colors.foreground }]}>
              قوة الإشارة العامة
            </Text>
            <Text style={[styles.avgSub, { color: colors.mutedForeground }]}>
              عبر {data.signalRooms.length} مناطق في المنزل
            </Text>
            <View style={[styles.avgBadge, { backgroundColor: avgStrength >= 70 ? colors.success + "22" : colors.warning + "22" }]}>
              <Text style={[styles.avgBadgeText, { color: avgStrength >= 70 ? colors.success : colors.warning }]}>
                {avgStrength >= 70 ? "تغطية ممتازة" : "تغطية متوسطة"}
              </Text>
            </View>
          </View>
        </View>

        <HeatmapView colors={colors} />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          التفصيل حسب الغرفة
        </Text>

        {data.signalRooms.map((room) => (
          <SignalBar
            key={room.name}
            name={room.name}
            strength={room.strength}
            colors={colors}
          />
        ))}

        <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tipsHeader}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.foreground }]}>
              نصائح لتحسين التغطية
            </Text>
          </View>
          {[
            "ضع الراوتر في مكان مرتفع ومركزي",
            "ابعد الراوتر عن المعادن والأجهزة الكهربائية",
            "استخدم مكرر الإشارة في المناطق البعيدة",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 20,
  },
  avgCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: "row-reverse",
  },
  avgCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avgValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  avgLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  avgInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  avgTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  avgSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  avgBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  avgBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  heatmapCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: "center",
  },
  heatmapTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  heatmapSvgContainer: {
    marginBottom: 12,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
    marginBottom: 12,
  },
  barCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  barTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  barNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  barPercent: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  strengthLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexDirection: "row-reverse",
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
    flexDirection: "row-reverse",
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
});
