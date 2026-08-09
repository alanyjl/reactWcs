import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSignalREvent } from './useSignalREvent';
import { useSignalR } from './SignalRContext'; // 💡 引入 SignalR Context
import { HubConnectionState } from '@microsoft/signalr'; // 💡 引入连接状态

// --- 类型声明 ---
export interface DeviceStatusDto {
  plcConnected: boolean;
  scanStatus: 0 | 1 | 3 | 6; // 假设 0 代表离线或未知
}

export interface InitSystemParamsDto {
  copyRight: string;
  version: string;
  defaultWayOut: number;
  company: string;
  title: string;
  wayOutNum: number;
  plcIp: string;
  scanIp: string;
  startY: number;
  endY: number;
}

interface SystemStatusContextType {
  initParams: InitSystemParamsDto | null;
  deviceStatus: DeviceStatusDto;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

export const SystemStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initParams, setInitParams] = useState<InitSystemParamsDto | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusDto>({
    plcConnected: false,
    scanStatus: 0,
  });

  // 💡 1. 订阅 SignalR 的连接状态
  const { connectionState } = useSignalR();

  // 💡 2. 监听断开连接，安全重置状态
  useEffect(() => {
    // 只要不是 Connected（比如断开连接中、已断开、重连中）
    if (connectionState !== HubConnectionState.Connected) {
      console.warn('⚠️ [SignalR] 网络断开，重置 PLC/扫码枪状态为离线，清空系统参数...');

      // 重置物理状态为安全值（离线）
      setDeviceStatus({
        plcConnected: false,
        scanStatus: 0, // 设为初始化/安全未知状态
      });

      // 清空初始化参数（可触发 UI 展示“连接中”的全局 Loading 遮罩）
      setInitParams(null);
    }
  }, [connectionState]);

  // 3. 订阅初始化系统参数
  useSignalREvent<[InitSystemParamsDto]>('OnInitParameters', (data) => {
    setInitParams(data);
  });

  // 4. 订阅设备物理状态
  useSignalREvent<[DeviceStatusDto]>('ReceiveDeviceStatus', (data) => {
    setDeviceStatus(data);
  });

  // 优化渲染性能
  const contextValue = useMemo(
    () => ({
      initParams,
      deviceStatus,
    }),
    [initParams, deviceStatus],
  );

  return (
    <SystemStatusContext.Provider value={contextValue}>{children}</SystemStatusContext.Provider>
  );
};

export const useSystemStatus = () => {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error('useSystemStatus 必须在 SystemStatusProvider 中使用');
  }
  return context;
};
