import React, { useState, useContext } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  Divider,
  List,
  type Theme,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  Tooltip,
} from '@mui/material';
import { ColorModeContext } from '../context/ColorModeContext';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AccountCircle,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';

import darkBg from '../assets/darkbg.png';
import lightBg from '../assets/lightbg.png';
import logo from '../assets/logo.png';
import logo2 from '../assets/logo2.png';
import { getGlassStyle, GLASS_CONFIG } from '../theme/sharedStyles';

const openWidth = 240; // 侧栏展开宽度
const collapsedWidth = 64; // 侧栏收缩宽度

export default function Cs() {
  const [open, setOpen] = useState(true); // 侧栏展开/收缩状态

  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const drawerTransition = (t: Theme) =>
    t.transitions.create(['width', 'margin', 'padding', 'left'], {
      easing: t.transitions.easing.sharp,
      duration: open ? t.transitions.duration.enteringScreen : t.transitions.duration.leavingScreen,
    });

  const isDark = theme.palette.mode === 'dark';
  const bgImage = theme.palette.mode === 'dark' ? darkBg : lightBg;

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // 侧栏菜单项
  const menuItems = [
    { text: '首页', icon: <HomeIcon /> },
    { text: '用户', icon: <PeopleIcon /> },
    { text: '设置', icon: <SettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      <CssBaseline />

      {/* ====== 固定顶栏 ====== */}
      <AppBar
        position="fixed"
        elevation={3}
        sx={{
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          // 侧栏收缩/展开时，顶栏左侧跟着调整
          width: '100%',
          ...getGlassStyle(isDark), // 💡 应用统一的毛玻璃样式
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Photos
          </Typography>
          <div>
            <Tooltip
              title={isDark ? '切换至亮色模式' : '切换至暗色模式'}
              arrow
              placement="left"
              enterDelay={300}
            >
              <IconButton
                size="small"
                color="inherit"
                onClick={colorMode.toggleColorMode}
                sx={{ mr: 1 }}
              >
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* ====== 侧栏 (Drawer) ====== */}
      <Drawer
        variant="permanent"
        elevation={3}
        sx={(t) => ({
          width: open ? openWidth : collapsedWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: open ? openWidth : collapsedWidth,
            boxSizing: 'border-box',
            top: '64px', // AppBar 高度
            height: 'calc(100% - 60px)', // 减去顶栏高度
            overflowX: 'hidden',
            borderRight: 1,
            ...getGlassStyle(isDark),
            boxShadow: isDark
              ? '4px 0 16px 0 rgba(0, 0, 0, 0.25)'
              : '4px 0 16px 0 rgba(0, 0, 0, 0.05)',

            transition: drawerTransition(t),
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            pr: open ? 1 : 0,
            justifyContent: open ? 'flex-end' : 'center',
            alignItems: 'center',
            minHeight: '64px !important',
          }}
        >
          <IconButton onClick={toggleDrawer} sx={{ width: 40, height: 40 }}>
            <ChevronLeftIcon
              sx={{
                transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s',
              }}
            />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={index}
              sx={(t) => ({
                margin: '4px',
                borderRadius: '8px',
                '&.Mui-selected': {
                  backgroundColor:
                    t.palette.mode === 'dark'
                      ? GLASS_CONFIG.dark.selectedBg
                      : GLASS_CONFIG.light.selectedBg,
                  color: t.palette.primary.main,
                  '&:hover': {
                    borderLeft: '4px solid #ff0000',
                    backgroundColor:
                      t.palette.mode === 'dark'
                        ? GLASS_CONFIG.dark.selectedHoverBg
                        : GLASS_CONFIG.light.selectedHoverBg,
                  },
                  '& .MuiListItemIcon-root': {
                    color: t.palette.primary.main,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '25%',
                    height: '50%',
                    width: '4px',
                    borderRadius: '4px',
                    backgroundColor: t.palette.primary.main,
                  },
                },
              })}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: 'center',
                  transition: 'pr 0.6s',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  ml: 2,
                  opacity: open ? 0.8 : 0,
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap',
                }}
              />
            </ListItemButton>
          ))}
        </List>
        <Box
          component="img"
          src={isDark ? logo2 : logo}
          sx={{
            mt: 'auto',
            mb: 2,
            width: 220,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.5s, transform 0.6s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)', // 悬停放大 1.15 倍
            },
          }}
        />
      </Drawer>

      {/* ====== 主内容区域 ====== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px', // AppBar 高度
          mb: '56px', // BottomNavigation 高度
          ml: open ? `${openWidth}px` : `${collapsedWidth}px`,
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Typography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. ...
          {/* 这里是你的页面内容 */}
        </Typography>
      </Box>

      {/* ====== 固定底栏 ====== */}
      <Paper
        elevation={3}
        sx={(t) => ({
          position: 'fixed',
          display: 'flex',
          left: open ? openWidth : collapsedWidth,
          bottom: 0,
          right: 0,
          borderRadius: 0,
          borderTop: 1,
          px: 3,
          alignItems: 'center',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          height: 50,
          ...getGlassStyle(isDark),
          transition: drawerTransition(t),
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="overline" color="#b6b6b6">
            2016 - {new Date().getFullYear()} ©版权所有 | 软件版本:
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
