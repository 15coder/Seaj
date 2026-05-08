import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { ParentalSchedule, useRouterData } from "@/hooks/useRouterData";

const DAY_NAMES = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function ParentalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, addSchedule, toggleSchedule, deleteSchedule } = useRouterData();

  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newStart, setNewStart] = useState("22:00");
  const [newEnd, setNewEnd] = useState("07:00");
  const [newDays, setNewDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleAdd = () => {
    if (!newLabel.trim()) {
      Alert.alert("خطأ", "أدخل اسماً للجدول");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addSchedule({
      id: Date.now().toString(),
      label: newLabel.trim(),
      enabled: true,
      startTime: newStart,
      endTime: newEnd,
      days: newDays,
    });
    setNewLabel("");
    setNewStart("22:00");
    setNewEnd("07:00");
    setNewDays([0, 1, 2, 3, 4, 5, 6]);
    setShowAdd(false);
  };

  const toggleDay = (day: number) => {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

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
          <Text style={[styles.title, { color: colors.foreground }]}>
            الرقابة الأبوية
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAdd(true)}
          >
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.primary + "44" }]}>
          <Feather name="shield" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            جدولة أوقات إيقاف الإنترنت تلقائياً لحماية أطفالك
          </Text>
        </View>

        {data.parentalSchedules.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="clock" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              لا توجد جداول
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              اضغط + لإضافة جدول
            </Text>
          </View>
        ) : (
          data.parentalSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              colors={colors}
              onToggle={() => toggleSchedule(schedule.id)}
              onDelete={() => {
                Alert.alert("حذف", `حذف "${schedule.label}"؟`, [
                  { text: "إلغاء", style: "cancel" },
                  {
                    text: "حذف",
                    style: "destructive",
                    onPress: () => deleteSchedule(schedule.id),
                  },
                ]);
              }}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowAdd(false)}>
          <Pressable
            style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              جدول جديد
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              الاسم
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
              placeholder="مثال: وقت النوم"
              placeholderTextColor={colors.mutedForeground}
              value={newLabel}
              onChangeText={setNewLabel}
              textAlign="right"
            />

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                  من
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  value={newStart}
                  onChangeText={setNewStart}
                  textAlign="center"
                  placeholder="22:00"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                  إلى
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  value={newEnd}
                  onChangeText={setNewEnd}
                  textAlign="center"
                  placeholder="07:00"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              الأيام
            </Text>
            <View style={styles.daysRow}>
              {DAY_NAMES.map((name, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayBtn,
                    {
                      backgroundColor: newDays.includes(i)
                        ? colors.primary
                        : colors.secondary,
                    },
                  ]}
                  onPress={() => toggleDay(i)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: newDays.includes(i)
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {name[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.secondary }]}
                onPress={() => setShowAdd(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>
                  إلغاء
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleAdd}
              >
                <Text style={[styles.modalBtnText, { color: colors.primaryForeground }]}>
                  إضافة
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ScheduleCard({
  schedule,
  colors,
  onToggle,
  onDelete,
}: {
  schedule: ParentalSchedule;
  colors: ReturnType<typeof useColors>;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const activeDays = schedule.days.map((d) => DAY_NAMES[d][0]).join(" ");

  return (
    <View
      style={[
        styles.scheduleCard,
        {
          backgroundColor: colors.card,
          borderColor: schedule.enabled
            ? colors.primary + "44"
            : colors.border,
        },
      ]}
    >
      <View style={styles.scheduleTop}>
        <View style={styles.scheduleLeft}>
          <Switch
            value={schedule.enabled}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary + "88" }}
            thumbColor={schedule.enabled ? colors.primary : colors.mutedForeground}
          />
          <TouchableOpacity onPress={onDelete}>
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
        <View style={styles.scheduleRight}>
          <Text style={[styles.scheduleLabel, { color: colors.foreground }]}>
            {schedule.label}
          </Text>
          <Text style={[styles.scheduleTime, { color: colors.primary }]}>
            {schedule.startTime} — {schedule.endTime}
          </Text>
        </View>
      </View>
      <Text style={[styles.scheduleDays, { color: colors.mutedForeground }]}>
        الأيام: {activeDays}
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
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
    flexDirection: "row-reverse",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptySub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  scheduleCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  scheduleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scheduleRight: {
    alignItems: "flex-end",
  },
  scheduleLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  scheduleTime: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  scheduleDays: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  modalBtns: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
