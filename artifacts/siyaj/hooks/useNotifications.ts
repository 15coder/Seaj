import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DEVICE_COUNT_ID = "siyaj-device-count";

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("siyaj-persistent", {
    name: "حالة الأجهزة",
    importance: Notifications.AndroidImportance.LOW,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: false,
    enableVibrate: false,
    sound: null,
  });
  await Notifications.setNotificationChannelAsync("siyaj-alerts", {
    name: "تنبيهات الأمان",
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
    enableVibrate: true,
  });
}

export async function sendBlockedDeviceNotification(deviceName: string) {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🚫 تم حظر جهاز جديد",
      body: `تم حظر "${deviceName}" تلقائياً`,
      data: { type: "block" },
      sound: true,
      ...(Platform.OS === "android" && { channelId: "siyaj-alerts" }),
    },
    trigger: null,
  });
}

export async function updateDeviceCountNotification(
  activeCount: number,
  blockedCount: number
) {
  if (Platform.OS === "web") return;
  try {
    await Notifications.dismissNotificationAsync(DEVICE_COUNT_ID);
  } catch {}
  await Notifications.scheduleNotificationAsync({
    identifier: DEVICE_COUNT_ID,
    content: {
      title: "سياج — مراقبة الشبكة",
      body: `${activeCount} جهاز متصل · ${blockedCount} محجوب`,
      data: { type: "status" },
      sticky: true,
      sound: false,
      ...(Platform.OS === "android" && {
        channelId: "siyaj-persistent",
      }),
    },
    trigger: null,
  });
}

export async function dismissDeviceCountNotification() {
  try {
    await Notifications.dismissNotificationAsync(DEVICE_COUNT_ID);
  } catch {}
}
