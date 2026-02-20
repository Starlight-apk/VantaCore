import { useState, useEffect, useCallback } from 'react';

interface UseWebSocketOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: (ws: WebSocket) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
) {
  const {
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onOpen,
    onClose,
    onMessage,
    onError,
  } = options;

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const connect = useCallback(() => {
    const websocket = new WebSocket(url);

    websocket.onopen = (event) => {
      setConnected(true);
      setReconnectCount(0);
      onOpen?.(websocket);
    };

    websocket.onclose = (event) => {
      setConnected(false);
      onClose?.(event);

      if (reconnect && reconnectCount < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectCount((prev) => prev + 1);
          connect();
        }, reconnectInterval);
      }
    };

    websocket.onerror = (event) => {
      onError?.(event);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        onMessage?.(data);
      } catch {
        setLastMessage(event.data);
        onMessage?.(event.data);
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [url, reconnect, reconnectInterval, maxReconnectAttempts, onOpen, onClose, onMessage, onError, reconnectCount]);

  useEffect(() => {
    return connect();
  }, [connect]);

  const send = useCallback((data: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      ws.send(message);
    }
  }, [ws]);

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
      setConnected(false);
    }
  }, [ws]);

  return {
    ws,
    connected,
    lastMessage,
    reconnectCount,
    send,
    disconnect,
  };
}
