// 1. 整体基础配置：随时修改这里的值来调整整体视觉
export const GLASS_CONFIG = {
  blur: '10px', // 模糊度

  // 亮色模式配置
  light: {
    color: '#788898',
    bgColor: 'rgba(255, 255, 255, 0.45)',
    selectedBg: 'rgba(25, 118, 210, 0.15)', // 选中项背景
    selectedHoverBg: 'rgba(25, 118, 210, 0.22)', // 选中项悬浮背景
  },

  // 暗色模式配置
  dark: {
    color: '#a2b8d0',
    bgColor: 'rgba(30, 48, 80, 0.15)', // 💡 深暗蓝色半透明（吸附蓝色背景）
    selectedBg: 'rgba(255, 255, 255, 0.15)', // 选中项背景
    selectedHoverBg: 'rgba(255, 255, 255, 0.22)', // 选中项悬浮背景
  },
};

// 1. 导出的整体统一毛玻璃样式函数
export const getGlassStyle = (mode: boolean) => {
  const config = mode ? GLASS_CONFIG.dark : GLASS_CONFIG.light;
  return {
    backgroundColor: config.bgColor,
    backgroundImage: 'none',
    backdropFilter: `blur(${GLASS_CONFIG.blur})`,
    WebkitBackdropFilter: `blur(${GLASS_CONFIG.blur})`,
    borderColor: 'divider', // 统一使用 MUI 的分割线颜色 (theme.palette.divider)
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  };
};

// 2. 卡片基础配置：随时修改这里的值来调整整体视觉
export const CARD_CONFIG = {
  blur: '4px',
  borderRadius: '4px',
  padding: '10px',

  // 亮色模式配置
  light: {
    color: '#5e6679', // 极深石板灰字（接近黑，高易读性）
    bgColor: 'rgba(255, 255, 255, 0.4)', // 💡 提高到80%的白，盖住齿轮线条干扰
    border: '1px solid rgba(51, 65, 85, 0.12)', // 💡 略微加深的灰色边框，勾勒卡片边缘
  },

  // 暗色模式配置
  dark: {
    color: '#a2b8d0',
    // bgColor: 'rgba(33, 87, 163, 0.05)', // 💡 深暗蓝色半透明（吸附蓝色背景）
    bgColor: 'rgba(30, 48, 80, 0.35)', // 💡 中度蓝色半透明
    border: '1px solid rgba(144, 202, 249, 0.15)', // 💡 微亮蓝色边框，像发光边缘
  },
};

// 2. 导出一致效果的动态样式函数
export const getCardStyle = (isDark: boolean) => {
  const config = isDark ? CARD_CONFIG.dark : CARD_CONFIG.light;

  return {
    color: config.color,
    padding: CARD_CONFIG.padding,
    backgroundColor: config.bgColor,
    backgroundImage: 'none',
    backdropFilter: `blur(${CARD_CONFIG.blur})`,
    WebkitBackdropFilter: `blur(${CARD_CONFIG.blur})`,
    border: config.border,
    borderRadius: CARD_CONFIG.borderRadius,
    // 💡 建议选配：在暗/亮色切换时，让背景色和字体色过渡得更柔和
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };
};

// 💡 3. 新增：滚动条配置
export const SCROLLBAR_CONFIG = {
  dark: {
    track: 'transparent', // 轨道推荐透明，减少视觉割裂
    thumb: 'rgba(255, 255, 255, 0.15)',
    thumbHover: 'rgba(255, 255, 255, 0.3)',
  },
  light: {
    track: 'transparent',
    thumb: 'rgba(0, 0, 0, 0.18)',
    thumbHover: 'rgba(0, 0, 0, 0.3)',
  },
};

// 💡 3. 新增：导出滚动条全局样式对象
export const getScrollbarStyles = (isDark: boolean) => {
  const config = isDark ? SCROLLBAR_CONFIG.dark : SCROLLBAR_CONFIG.light;

  return {
    '::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: config.track,
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: config.thumb,
      borderRadius: '4px',
      border: '1px solid transparent',
      backgroundClip: 'padding-box',
      transition: 'background-color 0.2s ease',
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: config.thumbHover,
    },
    // 火狐浏览器兼容
    '*': {
      scrollbarWidth: 'thin' as const,
      scrollbarColor: `${config.thumb} ${config.track}`,
    },
  };
};

// ==========================================
// 💡 4. 新增：侧边栏专属配置与样式生成器
// ==========================================

export const SIDEBAR_CONFIG = {
  // 统一管理侧边栏的响应式宽度
  widths: {
    expanded: { xs: 180, xl: 256 },
    collapsed: { xs: 60, xl: 72 },
  },
};

// 专门处理侧边栏菜单项 ListItemButton 的样式逻辑
export const getSidebarItemStyle = (isDark: boolean, theme: any) => {
  const config = isDark ? GLASS_CONFIG.dark : GLASS_CONFIG.light;

  return {
    margin: { xs: '3px 4px', xl: '6px 8px' }, // 高分屏自适应间距
    py: { xs: 0.8, xl: 1.5 }, // 高分屏自适应高度
    borderRadius: '4px',
    transition: theme.transitions.create(['background-color', 'color'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shortest,
    }),
    '&.Mui-selected': {
      backgroundColor: config.selectedBg,
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: config.selectedHoverBg,
      },
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '15%',
        height: '70%',
        width: '4px',
        borderRadius: '2px',
        backgroundColor: theme.palette.primary.main,
      },
    },
  };
};
