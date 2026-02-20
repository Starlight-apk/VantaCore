import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectDelay?: number;
}

export function useSocket(
  url?: string,
  options: UseSocketOptions = {}
) {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectDelay = 1000,
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    if (!url) return;

    const socketInstance = io(url, {
      reconnection: reconnect,
      reconnectionDelay,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      setError(err);
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url, reconnect, reconnectDelay]);

  useEffect(() => {
    if (autoConnect && url) {
      return connect();
    }
  }, [autoConnect, url, connect]);

  const emit = useCallback(
    (event: string, ...args: any[]) => {
      if (socket && connected) {
        socket.emit(event, ...args);
      }
    },
    [socket, connected]
  );

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (socket) {
        socket.on(event, callback);
        return () => {
          socket.off(event, callback);
        };
      }
    },
    [socket]
  );

  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      if (socket) {
        socket.off(event, callback);
      }
    },
    [socket]
  );

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setConnected(false);
    }
  }, [socket]);

  return {
    socket,
    connected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
