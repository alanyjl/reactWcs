import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
}

const TIME_LIMIT = 10 * 60 * 1000; // 10分钟限制（毫秒值）

const checkAuth = () => {
  const authTime = sessionStorage.getItem('systemAuthTime');
  if (!authTime) return false;

  // 检查当前时间与上次验证时间的差值
  const isExpired = Date.now() - parseInt(authTime, 10) > TIME_LIMIT;
  if (isExpired) {
    sessionStorage.removeItem('systemAuthTime'); // 已过期，清除
    return false;
  }
  return true;
};

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const navigate = useNavigate();

  const [isAuthorized, setIsAuthorized] = useState(checkAuth());

  const [loginForm, setLoginForm] = useState({ username: '', pwd: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!loginForm.username || !loginForm.pwd) {
      setErrorMsg('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(
        `/api/login?username=${loginForm.username}&pwd=${loginForm.pwd}`,
      );
      const result = await response.text();

      if (response.ok && result === 'ok') {
        sessionStorage.setItem('systemAuthTime', Date.now().toString());
        setIsAuthorized(true);
      } else {
        setErrorMsg('验证失败，请确认账户与密码');
      }
    } catch (error) {
      setErrorMsg('系统连接失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  // 用户点击返回，直接路由后退（无需手动 setOpen(false)，因为页面直接切走了）
  const handleCancel = () => {
    navigate(-1);
  };

  // 💡 如果已授权，直接渲染受保护的页面
  if (isAuthorized) {
    return <>{children}</>;
  }

  // 💡 未授权时，显示弹窗且不提供全局 onClose。这样点击背景和按 ESC 都无效
  return (
    <Dialog
      open={true} // 只要未授权，弹窗永远为 open 状态
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>权限安全确认</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <TextField
            label="管理员账号"
            variant="outlined"
            size="small"
            fullWidth
            autoFocus
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            disabled={loading}
          />

          <TextField
            label="安全密码"
            type="password"
            variant="outlined"
            size="small"
            fullWidth
            value={loginForm.pwd}
            onChange={(e) => setLoginForm({ ...loginForm, pwd: e.target.value })}
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCancel} disabled={loading} color="inherit">
          返回
        </Button>
        <Button onClick={handleVerify} variant="contained" color="primary" disabled={loading}>
          {loading ? '正在验证...' : '确认进入'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
