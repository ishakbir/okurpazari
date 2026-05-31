/**
 * Socket Context
 * Provides Socket.io connection throughout the app
 */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  onNewMessage: (callback: (data: { conversationId: number; message: Message }) => void) => () => void;
  onMessagesRead: (callback: (data: { conversationId: number; readerId: number }) => void) => () => void;
  onNotification: (callback: (notification: unknown) => void) => () => void;
  onMessageNotification: (callback: (data: { conversationId: number; message: Message }) => void) => () => void;
  startTyping: (conversationId: number) => void;
  stopTyping: (conversationId: number) => void;
  onTypingUpdate: (callback: (data: { conversationId: number; userId: number; isTyping: boolean }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket server
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  const joinConversation = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join:conversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave:conversation', conversationId);
    }
  }, []);

  const startTyping = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', conversationId);
    }
  }, []);

  const stopTyping = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', conversationId);
    }
  }, []);

  const onNewMessage = useCallback((callback: (data: { conversationId: number; message: Message }) => void) => {
    if (!socketRef.current) return () => {};
    
    socketRef.current.on('message:new', callback);
    return () => {
      socketRef.current?.off('message:new', callback);
    };
  }, []);

  const onMessagesRead = useCallback((callback: (data: { conversationId: number; readerId: number }) => void) => {
    if (!socketRef.current) return () => {};
    
    socketRef.current.on('messages:read', callback);
    return () => {
      socketRef.current?.off('messages:read', callback);
    };
  }, []);

  const onNotification = useCallback((callback: (notification: unknown) => void) => {
    if (!socketRef.current) return () => {};
    
    socketRef.current.on('notification:new', callback);
    return () => {
      socketRef.current?.off('notification:new', callback);
    };
  }, []);

  const onMessageNotification = useCallback((callback: (data: { conversationId: number; message: Message }) => void) => {
    if (!socketRef.current) return () => {};
    
    socketRef.current.on('message:notification', callback);
    return () => {
      socketRef.current?.off('message:notification', callback);
    };
  }, []);

  const onTypingUpdate = useCallback((callback: (data: { conversationId: number; userId: number; isTyping: boolean }) => void) => {
    if (!socketRef.current) return () => {};
    
    socketRef.current.on('typing:update', callback);
    return () => {
      socketRef.current?.off('typing:update', callback);
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinConversation,
      leaveConversation,
      onNewMessage,
      onMessagesRead,
      onNotification,
      onMessageNotification,
      startTyping,
      stopTyping,
      onTypingUpdate,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
