import React, { createContext, useContext, useEffect, useState } from 'react'; // 💡 引入 useEffect
import { useSignalREvent } from '../context/useSignalREvent';
import { useSignalR } from './SignalRContext'; // 💡 引入刚刚编写的 useSignalR context 的路径
import { HubConnectionState } from '@microsoft/signalr';

export interface PointStateDto {
  address: string;
  state: boolean;
}

interface PointStatusContextType {
  pointStates: Record<string, boolean>;
  isInitialized: boolean;
}

const PointStatusContext = createContext<PointStatusContextType | undefined>(undefined);

export const PointStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pointStates, setPointStates] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // 💡 1. 订阅 SignalR 的生命周期状态
  const { connectionState } = useSignalR();

  // 💡 2. 核心逻辑：监听到断开连接时，清空状态数据
  useEffect(() => {
    // 情况 A：只要不是完全连接状态 (例如: Disconnected 或正在 Reconnecting)，就立即清空数据
    if (connectionState !== HubConnectionState.Connected) {
      console.warn('⚠️ [SignalR] 连接已中断，正在清空实时点位数据缓存...');
      setPointStates({});
      setIsInitialized(false);
    }
  }, [connectionState]);

  // 3. 监听全量点位更新
  useSignalREvent<[any]>('ReceiveAllPointStates', (rawData) => {
    if (!rawData) return;
    let pointsMap: Record<string, boolean> = {};
    if (Array.isArray(rawData)) {
      rawData.forEach((point) => {
        const addr = point.address ?? point.Address;
        const val = point.state ?? point.State;
        if (addr !== undefined) pointsMap[addr] = !!val;
      });
    } else if (typeof rawData === 'object') {
      pointsMap = { ...rawData };
    }
    setPointStates(pointsMap);
    setIsInitialized(true);
  });

  // 4. 监听单点实时变化
  useSignalREvent<[any]>('ReceivePointState', (singlePoint) => {
    if (!singlePoint) return;
    const address = singlePoint.address ?? singlePoint.Address;
    const state = singlePoint.state ?? singlePoint.State;

    if (address !== undefined && state !== undefined) {
      setPointStates((prev) => ({
        ...prev,
        [address]: !!state,
      }));
    }
  });

  return (
    <PointStatusContext.Provider value={{ pointStates, isInitialized }}>
      {children}
    </PointStatusContext.Provider>
  );
};

export const usePointStatus = () => {
  const context = useContext(PointStatusContext);
  if (context === undefined) {
    throw new Error('usePointStatus 必须在 PointStatusProvider 内部使用！');
  }
  return context;
};
