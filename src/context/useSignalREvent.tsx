import { useEffect, useRef, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr'; // 💡 引入官方状态枚举
import { useSignalR } from '../context/SignalRContext';

/**
 * Hook 1: 通用 SignalR 事件订阅 Hook (接收数据)
 * @param eventName 监听的事件名
 * @param callback 触发时的回调函数，其参数与后端推送一致
 */
export function useSignalREvent<T extends any[] = any[]>( // 💡 默认泛型为 any[]
  eventName: string,
  callback: (...args: T) => void,
) {
  const { connection } = useSignalR();
  const savedCallback = useRef(callback);

  // 避免闭包陷阱：每次 callback 变化时仅更新 ref，不重新触发下面的 useEffect
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!connection) return;

    // TypeScript 这里的入参类型声明为 any[] 以兼容 SignalR.on 的签名
    const handler = (...args: any[]) => {
      savedCallback.current(...(args as T));
    };

    connection.on(eventName, handler);

    return () => {
      connection.off(eventName, handler);
    };
  }, [connection, eventName]);
}

/**
 * 🌟 Hook 2: 通用 SignalR 调用 Hook (发送指令)
 * 提供带格式化日志和异常处理的 safeInvoke 方法
 */
export function useSignalRInvoke() {
  const { connection } = useSignalR();

  // 💡 优化：使用 useCallback 包裹，保证函数引用在 connection 未改变时保持不变
  const safeInvoke = useCallback(
    async (methodName: string, ...args: any[]): Promise<boolean> => {
      // 💡 优化：使用 HubConnectionState.Connected 代替字符串 "Connected"
      if (connection && connection.state === HubConnectionState.Connected) {
        try {
          await connection.invoke(methodName, ...args);
          console.log(`[SignalR] 执行成功 ${methodName}, 参数:`, args);
          return true;
        } catch (err) {
          console.error(`[SignalR] 执行失败 ${methodName}:`, err);
        }
      } else {
        console.warn(
          `[SignalR] Connection 未连接或不存在 (当前状态: ${connection?.state})，无法执行 ${methodName}`,
        );
      }
      return false;
    },
    [connection], // 仅在 connection 对象变化时才重新生成函数
  );

  return { safeInvoke };
}
