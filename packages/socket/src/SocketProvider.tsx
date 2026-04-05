'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createSocketConnection, TypedSocket } from './createSocketConnection';
import type { SocketConnectionState } from './types';

type SocketContextValue = {
  socket: TypedSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  state: SocketConnectionState;
  error: Error | null;
};

const SocketContext = createContext<SocketContextValue | null>(null);

type SocketProviderProps = {
  apiOrigin: string;
  token?: string;
  children: ReactNode;
  debug?: boolean;
};

export function SocketProvider({ apiOrigin, token, children, debug = false }: SocketProviderProps) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [state, setState] = useState<SocketConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't connect if no token
    if (!token) {
      if (debug) {
        console.log('[SocketProvider] No token, skipping connection');
      }
      return;
    }

    setState('connecting');
    setError(null);

    const newSocket = createSocketConnection({ apiOrigin, token, debug });

    newSocket.on('connect', () => {
      setState('connected');
      setError(null);
      if (debug) {
        console.log('[SocketProvider] Connected');
      }
    });

    newSocket.on('disconnect', () => {
      setState('disconnected');
      if (debug) {
        console.log('[SocketProvider] Disconnected');
      }
    });

    newSocket.on('connect_error', (err) => {
      setState('error');
      setError(err as Error);
      if (debug) {
        console.error('[SocketProvider] Connection error:', err.message);
      }
    });

    setSocket(newSocket);

    return () => {
      if (debug) {
        console.log('[SocketProvider] Cleaning up socket connection');
      }
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [apiOrigin, token, debug]);

  const value: SocketContextValue = {
    socket,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    state,
    error,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
