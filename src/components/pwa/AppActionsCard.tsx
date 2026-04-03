"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Download,
  Info,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatReminderTime,
  getSupplementReminderSlots,
} from "@/lib/supplementReminders";
import type { Supplement } from "@/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface AppActionsCardProps {
  dateKey: string;
  isFastingDay: boolean;
  notificationsEnabled: boolean;
  supplements: Supplement[];
  onNotificationSettingChange: (enabled: boolean) => Promise<void> | void;
}

type NotificationState = NotificationPermission | "unsupported";

async function showReminderNotification(
  title: string,
  body: string,
  tag: string,
) {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: "/planner" },
    });
    return;
  }

  new Notification(title, {
    body,
    tag,
    icon: "/icon-192.png",
  });
}

export default function AppActionsCard({
  dateKey,
  isFastingDay,
  notificationsEnabled,
  supplements,
  onNotificationSettingChange,
}: AppActionsCardProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [standaloneMode, setStandaloneMode] = useState(false);
  const [serviceWorkerAktif, setServiceWorkerAktif] = useState(false);
  const [promptInstallTersedia, setPromptInstallTersedia] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [notificationState, setNotificationState] =
    useState<NotificationState>("unsupported");
  const [nextReminderLabel, setNextReminderLabel] = useState<string | null>(
    null,
  );

  const reminderSlots = useMemo(
    () => getSupplementReminderSlots(dateKey, supplements, isFastingDay),
    [dateKey, supplements, isFastingDay],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsInstalled(standalone);
    setStandaloneMode(standalone);

    setPromptInstallTersedia(false);

    if (navigator.serviceWorker) {
      if (navigator.serviceWorker.controller) {
        setServiceWorkerAktif(true);
      }

      navigator.serviceWorker.ready
        .then(() => {
          setServiceWorkerAktif(true);
          console.log("[PWA] Service worker ready");
        })
        .catch((error) => {
          console.error("[PWA] Service worker ready error:", error);
          setServiceWorkerAktif(false);
        });
    } else {
      setServiceWorkerAktif(false);
      console.warn("[PWA] serviceWorker is not available in this browser");
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const deferredEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(deferredEvent);
      setPromptInstallTersedia(true);
      console.log("[PWA] beforeinstallprompt available");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setStandaloneMode(true);
      setDeferredPrompt(null);
      setPromptInstallTersedia(false);
      setShowInstallHelp(false);
      console.log("[PWA] appinstalled event fired");
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setNotificationState("unsupported");
      return;
    }

    setNotificationState(Notification.permission);
  }, []);

  useEffect(() => {
    const now = Date.now();
    const nextReminder = reminderSlots.find(
      (slot) => slot.scheduledAt.getTime() > now,
    );

    setNextReminderLabel(
      nextReminder
        ? `${formatReminderTime(nextReminder.remindAt)} • ${nextReminder.items.join(", ")}`
        : null,
    );
  }, [reminderSlots]);

  useEffect(() => {
    if (!notificationsEnabled || notificationState !== "granted") return;
    if (typeof window === "undefined") return;

    const fireDueReminders = async () => {
      const now = Date.now();
      const nextReminder = reminderSlots.find(
        (slot) => slot.scheduledAt.getTime() > now,
      );

      setNextReminderLabel(
        nextReminder
          ? `${formatReminderTime(nextReminder.remindAt)} • ${nextReminder.items.join(", ")}`
          : null,
      );

      for (const slot of reminderSlots) {
        const storageKey = `supplement_reminder_${slot.id}`;
        if (localStorage.getItem(storageKey)) continue;

        const remindAt = slot.remindAt.getTime();
        const scheduledAt = slot.scheduledAt.getTime();

        if (now >= remindAt && now < scheduledAt) {
          await showReminderNotification(slot.title, slot.body, slot.id);
          localStorage.setItem(storageKey, String(now));
        }
      }
    };

    void fireDueReminders();
    const intervalId = window.setInterval(() => {
      void fireDueReminders();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void fireDueReminders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [notificationsEnabled, notificationState, reminderSlots]);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (!deferredPrompt) {
      setShowInstallHelp((current) => !current);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallHelp(false);
    }
  };

  const handleNotificationClick = async () => {
    if (notificationState === "unsupported") return;

    if (notificationsEnabled) {
      await onNotificationSettingChange(false);
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(permission);

    if (permission === "granted") {
      await onNotificationSettingChange(true);
      return;
    }

    await onNotificationSettingChange(false);
  };

  const installButtonLabel = isInstalled
    ? "Aplikasi Terpasang"
    : promptInstallTersedia
      ? "Install App"
      : "Tambahkan ke Home Screen";

  const installButtonDescription = isInstalled
    ? "PWA sudah aktif. Buka dari home screen untuk pengalaman seperti aplikasi."
    : promptInstallTersedia
      ? "Gunakan prompt install browser jika tersedia."
      : "Prompt install tidak tersedia; gunakan menu browser (Add to Home screen) untuk install manual.";

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Smartphone size={15} className="text-jade-400" />
        <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
          App & Reminder
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          onClick={handleInstallClick}
          className={cn(
            "rounded-2xl border px-4 py-3 text-left transition-all",
            isInstalled
              ? "bg-jade-950/40 border-jade-800/50"
              : "bg-night-800/50 border-night-700/50 hover:border-jade-700/50",
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            {isInstalled ? (
              <CheckCircle2 size={16} className="text-jade-400" />
            ) : (
              <Download size={16} className="text-jade-400" />
            )}
            <span className="text-sm font-display font-semibold text-gray-200">
              {installButtonLabel}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {installButtonDescription}
          </p>
        </button>

        <button
          onClick={handleNotificationClick}
          disabled={notificationState === "unsupported"}
          className={cn(
            "rounded-2xl border px-4 py-3 text-left transition-all disabled:opacity-60",
            notificationsEnabled
              ? "bg-indigo-950/40 border-indigo-800/50"
              : "bg-night-800/50 border-night-700/50 hover:border-indigo-700/50",
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            {notificationsEnabled ? (
              <Bell size={16} className="text-indigo-300" />
            ) : (
              <BellOff size={16} className="text-indigo-300" />
            )}
            <span className="text-sm font-display font-semibold text-gray-200">
              {notificationsEnabled ? "Reminder Aktif" : "Aktifkan Reminder"}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {notificationState === "unsupported"
              ? "Browser ini tidak mendukung Notification API."
              : notificationsEnabled
                ? nextReminderLabel
                  ? `Reminder berikutnya: ${nextReminderLabel}`
                  : "Tidak ada reminder tersisa untuk hari ini."
                : "Notifikasi akan muncul 5 menit sebelum jadwal suplemen."}
          </p>
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-night-700/50 bg-night-900/60 p-3 text-xs text-gray-400">
        <p className="font-semibold text-gray-200 text-[11px]">
          Status PWA (diagnostik):
        </p>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>SW aktif: {serviceWorkerAktif ? "Ya" : "Tidak"}</li>
          <li>
            Prompt install tersedia: {promptInstallTersedia ? "Ya" : "Tidak"}
          </li>
          <li>Mode standalone: {standaloneMode ? "Ya" : "Tidak"}</li>
        </ul>
      </div>

      {showInstallHelp && !isInstalled && (
        <div className="mt-3 rounded-2xl border border-night-700/50 bg-night-900/70 p-3">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-400 leading-relaxed space-y-1">
              <p>
                Di Android Chrome, tombol install tidak selalu muncul di menu.
                Prompt install biasanya baru aktif setelah service worker
                terbaca dan browser menganggap situs layak di-install.
              </p>
              <p>
                Coba refresh sekali, lalu buka lagi halaman ini. Jika event
                install sudah tersedia, tombol di atas akan berubah menjadi{" "}
                <strong className="text-gray-200">Install App</strong>.
              </p>
              <p>
                Jika tetap belum tersedia, situs masih bisa ditambahkan manual
                ke home screen dari menu browser bila Chrome mengizinkannya.
              </p>
            </div>
          </div>
        </div>
      )}

      {notificationState === "denied" && (
        <div className="mt-3 rounded-2xl border border-red-800/40 bg-red-950/30 p-3 text-xs text-red-300 leading-relaxed">
          Izin notifikasi sedang diblokir. Buka pengaturan site di browser, ubah
          permission notifikasi ke <strong>Allow</strong>, lalu aktifkan
          reminder lagi.
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-600 leading-relaxed">
        Reminder bekerja paling baik saat situs sudah dibuka minimal sekali dan
        idealnya dipasang sebagai app. Untuk notifikasi yang tetap pasti muncul
        saat app benar-benar tertutup lama, nanti perlu push notification
        berbasis server.
      </p>
    </div>
  );
}
