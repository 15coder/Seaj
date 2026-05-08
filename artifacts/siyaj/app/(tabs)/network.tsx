import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useRouterData } from "@/hooks/useRouterData";

export default function NetworkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, updateNetwork } = useRouterData();
  const { networkSettings } = data;

  const [ssid, setSsid] = useState(networkSettings.ssid);
  const [password, setPassword] = useState(networkSettings.password);
  const [showPassword, setShowPassword] = useState(false);
  const [band, setBand] = useState(networkSettings.band);
  const [security, setSecurity] = useState(networkSettings.securityType);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSsid(networkSettings.ssid);
    setPassword(networkSettings.password);
    setBand(networkSettings.band);
    setSecurity(networkSettings.securityType);
  }, []);

  const handleSave = () => {
    if (!ssid.trim()) {
      Alert.alert("خطأ", "اسم الشبكة لا يمكن أن يكون فارغاً");
      return;
    }
    if (password.length < 8) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateNetwork({ ssid, password, band, securityType: security });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          إعدادات الشبكة
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="wifi" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              معلومات الشبكة
            </Text>
          </View>

          <Label colors={colors} text="اسم الشبكة (SSID)" />
          <TextInput
            style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
            value={ssid}
            onChangeText={setSsid}
            placeholder="اسم الشبكة"
            placeholderTextColor={colors.mutedForeground}
            textAlign="right"
            autoCapitalize="none"
          />

          <Label colors={colors} text="كلمة المرور" />
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              textAlign="right"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.eyeBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="radio" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              نطاق التردد
            </Text>
          </View>
          <View style={styles.optionRow}>
            {(["2.4GHz", "5GHz", "both"] as const).map((b) => {
              const labels = { "2.4GHz": "2.4 GHz", "5GHz": "5 GHz", both: "الاثنان" };
              return (
                <TouchableOpacity
                  key={b}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: band === b ? colors.primary : colors.secondary,
                      borderColor: band === b ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setBand(b)}
                >
                  <Text style={[styles.optionText, { color: band === b ? colors.primaryForeground : colors.mutedForeground }]}>
                    {labels[b]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="shield" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              نوع التشفير
            </Text>
          </View>
          <View style={styles.optionRow}>
            {(["WPA2", "WPA3"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: security === s ? colors.primary : colors.secondary,
                    borderColor: security === s ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSecurity(s)}
              >
                <Text style={[styles.optionText, { color: security === s ? colors.primaryForeground : colors.mutedForeground }]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saved ? colors.success : colors.primary }]}
          onPress={handleSave}
        >
          <Feather
            name={saved ? "check" : "save"}
            size={18}
            color={colors.primaryForeground}
          />
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            {saved ? "تم الحفظ!" : "حفظ الإعدادات"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Label({ colors, text }: { colors: ReturnType<typeof useColors>; text: string }) {
  return (
    <Text style={[styles.label, { color: colors.mutedForeground }]}>{text}</Text>
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
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    flexDirection: "row-reverse",
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  passwordRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
