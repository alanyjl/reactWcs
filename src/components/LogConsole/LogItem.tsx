import { memo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { type SystemLog } from './useSystemLogs';

interface LogItemProps {
  log: SystemLog;
  isDark: boolean;
}

const getLevelConfig = (level: SystemLog['level'], isDark: boolean) => {
  switch (level) {
    case 'error':
      return { color: 'error' as const, label: 'Error', hexColor: isDark ? '#f44336' : '#d32f2f' };
    case 'warning':
      return { color: 'warning' as const, label: 'Warn', hexColor: isDark ? '#ff9800' : '#b26a00' };
    case 'debug':
      return {
        color: 'default' as const,
        label: 'Debug',
        hexColor: isDark ? '#9e9e9e' : '#666666',
      };
    case 'info':
    default:
      return { color: 'info' as const, label: 'Info', hexColor: isDark ? '#03a9f4' : '#0288d1' };
  }
};

export const LogItem = memo(({ log, isDark }: LogItemProps) => {
  const config = getLevelConfig(log.level, isDark);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        // 💡 恢复为正常的内边距，MUI 会完美接管动画
        py: 0.6,
        borderBottom: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <Typography variant="caption" sx={{ color: '#858585', whiteSpace: 'nowrap', mt: 0.2 }}>
        【{log.time}】
      </Typography>

      <Chip
        size="small"
        color={config.color}
        label={config.label}
        sx={{
          borderRadius: 1,
          fontSize: '0.7rem',
          height: 18,
          fontWeight: 'bold',
          minWidth: 52,
        }}
      />

      <Typography
        variant="body2"
        sx={{
          color: config.hexColor,
          wordBreak: 'break-all',
        }}
      >
        {log.message}
      </Typography>
    </Box>
  );
});

LogItem.displayName = 'LogItem';
