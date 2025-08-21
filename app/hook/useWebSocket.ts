import { useEffect, useRef, useCallback } from "react";

interface UseWebSocketOptions {
  url: string;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export default function useWebSocket({
  url,
  onOpen,
  onMessage,
  onClose,
  onError,
}: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);
    if (onOpen) ws.current.onopen = onOpen;
    if (onMessage) ws.current.onmessage = onMessage;
    if (onClose) ws.current.onclose = onClose;
    if (onError) ws.current.onerror = onError;

    return () => {
      ws.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // 发送消息方法
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  }, []);

  return { ws, sendMessage };
}
