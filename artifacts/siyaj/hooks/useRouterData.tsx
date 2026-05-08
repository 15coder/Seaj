import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  sendBlockedDeviceNotification,
  updateDeviceCountNotification,
} from "./useNotifications";

export interface Device {
  id: string;
  name: string;
  mac: string;
  ip: string;
  type: "phone" | "laptop" | "tablet" | "tv" | "other";
  blocked: boolean;
  speedLimit: number | null;
  lastSeen: string;
  signalStrength: number;
  isNew?: boolean;
}

export interface NetworkSettings {
  ssid: string;
  password: string;
  band: "2.4GHz" | "5GHz" | "both";
  securityType: "WPA2" | "WPA3";
}

export interface ParentalSchedule {
  id: string;
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: number[];
}

export interface RouterData {
  downloadSpeed: number;
  uploadSpeed: number;
  devices: Device[];
  networkSettings: NetworkSettings;
  parentalSchedules: ParentalSchedule[];
  routerStatus: "online" | "offline";
  signalRooms: { name: string; strength: number }[];
  uptime: string;
  blockNewDevices: boolean;
}

interface RouterContextType {
  data: RouterData;
  toggleBlock: (id: string) => void;
  setSpeedLimit: (id: string, limit: number | null) => void;
  updateNetwork: (settings: Partial<NetworkSettings>) => void;
  addSchedule: (schedule: ParentalSchedule) => void;
  toggleSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;
  refreshSpeeds: () => void;
  toggleBlockNewDevices: () => void;
  simulateNewDevice: () => void;
}

const RANDOM_DEVICES = [
  { name: "Samsung Galaxy S24", type: "phone" as const, mac: "F1:A2:B3:C4:D5:E6" },
  { name: "MacBook Pro", type: "laptop" as const, mac: "A1:F2:C3:D4:E5:B6" },
  { name: "Xbox Series X", type: "tv" as const, mac: "B2:C3:F4:A5:D6:E1" },
  { name: "iPad Air", type: "tablet" as const, mac: "C3:D4:E5:F6:A1:B2" },
  { name: "جهاز مجهول", type: "other" as const, mac: "D4:E5:F6:A1:B2:C3" },
];

let deviceCounter = 10;

const defaultDevices: Device[] = [
  { id: "1", name: "iPhone نداء", mac: "A1:B2:C3:D4:E5:F6", ip: "192.168.1.2", type: "phone", blocked: false, speedLimit: null, lastSeen: "الآن", signalStrength: 95 },
  { id: "2", name: "Laptop Dell", mac: "B2:C3:D4:E5:F6:A1", ip: "192.168.1.3", type: "laptop", blocked: false, speedLimit: null, lastSeen: "الآن", signalStrength: 82 },
  { id: "3", name: "iPad Pro", mac: "C3:D4:E5:F6:A1:B2", ip: "192.168.1.4", type: "tablet", blocked: false, speedLimit: 5, lastSeen: "منذ 2 د", signalStrength: 74 },
  { id: "4", name: "Samsung TV", mac: "D4:E5:F6:A1:B2:C3", ip: "192.168.1.5", type: "tv", blocked: false, speedLimit: null, lastSeen: "الآن", signalStrength: 60 },
  { id: "5", name: "جهاز مجهول", mac: "E5:F6:A1:B2:C3:D4", ip: "192.168.1.6", type: "other", blocked: true, speedLimit: null, lastSeen: "منذ 5 د", signalStrength: 45 },
];

