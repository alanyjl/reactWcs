import { useState } from 'react'; // 💡 移除了 useEffect
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
  GlobalStyles,
  Paper,
  AppBar,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useSignalR } from '../context/SignalRContext';
import { HubConnectionState } from '@microsoft/signalr';

import Header from './Header';
import Footer from './Footer';
import { Sidebar } from './Sidebar';
import { getGlassStyle, getScrollbarStyles } from '../theme/sharedStyles';

import darkBg from '../assets/darkbg.png';
import lightBg from '../assets/lightbg.png';

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const isDark = theme.palette.mode === 'dark';

  // 获取 SignalR 状态
  const { connectionState, connectionError } = useSignalR();

  // 💡 1. 派生状态：只要不是 Connected 状态，就应该显示全局警示
  const alertOpen = connectionState !== HubConnectionState.Connected;

  // 💡 2. 根据当前状态动态计算 UI 表现
  const isReconnecting = connectionState === HubConnectionState.Reconnecting;
  const isConnecting = connectionState === HubConnectionState.Connecting;

  let alertSeverity: 'warning' | 'error' | 'info' = 'error';
  let alertTitle = '与 WCS 服务连接断开';

  if (isReconnecting) {
    alertSeverity = 'warning';
    alertTitle = '网络连接丢失，正在尝试自动重连...';
  } else if (isConnecting) {
    alertSeverity = 'info';
    alertTitle = '正在尝试连接 WCS 服务...';
  }

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const bgImage = isDark ? darkBg : lightBg;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      <CssBaseline />
      <GlobalStyles styles={getScrollbarStyles(isDark)} />

      {/* Header */}
      <AppBar
        position="fixed"
        elevation={3}
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 1,
          borderBottom: 1,
          color: 'text.primary',
          ...getGlassStyle(isDark),
        })}
      >
        <Header sidebarOpen={open} onToggleSidebar={handleDrawerToggle} />
      </AppBar>

      {/* Sidebar 侧边栏 */}
      <Sidebar open={open} isMobile={isMobile} onClose={handleDrawerToggle} />

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: '100vh',
          width: 0,
          overflow: 'hidden',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '48px !important', xl: '64px !important' } }} />

        {/* 工业主工作区 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, xl: 3 },
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Paper
          elevation={3}
          sx={{
            p: 0.5,
            px: 2,
            borderTop: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: { xs: '40px', xl: '52px' },
            borderRadius: 0,
            ...getGlassStyle(isDark),
          }}
        >
          <Footer />
        </Paper>
      </Box>

      {/* 全局 SignalR 连接状态强提醒挂件 */}
      <Snackbar
        open={alertOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ marginTop: { xs: '98px', xl: '140px' } }}
      >
        <Alert
          severity={alertSeverity}
          variant="filled"
          elevation={6}
          icon={<CircularProgress color="inherit" size={20} />}
          sx={{ width: '100%', minWidth: '400px', alignItems: 'center', px: 5 }}
        >
          <strong>{alertTitle}</strong>
          <br />
          <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
            原因：{connectionError || '正在等待服务器响应...'}
          </span>
        </Alert>
      </Snackbar>
    </Box>
  );
}
