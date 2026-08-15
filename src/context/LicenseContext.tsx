import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. 定义一个普通的 JS 常量对象（运行时使用）
export const LicenseStatus = {
  Unregistered: 'Unregistered',
  InTrial: 'InTrial',
  TrialExpired: 'TrialExpired',
  Registered: 'Registered',
  Expired: 'Expired',
  TimeTampered: 'TimeTampered',
} as const;

export type LicenseStatus = (typeof LicenseStatus)[keyof typeof LicenseStatus];

interface LicenseState {
  isValid: boolean;
  status: LicenseStatus | null; // 具体状态
  description: string;
  loading: boolean;
  isBackendDown: boolean; // 🟢 新增：标记后端是否掉线
}

const LicenseContext = createContext<LicenseState | null>(null);

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [license, setLicense] = useState<LicenseState>({
    isValid: true,
    status: 'Unregistered',
    description: '',
    loading: true,
    isBackendDown: false,
  });

  const checkLicense = async () => {
    try {
      const response = await fetch('/api/license/status'); // 你的请求路径
      const data = await response.json();
      // data 结构为: { success: true, status: 'InTrial', statusCode: 1, description: '试用期运行中' }

      console.log(data);
      // 🟢 取出后端的 status 字符串 ('InTrial', 'Registered' 等)
      const status = data.status as LicenseStatus;

      // 判断授权是否有效 (试用中 or 正式授权 均为有效)
      const isValid = status === LicenseStatus.Registered || status === LicenseStatus.InTrial;

      setLicense({
        isValid,
        status, // 写入 state (值例如: 'InTrial')
        loading: false,
        description: data.description,
        isBackendDown: false,
      });
    } catch (error: any) {
      if (error.message && error.message.includes('unauthorized')) {
        setLicense({
          isValid: false,
          status: LicenseStatus.Unregistered, // 'Unregistered'
          description: '',
          loading: false,
          isBackendDown: false,
        });
      } else {
        setLicense({
          isValid: true,
          status: null,
          loading: false,
          description: '',
          isBackendDown: true,
        });
      }
    }
  };

  useEffect(() => {
    checkLicense();

    // 每 120 分钟静默检测一次
    const timer = setInterval(checkLicense, 2 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return <LicenseContext.Provider value={license}>{children}</LicenseContext.Provider>;
};

export const useLicense = () => useContext(LicenseContext);
