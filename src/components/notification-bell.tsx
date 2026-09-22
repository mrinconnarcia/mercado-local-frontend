"use client";

import { useEffect, useRef, useState } from "react";
import { notificationsApi } from "@/src/lib/endpoints";
import type { Notification } from "@/src/types";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    notificationsApi
      .list()
      .then((res) => {
        setUnreadCount(res.unread_count);
        setNotifications(res.notifications);
        setLoaded(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    setOpen((o) => !o);
    if (!loaded) load();
  };

  const markRead = async (id: number) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
        aria-label="Notificaciones"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg shadow-neutral-900/10">
          <div className="flex items-center justify-between border-b border-neutral-100 px-3.5 py-2.5">
            <span className="text-sm font-semibold text-neutral-900">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-96 divide-y divide-neutral-50 overflow-y-auto">
            {loading && !loaded ? (
              <p className="px-3 py-6 text-center text-sm text-neutral-500">
                Cargando...
              </p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <BellIcon className="h-6 w-6 text-neutral-300" />
                <p className="text-sm text-neutral-500">
                  No tenés notificaciones.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`relative block w-full px-3.5 py-2.5 text-left text-sm ${
                    n.read ? "bg-white" : "bg-emerald-50/60"
                  } hover:bg-neutral-50`}
                >
                  {!n.read && (
                    <span className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  )}
                  <div className="pl-3">
                    {n.title && (
                      <p className="font-medium text-neutral-900">{n.title}</p>
                    )}
                    {n.body && (
                      <p className="mt-0.5 text-neutral-600">{n.body}</p>
                    )}
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length >= 50 && (
            <p className="border-t border-neutral-100 px-3 py-2 text-center text-xs text-neutral-400">
              Mostrando las 50 más recientes
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BellIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
