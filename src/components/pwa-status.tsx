"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, WifiOff } from "lucide-react";

type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const subscribe = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};
export function PwaStatus() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  const [install, setInstall] = useState<InstallEvent | null>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    const before = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    const installed = () => setInstall(null);
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", before);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  if (!online)
    return (
      <div className="connectivity-banner" role="status">
        <WifiOff size={15} />
        You&apos;re offline. Reconnect before saving changes.
      </div>
    );
  return install ? (
    <button
      className="install-button button"
      onClick={async () => {
        await install.prompt();
        await install.userChoice;
        setInstall(null);
      }}
    >
      <Download size={14} />
      Install ClassOS
    </button>
  ) : null;
}
