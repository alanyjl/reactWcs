import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

interface SignalRContextType {
  connection: HubConnection | null;
  connectionState: HubConnectionState;
  hubConnected: boolean;
  connectionError: string | null;
}

const HUB_URL = import.meta.env?.VITE_SIGNALR_URL || '/hubs/wcsStatus';

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected,
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // 使用 Ref 追踪最新的 connection 实例与挂载状态，防止闭包和 React 18 双重渲染问题
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    let isMounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // 🟢 极速优化：在工控环境下，优先优先尝试 WebSocket 直连，跳过复杂的 HTTP 协商过程
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount > 50) return 120000;
          const delay = Math.pow(2, retryContext.previousRetryCount) * 1000;
          return Math.min(delay, 30000) + Math.random() * 1000;
        },
      })
      .configureLogging(LogLevel.Warning) // 调试稳定后降级为 Warning，减少 console 刷屏
      .build();

    connectionRef.current = newConnection;
    setConnection(newConnection);

    // 监听状态变动
    newConnection.onclose((error) => {
      if (!isMounted) return;
      setConnectionState(HubConnectionState.Disconnected);
      if (error) setConnectionError(error.message || '与服务器的推送连接已断开');
    });

    newConnection.onreconnecting((error) => {
      if (!isMounted) return;
      setConnectionState(HubConnectionState.Reconnecting);
      setConnectionError(error?.message || '网络连接丢失，正在后台重连...');
    });

    newConnection.onreconnected(() => {
      if (!isMounted) return;
      setConnectionState(HubConnectionState.Connected);
      setConnectionError(null);
    });

    // 启动连接方法
    const connect = async () => {
      if (!isMounted) return;

      // 保证只有在 Disconnected 状态下才发起连接，防止重复 start
      if (newConnection.state !== HubConnectionState.Disconnected) {
        return;
      }

      setConnectionState(HubConnectionState.Connecting);

      try {
        await newConnection.start();
        if (isMounted) {
          console.log('⚡ [SignalR] 实时推送服务连接成功!');
          setConnectionState(HubConnectionState.Connected);
          setConnectionError(null);
        }
      } catch (err: any) {
        if (!isMounted) return;

        setConnectionState(HubConnectionState.Disconnected);
        setConnectionError('推送服务未就绪');

        // 仅在首次连接失败（且未卸载）时，触发 5 秒后的手动重试
        console.warn('⚠️ [SignalR] 初始连接失败（后端未准备好），5 秒后自动重试...');
        reconnectTimer = setTimeout(() => {
          connect();
        }, 5000);
      }
    };

    // 🟢 异步非阻塞发起连接
    connect();

    // 销毁逻辑
    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);

      // 安全清理：只有当状态不为 Disconnected 时才停止
      if (newConnection.state !== HubConnectionState.Disconnected) {
        newConnection.stop().catch(() => {});
      }
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