const defaultData: RouterData = {
  downloadSpeed: 87,
  uploadSpeed: 24,
  devices: defaultDevices,
  networkSettings: {
    ssid: "Siyaj_Network",
    password: "securepass2024",
    band: "both",
    securityType: "WPA3",
  },
  parentalSchedules: [
    { id: "1", label: "وقت النوم", enabled: true, startTime: "22:00", endTime: "07:00", days: [0, 1, 2, 3, 4, 5, 6] },
    { id: "2", label: "وقت المدرسة", enabled: false, startTime: "08:00", endTime: "14:00", days: [1, 2, 3, 4, 5] },
  ],
  routerStatus: "online",
  signalRooms: [
    { name: "غرفة المعيشة", strength: 95 },
    { name: "غرفة النوم", strength: 78 },
    { name: "المطبخ", strength: 62 },
    { name: "الحمام", strength: 45 },
    { name: "الحديقة", strength: 30 },
  ],
  uptime: "3 أيام 14 ساعة",
  blockNewDevices: false,
};

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RouterData>(defaultData);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("routerData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setData((prev) => ({
            ...prev,
            devices: parsed.devices ?? prev.devices,
            networkSettings: parsed.networkSettings ?? prev.networkSettings,
            parentalSchedules: parsed.parentalSchedules ?? prev.parentalSchedules,
            blockNewDevices: parsed.blockNewDevices ?? prev.blockNewDevices,
          }));
        }
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const active = data.devices.filter((d) => !d.blocked).length;
    const blocked = data.devices.filter((d) => d.blocked).length;
    updateDeviceCountNotification(active, blocked);
  }, [data.devices]);

  const save = async (updated: RouterData) => {
    try {
      await AsyncStorage.setItem(
        "routerData",
        JSON.stringify({
          devices: updated.devices,
          networkSettings: updated.networkSettings,
          parentalSchedules: updated.parentalSchedules,
          blockNewDevices: updated.blockNewDevices,
        })
      );
    } catch {}
  };

  const toggleBlock = useCallback((id: string) => {
    setData((prev) => {
      const updated = {
        ...prev,
        devices: prev.devices.map((d) =>
          d.id === id ? { ...d, blocked: !d.blocked } : d
        ),
      };
      save(updated);
      return updated;
    });
  }, []);

  const setSpeedLimit = useCallback((id: string, limit: number | null) => {
    setData((prev) => {
      const updated = {
        ...prev,
        devices: prev.devices.map((d) =>
          d.id === id ? { ...d, speedLimit: limit } : d
        ),
      };
      save(updated);
      return updated;
    });
  }, []);

  const updateNetwork = useCallback((settings: Partial<NetworkSettings>) => {
    setData((prev) => {
      const updated = {
        ...prev,
        networkSettings: { ...prev.networkSettings, ...settings },
      };
      save(updated);
      return updated;
    });
  }, []);

  const addSchedule = useCallback((schedule: ParentalSchedule) => {
    setData((prev) => {
      const updated = {
        ...prev,
        parentalSchedules: [...prev.parentalSchedules, schedule],
      };
      save(updated);
      return updated;
    });
  }, []);

  const toggleSchedule = useCallback((id: string) => {
    setData((prev) => {
      const updated = {
        ...prev,
        parentalSchedules: prev.parentalSchedules.map((s) =>
          s.id === id ? { ...s, enabled: !s.enabled } : s
        ),
      };
      save(updated);
      return updated;
    });
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setData((prev) => {
      const updated = {
        ...prev,
        parentalSchedules: prev.parentalSchedules.filter((s) => s.id !== id),
      };
      save(updated);
      return updated;
    });
  }, []);

  const refreshSpeeds = useCallback(() => {
    setData((prev) => ({
      ...prev,
      downloadSpeed: Math.floor(70 + Math.random() * 50),
      uploadSpeed: Math.floor(15 + Math.random() * 30),
    }));
  }, []);

  const toggleBlockNewDevices = useCallback(() => {
    setData((prev) => {
      const updated = { ...prev, blockNewDevices: !prev.blockNewDevices };
      save(updated);
      return updated;
    });
  }, []);

  const simulateNewDevice = useCallback(() => {
    setData((prev) => {
      deviceCounter++;
      const template = RANDOM_DEVICES[deviceCounter % RANDOM_DEVICES.length];
      const shouldBlock = prev.blockNewDevices;
      const newDevice: Device = {
        id: deviceCounter.toString(),
        name: template.name,
        mac: template.mac,
        ip: `192.168.1.${deviceCounter}`,
        type: template.type,
        blocked: shouldBlock,
        speedLimit: null,
        lastSeen: "الآن",
        signalStrength: Math.floor(40 + Math.random() * 55),
        isNew: true,
      };
      if (shouldBlock) {
        sendBlockedDeviceNotification(newDevice.name);
      }
      const updated = {
        ...prev,
        devices: [newDevice, ...prev.devices],
      };
      save(updated);
      return updated;
    });
  }, []);

  return (
    <RouterContext.Provider
      value={{
        data,
        toggleBlock,
        setSpeedLimit,
        updateNetwork,
        addSchedule,
        toggleSchedule,
        deleteSchedule,
        refreshSpeeds,
        toggleBlockNewDevices,
        simulateNewDevice,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouterData() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouterData must be used inside RouterProvider");
  return ctx;
}
