"use client";
import { useEffect, useRef, useState } from "react";

type PermohonanBaru = {
  id: string;
  namaUsaha: string;
  createdAt: string;
  user: { name: string | null };
};

export default function AdminNotification() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifList, setNotifList] = useState<PermohonanBaru[]>([]);
  const lastCountRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  async function fetchNotification(isInit = false) {
    try {
      const res = await fetch("/api/admin/count", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      

      const readIds: string[] = JSON.parse(
        localStorage.getItem("admin_read_ids") ?? "[]"
      );

      const belumDibaca: PermohonanBaru[] = data.terbaru.filter(
        (item: PermohonanBaru) => !readIds.includes(item.id)
      );

      if (isInit) {
        lastCountRef.current = data.count;
        setCount(belumDibaca.length);
        setNotifList(belumDibaca);
        return;
      }

      if (lastCountRef.current === null) {
        lastCountRef.current = data.count;
        return;
      }

      if (data.count > lastCountRef.current) {
        setNotifList((prev) => {
          const existingIds = new Set(
            prev.map((item) => item.id)
          );

          const newItems = belumDibaca.filter(
            (item) => !existingIds.has(item.id)
          );

          if (newItems.length > 0) {
            setCount((current) => current + newItems.length);
          }

          return [...newItems, ...prev];
        });
      }

      lastCountRef.current = data.count;
    } catch (err) {
      console.error("Notification Error:", err);
    }
  }

  fetchNotification(true);

  const interval = setInterval(() => {
    fetchNotification(false);
  }, 10000);
console.log("NOTIF COUNT:", count);
console.log("NOTIF LIST:", notifList);
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleDibaca() {
    const readIds: string[] = JSON.parse(localStorage.getItem("admin_read_ids") ?? "[]");
    const newIds = [...new Set([...readIds, ...notifList.map((n) => n.id)])];
    localStorage.setItem("admin_read_ids", JSON.stringify(newIds));
    setCount(0);
    setNotifList([]);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
      >
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-sm text-slate-700">Notifikasi</p>
            {count > 0 && (
              <button onClick={handleDibaca} className="text-xs text-blue-600 hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>

          {notifList.length > 0 ? (
            <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {notifList.map((item) => (
                <li key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                    {item.user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {item.user.name ?? "Pengguna baru"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Mengajukan: <span className="font-medium">{item.namaUsaha}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              Tidak ada notifikasi baru
            </div>
          )}
        </div>
      )}
    </div>
  );
}
