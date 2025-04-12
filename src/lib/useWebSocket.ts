// src/lib/useWebSocket.ts
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Notification } from "@/types/notifications";

export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const websocket_url = process.env.NEXT_PUBLIC_SOCKET_API_URL;
    const ws = new WebSocket(`${websocket_url}/admin?token=${accessToken}`);

    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data); // Debug log
      if (data && data.type) {
        setNotifications((prev) => [...prev, data]);
      }
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket disconnected");

    return () => ws.close();
  }, [accessToken]);

  return { notifications };
}
