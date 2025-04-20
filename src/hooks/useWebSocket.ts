import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { Notification } from "@/types/notifications";
import { toast } from "sonner";

export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const connectWebSocket = useCallback(() => {
    if (!accessToken) return;

    const websocket_url =
      process.env.NEXT_PUBLIC_SOCKET_API_URL || "ws://localhost:8080";
    const ws = new WebSocket(`${websocket_url}/admin?token=${accessToken}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setRetryCount(0);
    };

    ws.onmessage = (event) => {
      try {
        const data: Notification = JSON.parse(event.data);
        if (data && data.type) {
          setNotifications((prev) => {
            const newNotifications = [...prev, data].slice(-50);
            switch (data.type) {
              case "transaction":
                toast.info(
                  `New transaction: $${data.data.Amount} (ID: ${data.data.TransactionID})`
                );
                break;
              case "loan":
                toast.info(`New loan activity (ID: ${data.data.LoanID})`);
                break;
              case "user":
                toast.info(`User action: ${data.data.Username}`);
                break;
            }
            return newNotifications;
          });
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * 2 ** retryCount, 30000);
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          connectWebSocket();
        }, delay);
      } else {
        toast.error(
          "Failed to reconnect to WebSocket. Please refresh the page."
        );
      }
    };

    return ws;
  }, [accessToken, retryCount, maxRetries]);

  useEffect(() => {
    const ws = connectWebSocket();
    return () => ws?.close();
  }, [connectWebSocket]);

  return { notifications, clearNotifications: () => setNotifications([]) };
}
