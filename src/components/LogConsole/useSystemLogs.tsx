import { useState, useEffect } from 'react';
import { useSignalR } from '../../context/SignalRContext'; // 确保路径正确

// 复用接口定义
export interface SystemLog {
  id?: string;
  message: string;
  level: 'info' | 'debug' | 'warning' | 'error';
  time: string;
}

export function useSystemLogs() {
  const { connection, hubConnected: isConnected } = useSignalR();
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    if (!connection || !isConnected) return;

    const handleReceiveLog = (newLog: SystemLog) => {
      const logWithId = {
        ...newLog,
        id: newLog.id || `${Date.now()}-${Math.random()}`,
      };
      setLogs((prevLogs) => {
        return [logWithId, ...prevLogs].slice(0, 50);
      });
    };

    // 订阅 SignalR 事件
    connection.on('ReceiveSystemLog', handleReceiveLog);

    return () => {
      // 取消订阅
      connection.off('ReceiveSystemLog', handleReceiveLog);
    };
  }, [connection, isConnected]);

  // 提供一个安全清空列表的方法
  const clearLogs = () => setLogs([]);

  return {
    logs,
    clearLogs,
    isConnected,
  };
}
