import { Box, styled } from '@mui/material';

// 1. 状态控制面板 (适配亮暗色)
export const StatusPanel = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    maxWidth: '320px',
    fontFamily: 'Consolas, monospace',
    padding: '8px',
    borderRadius: '4px',
    border: isDark ? '1px solid rgba(0, 162, 255, 0.2)' : '1px solid rgba(0, 82, 204, 0.15)',
    backdropFilter: 'blur(2px)',
    marginBottom: theme.spacing(2),
  };
});

// 2. 高亮数值文本 (亮色下调深颜色，防止识别疲劳)
export const HighlightValue = styled('span')(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    color: isDark ? '#00ffaa' : '#009e60', // 亮色使用较深的绿
    textShadow: isDark ? '0 0 8px rgba(0, 255, 170, 0.6)' : '0 0 4px rgba(0, 158, 96, 0.15)',
    fontWeight: 'bold',
    margin: '0 12px',
  };
});

// 3. 输送线侧板外框 (亮色下模拟银白色铝型材)
export const ConveyorBeltContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRunning',
})<{ isRunning: boolean }>(({ theme, isRunning }) => {
  const isDark = theme.palette.mode === 'dark';

  // 运行中和静止时对应的边框及发光样式
  const runningBorder = isDark ? 'rgba(0, 255, 170, 0.6)' : 'rgba(46, 125, 50, 0.5)';
  const staticBorder = isDark ? 'rgba(0, 162, 255, 0.3)' : 'rgba(0, 0, 0, 0.12)';

  const activeShadow = isDark
    ? '0 0 10px rgba(0, 255, 170, 0.25), inset 0 0 8px rgba(0, 255, 170, 0.1)'
    : '0 2px 6px rgba(46, 125, 50, 0.15), inset 0 0 4px rgba(46, 125, 50, 0.05)';

  const staticShadow = isDark
    ? '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.05)'
    : '0 2px 6px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.8)';

  return {
    position: 'relative',
    height: '44px',
    background: isDark
      ? 'linear-gradient(180deg, rgba(10, 37, 71, 0.2) 0%, rgba(5, 19, 39, 0.4) 100%)'
      : 'linear-gradient(180deg, #f0f4f8 0%, #d9e2ec 100%)', // 亮色改为淡钢灰色渐变
    border: isRunning ? `1px solid ${runningBorder}` : `1px solid ${staticBorder}`,
    borderRadius: '1px',
    padding: '2px 5px',
    boxShadow: isRunning ? activeShadow : staticShadow,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    transition: 'all 0.3s ease',
  };
});

// 4. 玻璃镜面覆盖层 (亮色下调低高光反射度，防耀眼)
export const GlassReflection = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isDark
      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 30%, rgba(0, 0, 0, 0.2) 85%, rgba(0, 0, 0, 0.4) 100%)'
      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 40%, rgba(0, 0, 0, 0.05) 85%, rgba(0, 0, 0, 0.1) 100%)',
    pointerEvents: 'none',
    zIndex: 3,
  };
});
