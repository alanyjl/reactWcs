import { useContext } from 'react';
import { Toolbar, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
} from '@mui/icons-material';

import { useSystemStatus } from '../context/SystemStatusContext';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../context/ColorModeContext';
interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { initParams } = useSystemStatus(); // 业务层状态
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colorMode = useContext(ColorModeContext);

  return (
    <>
      <Toolbar
        sx={{
          minHeight: { xs: '48px !important', xl: '64px !important' },
          px: { xs: 1.5, xl: 3 },
        }}
      >
        {onToggleSidebar && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onToggleSidebar}
            sx={{
              width: { xs: 36, xl: 44 },
              height: { xs: 36, xl: 44 },
              mr: 1,
            }}
            aria-label="切换侧边栏"
          >
            {/* 💡 图标 1: 三横线 (收起时显示，打开时旋转 90度 并缩小消失) */}
            <MenuIcon
              sx={{
                position: 'absolute',
                fontSize: { xs: '20px', xl: '24px' }, // 💡 2K/4K 屏幕图标变大
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
                transform: sidebarOpen ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)',
                opacity: sidebarOpen ? 0 : 1,
                // 避免隐藏时依然能被鼠标点中
                pointerEvents: sidebarOpen ? 'none' : 'auto',
              }}
            />

            {/* 💡 图标 2: 带箭头的菜单 (打开时显示，收起时反向旋转 90度 并缩小消失) */}
            <MenuOpenIcon
              sx={{
                position: 'absolute',
                fontSize: { xs: '20px', xl: '24px' }, // 💡 2K/4K 屏幕图标变大
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
                transform: sidebarOpen ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
                opacity: sidebarOpen ? 1 : 0,
                pointerEvents: sidebarOpen ? 'auto' : 'none',
              }}
            />
          </IconButton>
        )}

        <Typography
          variant="subtitle1"
          component="div"
          sx={{ flexGrow: 1, fontSize: { xs: '0.9rem', xl: '1.25rem' } }}
        >
          {initParams?.title || '工业监控系统'}
        </Typography>

        {/* 主题切换 */}
        <Tooltip
          title={isDark ? '切换至亮色模式' : '切换至暗色模式'}
          arrow
          placement="left"
          enterDelay={300}
        >
          <IconButton
            size={useMediaQuery(theme.breakpoints.up('xl')) ? 'medium' : 'small'}
            color="inherit"
            onClick={colorMode.toggleColorMode}
            sx={{ mr: 1 }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {/* 顶部操作 */}
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            mr: 2,
            display: { xs: 'none', sm: 'block' },
            fontSize: { xs: '0.75rem', xl: '0.9rem' },
          }}
        >
          {initParams?.company}
        </Typography>
        <IconButton size="small" color="inherit">
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </>
  );
}
