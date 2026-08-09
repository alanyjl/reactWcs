import { useMemo } from 'react';
import { usePointStatus } from '../context/PointStatusContext';
import { Tooltip, Box } from '@mui/material';
import StatusDot from '../theme/StatusDot';

interface XCoilProps {
  open: boolean; // 💡 接收展开状态用来调整内部对齐
}

export default function XCoil({ open }: XCoilProps) {
  const { pointStates } = usePointStatus();

  const filteredXPoints = useMemo(() => {
    return Object.keys(pointStates)
      .filter((key) => key.startsWith('X') || key.startsWith('x'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10);
        const numB = parseInt(b.replace(/\D/g, ''), 10);

        if (isNaN(numA) || isNaN(numB)) {
          return a.localeCompare(b);
        }
        return numA - numB;
      });
  }, [pointStates]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row', // 💡 改为横向流式布局
        flexWrap: 'wrap', // 💡 换行排列
        gap: 1, // 💡 点位之间的间距保持合适
        justifyContent: open ? 'flex-start' : 'center', // 💡 展开时靠左，收缩时居中对齐
        p: open ? 1 : 0.5, // 💡 动态内边距
        transition: 'padding 0.3s ease',
      }}
    >
      {filteredXPoints.map((address) => {
        const isOn = pointStates[address];
        const state = isOn ? 1 : 0;

        return (
          <Tooltip title={address} arrow placement="right" enterDelay={300} key={address}>
            {/* 💡 包裹一层 Box 防止由于 hover/flex 挤压导致 LED 变形 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StatusDot status={state} size={14} showPulse={false} />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
