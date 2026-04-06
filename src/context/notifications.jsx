import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getNotifications, getNotificationsBadge, markNotificationRead, markAllNotificationsRead } from "../api/notifications";

const NotificationContext = createContext(null);

const POLL_INTERVAL = 60000;
const MAX_RETRIES = 3;

export function NotificationProvider({ children }) {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null);
  const retryCountRef = useRef(0);

  const tokenRef = useRef(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const isAuthenticated = !!tokenRef.current;

  const fetchBadge = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getNotificationsBadge();
      setCount(data.count || 0);
      retryCountRef.current = 0;
    } catch {
      retryCountRef.current += 1;
      if (retryCountRef.current >= MAX_RETRIES) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          retryCountRef.current = 0;
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(fetchBadge, POLL_INTERVAL);
        }, POLL_INTERVAL * 2);
      }
    }
  }, [isAuthenticated]);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getNotifications();
      setItems(Array.isArray(data) ? data : []);
      const unread = data.filter((n) => !n.is_read).length;
      setCount(unread);
    } catch {
      // silenciar
    }
  }, [isAuthenticated]);

  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
      );
      setCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silenciar
    }
  }, []);

  const markAll = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setCount(0);
    } catch {
      // silenciar
    }
  }, []);

  const toggle = useCallback(async () => {
    if (!open) {
      await fetchAll();
    }
    setOpen((prev) => !prev);
  }, [open, fetchAll]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchBadge();

    intervalRef.current = setInterval(fetchBadge, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetchBadge]);

  return (
    <NotificationContext.Provider value={{ count, items, open, toggle, close, markRead, markAll, fetchAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
