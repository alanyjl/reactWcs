import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

interface SignalRContextType {
  connection: HubConnection | null;
  connectionState: HubConnectionState;
  hubConnected: boolean;
  connectionError: string | null;
}

const HUB_URL = import.meta.env?.VITE_SIGNALR_URL || 'http://192.168.2.2:5300/hubs/wcsStatus';

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected,
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // 如果重连超过了 50 次，放缓重试频率
          if (retryContext.previousRetryCount > 50) {
            return 120000; // 💡 调整为2分钟一次
          }

          // 指数退避算法 + Jitter 扰动
          const delay = Math.pow(2, retryContext.previousRetryCount) * 1000;
          const maxDelay = 30000; // 最大延迟 30 秒
          const jitter = Math.random() * 1000;

          return Math.min(delay, maxDelay) + jitter;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    // 事件监听
    newConnection.onclose((error) => {
      if (isMounted) {
        setConnectionState(HubConnectionState.Disconnected);
        if (error) {
          setConnectionError(error.message || '与服务器的连接已断开');
        }
      }
    });

    newConnection.onreconnecting((error) => {
      if (isMounted) {
        setConnectionState(HubConnectionState.Reconnecting);
        setConnectionError(error?.message || '网络连接丢失，正在尝试重新连接...');
      }
    });

    newConnection.onreconnected(() => {
      if (isMounted) {
        setConnectionState(HubConnectionState.Connected);
        setConnectionError(null);
      }
    });

    // 启动连接函数
    const startConnection = async () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (isMounted) {
        // 💡 优化：尝试连接前，先将状态设为 Connecting，方便 UI 展示加载中
        setConnectionState(HubConnectionState.Connecting);
      }

      try {
        await newConnection.start();
        if (isMounted) {
          console.log('⚡ SignalR 连接成功!');
          setConnectionState(HubConnectionState.Connected);
          setConnectionError(null);
        }
      } catch (err: any) {
        if (!isMounted) return;

        setConnectionState(HubConnectionState.Disconnected);
        const errorMsg = err.message || '无法连接到推送服务';
        setConnectionError(errorMsg);

        if (err.name === 'AbortError' || err.message.includes('stopped during negotiation')) {
          console.log('ℹ️ 正在重新建立连接...');
        } else {
          console.warn(
            '❌ SignalR 初始连接失败，服务器可能未启动。将在 5 秒后重试...',
            err.message,
          );
        }

        // 5秒后递归重试
        reconnectTimer = setTimeout(() => {
          if (isMounted) {
            startConnection();
          }
        }, 5000);
      }
    };

    startConnection();

    // 销毁逻辑
    return () => {
      isMounted = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      // 优雅停用物理连接
      newConnection.stop().catch((err) => console.warn('ℹ️ 停止连接时发生非致命异常: ', err));
    };
  }, []);

  return (
    <SignalRContext.Provider
      value={{
        connection,
        connectionState,
        hubConnected: connectionState === HubConnectionState.Connected,
        connectionError,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR 必须在 SignalRProvider 内部使用');
  }
  return context;
};
