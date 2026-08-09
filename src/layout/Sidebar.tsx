import React, { useMemo } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { MENU_ITEMS } from '../constants/menuItems';
import {
  getGlassStyle,
  getSidebarItemStyle,
  getScrollbarStyles,
  SIDEBAR_CONFIG,
} from '../theme/sharedStyles';
import XCoil from '../components/XCoil';

// 获取抽屉展开/收缩过渡动画
const getTransition = (t: Theme, open: boolean) =>
  t.transitions.create(['width', 'margin', 'padding'], {
    easing: t.transitions.easing.sharp,
    duration: open ? t.transitions.duration.enteringScreen : t.transitions.duration.leavingScreen,
  });

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isMobile }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const location = useLocation();

  // 💡 性能优化：使用 useMemo 缓存样式，避免因父级重绘导致的重复计算
  const glassStyle = useMemo(() => getGlassStyle(isDark), [isDark]);
  const scrollbarStyles = useMemo(() => getScrollbarStyles(isDark), [isDark]);
  const itemStyle = useMemo(() => getSidebarItemStyle(isDark, theme), [isDark, theme]);

  const { expanded, collapsed } = SIDEBAR_CONFIG.widths;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={isMobile ? onClose : undefined}
      sx={(t) => ({
        width: open ? expanded : collapsed,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: getTransition(t, open),
        '& .MuiDrawer-paper': {
          width: open ? expanded : collapsed,
          overflowX: 'hidden',
          overflowY: 'hidden',
          borderRight: 1,
          ...glassStyle,
          transition: getTransition(t, open),
          boxShadow: isDark
            ? '4px 0 16px 0 rgba(0, 0, 0, 0.25)'
            : '4px 0 16px 0 rgba(0, 0, 0, 0.05)',
        },
      })}
    >
      <Toolbar sx={{ minHeight: { xs: '48px !important', xl: '64px !important' } }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', mt: 2 }}>
        {/* 菜单区域：整合滚动条配置，当菜单项超长时，具备美化过的精致微滚动条 */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto', // 💡 改为 auto 支持滚动
            overflowX: 'hidden',
            minHeight: 230,
            ...scrollbarStyles, // 💡 应用自定义轻量化滚动条
          }}
        >
          <List>
            {MENU_ITEMS.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.id}
                  component={Link}
                  to={item.path}
                  selected={isSelected}
                  onClick={() => isMobile && onClose()}
                  sx={itemStyle} // 💡 完美应用剥离后的菜单样式
                >
                  <ListItemIcon
                    sx={(t) => ({
                      minWidth: 0,
                      mr: 1.5,
                      justifyContent: 'center',
                      transition: getTransition(t, open),
                      '& .MuiSvgIcon-root': {
                        fontSize: { xs: '20px', xl: '26px' },
                      },
                    })}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={(t) => ({
                      opacity: open ? 1 : 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      transition: getTransition(t, open),
                      width: open ? 'auto' : 0,
                      '& .MuiTypography-root': {
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: { xs: '0.85rem', xl: '0.95rem' },
                      },
                    })}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* 底部 XCoil 组件容器 */}
        <Box
          sx={{
            p: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={(t) => ({
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              transition: t.transitions.create(['opacity', 'max-height', 'margin', 'transform'], {
                easing: t.transitions.easing.sharp,
                duration: t.transitions.duration.shorter,
              }),
              opacity: open ? 0.7 : 0,
              maxHeight: open ? '24px' : '0px',
              transform: open ? 'translateY(0)' : 'translateY(-10px)',
            })}
          >
            PLC 输入点
          </Typography>

          <XCoil open={open} />
        </Box>
      </Box>
    </Drawer>
  );
};
