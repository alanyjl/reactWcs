import React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

// ==========================================
// 1. 静态样式配置 (3D 高仿真 LED 效果)
// ==========================================

const BASE_LED_STYLE = {
  borderRadius: '50%',
  position: 'relative' as const,
  display: 'inline-block',
  transition: 'all 0.3s ease',
  willChange: 'opacity, box-shadow, filter', // 优化低配工控机显卡渲染
  cursor: 'pointer',
};

const SIZE_VARIANTS = {
  small: 12,
  default: 18,
  large: 24,
};

// 💡 优化项：为每种颜色分别配置“最亮状态(boxShadow)”和“微弱状态(pulseShadow)”
const COLOR_VARIANTS = {
  grey: {
    bgColor: '#8e8e93',
    background: 'radial-gradient(circle at 30% 30%, #e5e5ea 0%, #8e8e93 60%, #4a4a4d 100%)',
    boxShadow: `
      inset 1px 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.4),
      0 1px 1px rgba(0, 0, 0, 0.3)
    `,
    pulseShadow: `
      inset 1px 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.4),
      0 1px 1px rgba(0, 0, 0, 0.3)
    `,
  },
  green: {
    bgColor: '#00ff88',
    background: 'radial-gradient(circle at 30% 30%, #b3ffd9 0%, #00ff88 65%, #009952 100%)',
    boxShadow: `
      0 0 6px #00ff88,
      0 0 12px rgba(0, 255, 136, 0.6),
      inset 1px 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.2)
    `,
    pulseShadow: `
      0 0 2px #00ff88,
      0 0 4px rgba(0, 255, 136, 0.2),
      inset 1px 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.2)
    `, // 💡 绿灯呼吸暗部仅保留微弱绿光，绝不夹杂其他颜色
  },
  red: {
    bgColor: '#ff3b30',
    background: 'radial-gradient(circle at 30% 30%, #ff9d96 0%, #ff3b30 65%, #ad140b 100%)',
    boxShadow: `
      0 0 6px #ff3b30,
      0 0 12px rgba(255, 59, 48, 0.6),
      inset 1px 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.2)
    `,
    pulseShadow: `
      0 0 2px #ff3b30,
      0 0 4px rgba(255, 59, 48, 0.2),
      inset 1px 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.2)
    `,
  },
  yellow: {
    bgColor: '#f6d243',
    background: 'radial-gradient(circle at 30% 30%, #fce792 0%, #f6d243 65%, #daaf07 100%)',
    boxShadow: `
      0 0 8px #ffcc00,
      0 0 15px rgba(255, 204, 0, 0.6),
      inset 0 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.2)
    `,
    pulseShadow: `
      0 0 3px #ffcc00,
      0 0 6px rgba(255, 204, 0, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.8),
      inset -1px -1px 1px rgba(0, 0, 0, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.2)
    `,
  },
  disabled: {
    bgColor: '#9e9e9e',
    background: 'radial-gradient(circle at 30% 30%, #e2e2e2 0%, #9e9e9e 60%, #6e6e6e 100%)',
    boxShadow: 'none',
    pulseShadow: 'none',
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};

// ==========================================
// 2. 类型定义
// ==========================================

export type LedColorType = keyof typeof COLOR_VARIANTS;
export type LedSizeType = keyof typeof SIZE_VARIANTS;

interface StatusDotProps {
  status?: number;
  color?: LedColorType;
  size?: LedSizeType | number;
  showPulse?: boolean;
  pulseDuration?: 'fast' | 'normal' | 'slow' | string;
  sx?: SxProps<Theme>;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// ==========================================
// 3. React 组件定义
// ==========================================

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  color,
  size = 'default',
  showPulse,
  pulseDuration,
  sx = {},
  onClick,
}) => {
  let resolvedColor: LedColorType = 'grey';
  let defaultDuration = 'none';

  if (status !== undefined) {
    if (status >= 3) {
      resolvedColor = 'green';
      defaultDuration = '2.5s';
    } else if (status === 0) {
      resolvedColor = 'grey';
      defaultDuration = 'none';
    } else if (status === 2) {
      resolvedColor = 'red';
      defaultDuration = 'none';
    } else {
      resolvedColor = 'red';
      defaultDuration = '0.5s';
    }
  } else if (color) {
    resolvedColor = color;
    const pulseMapping: Record<LedColorType, string> = {
      green: '2.5s',
      red: '0.5s',
      yellow: '1s',
      grey: 'none',
      disabled: 'none',
    };
    defaultDuration = pulseMapping[resolvedColor];
  }

  const speedMap: Record<string, string> = {
    fast: '0.5s',
    normal: '1.5s',
    slow: '3s',
  };

  const finalDuration =
    (pulseDuration && speedMap[pulseDuration]) || pulseDuration || defaultDuration;

  const shouldAnimate = showPulse !== undefined ? showPulse : finalDuration !== 'none';

  const pixelSize = typeof size === 'number' ? size : SIZE_VARIANTS[size];
  const colorSpec = COLOR_VARIANTS[resolvedColor];

  // 💡 核心修复：为每组指示灯创建动态唯一的 CSS Keyframe 名字，避免冲突覆盖
  const animationName = `led-pulse-${resolvedColor}`;

  return (
    <Box
      onClick={onClick}
      sx={{
        ...BASE_LED_STYLE,
        width: pixelSize,
        height: pixelSize,
        background: colorSpec.background,
        boxShadow: colorSpec.boxShadow,
        opacity: resolvedColor === 'disabled' ? 0.4 : 1,
        pointerEvents: resolvedColor === 'disabled' ? 'none' : 'auto',

        // 绑定隔离后的动画名
        animation: shouldAnimate
          ? `${animationName} ${finalDuration} ease-in-out infinite`
          : 'none',

        [`@keyframes ${animationName}`]: {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)',
            boxShadow: colorSpec.boxShadow, // 最亮状态发光
          },
          '50%': {
            opacity: 0.8,
            transform: 'scale(0.93)',
            boxShadow: colorSpec.pulseShadow, // 💡 呼吸波谷时，使用自己颜色的 dimmed 阴影
          },
        },
        ...sx,
      }}
    />
  );
};

export default StatusDot;
