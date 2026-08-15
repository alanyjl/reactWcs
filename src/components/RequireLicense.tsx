// src/components/RequireLicense.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useLicense, LicenseStatus } from '../context/LicenseContext';
import { Box, Typography, Button, Alert } from '@mui/material';

export const RequireLicense: React.FC = () => {
  const license = useLicense();

  if (license?.loading) {
    return <Box sx={{ p: 5 }}>正在检测系统环境...</Box>;
  }

  // 1. 🟢 设备服务断开
  if (license?.isBackendDown) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          无法连接到后端控制服务
        </Alert>
        <Typography variant="h6">系统后台服务未启动或正在重启中</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          请检查服务端程序运行状态，或联系系统管理员。
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          重试连接
        </Button>
      </Box>
    );
  }

  // 2. 🟢 检测到时间篡改 (TimeTampered)
  if (license?.status === LicenseStatus.TimeTampered) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          系统安全死锁已触发
        </Alert>
        <Typography variant="h6" color="error">
          检测到系统服务器时间已被篡改！
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
          系统因安全策略已停用。
        </Typography>
        <Typography variant="body2" color="error.main">
          请修正您的服务器主机时间为当前标准时间后，重新启动软件服务。
        </Typography>
      </Box>
    );
  }

  // 3. 🔴 授权确实失效 (跳往激活页)
  if (!license?.isValid) {
    return <Navigate to="/activate" replace />;
  }

  // 4. 正常放行
  return <Outlet />;
};
