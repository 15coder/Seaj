import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { Device } from "@/hooks/useRouterData";

interface Props {
  device: Device;
  onToggleBlock: () => void;
  onSetSpeedLimit: (limit: number | null) => void;
}

function DeviceIcon({
  type,
  color,
}: {
  type: Device["type"];
  color: string;
}) {
  const icons: Record<Device["type"], string> = {
    phone: "cellphone",
    laptop: "laptop",
    tablet: "tablet",
    tv: "television",
    other: "devices",
  };
  return (
    <MaterialCommunityIcons name={icons[type] as any} size={22} color={color} />
  );
}

export function DeviceCard({ device, onToggleBlock, onSetSpeedLimit }: Props) {
  const colors = useColors();
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [speedInput, setSpeedInput] = useState(
    device.speedLimit?.toString() ?? ""
  );

  const signalColor =
    device.signalStrength > 70
      ? colors.success
      : device.signalStrength > 40
      ? colors.warning
      : colors.destructive;

  const handleBlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleBlock();
  };

  const handleSaveSpeed = () => {
    const val = parseInt(speedInput);
    if (!speedInput || isNaN(val) || val <= 0) {
      onSetSpeedLimit(null);
    } else {
      onSetSpeedLimit(val);
    }
    setShowSpeedModal(false);
  };

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: device.blocked ? colors.destructive + "44" : colors.border,
            opacity: device.blocked ? 0.75 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: device.blocked ? colors.destructive + "22" : colors.primary + "22" },
          ]}
        >
          <DeviceIcon
            type={device.type}
            color={device.blocked ? colors.destructive : colors.primary}
          />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {device.name}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {device.ip} · {device.lastSeen}
          </Text>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: signalColor + "22" }]}>
              <Feather name="wifi" size={10} color={signalColor} />
              <Text style={[styles.tagText, { color: signalColor }]}>
                {device.signalStrength}%
              </Text>
            </View>
            {device.speedLimit && (
              <View style={[styles.tag, { backgroundColor: colors.warning + "22" }]}>
                <Feather name="zap" size={10} color={colors.warning} />
                <Text style={[styles.tagText, { color: colors.warning }]}>
                  {device.speedLimit} Mbps
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.secondary },
            ]}
            onPress={() => setShowSpeedModal(true)}
          >
            <Feather name="sliders" size={14} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: device.blocked
                  ? colors.destructive + "22"
                  : colors.secondary,
              },
            ]}
            onPress={handleBlock}
          >
            <Feather
              name={device.blocked ? "unlock" : "slash"}
              size={14}
              color={device.blocked ? colors.destructive : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showSpeedModal} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setShowSpeedModal(false)}
        >
          <View
            style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              تحديد السرعة
            </Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              {device.name}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="سرعة بـ Mbps (فارغ = بلا حد)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={speedInput}
              onChangeText={setSpeedInput}
              textAlign="right"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.secondary }]}
                onPress={() => setShowSpeedModal(false)}
              >
                <Text style={[styles.btnText, { color: colors.mutedForeground }]}>
                  إلغاء
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={handleSaveSpeed}
              >
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                  حفظ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "right",
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    justifyContent: "flex-end",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  actions: {
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
