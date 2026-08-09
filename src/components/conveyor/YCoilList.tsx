import React, { useMemo } from 'react';
import { Box, Typography, Stack, Skeleton } from '@mui/material';

import { usePointStatus } from '../../context/PointStatusContext';
import { useSystemStatus } from '../../context/SystemStatusContext';
import MetalRoller from './MetalRoller';

// 导入抽离的样式组件
import {
  StatusPanel,
  HighlightValue,
  ConveyorBeltContainer,
  GlassReflection,
} from './YcoilList.styles';
import StatusDot from '../../theme/StatusDot';
// ================= 子组件：单个传送带单元 =================
interface ConveyorItemProps {
  address: string;
  state: boolean;
}

const ConveyorItem = React.memo(
  ({ address, state }: ConveyorItemProps) => {
    const rollersArray = useMemo(() => Array.from({ length: 9 }), []);

    return (
      <Stack
        spacing={0.5}
        sx={{
          flex: 1,
          minWidth: '65px',
          width: 0,
          perspective: '400px',
        }}
      >
        <StatusDot color={state ? 'green' : 'grey'} size={7} showPulse={state} />
        <ConveyorBeltContainer isRunning={state}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              zIndex: 2,
              flexWrap: 'nowrap',
            }}
          >
            {rollersArray.map((_, index) => (
              <MetalRoller key={index} isRunning={state} />
            ))}
          </Box>
          <GlassReflection />
        </ConveyorBeltContainer>

        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          {address}
        </Typography>
      </Stack>
    );
  },
  (prev, next) => prev.state === next.state && prev.address === next.address,
);

// ================= 主组件 =================
export default function YCoilList() {
  const pointStatusContext = usePointStatus();

  const pointStates = useMemo(() => {
    return (pointStatusContext?.pointStates || {}) as Record<string, boolean>;
  }, [pointStatusContext?.pointStates]);

  const { initParams } = useSystemStatus();
  const startY = initParams?.startY;
  const endY = initParams?.endY;

  const yPointsList = useMemo(() => {
    if (startY === undefined || endY === undefined) return [];

    return Object.keys(pointStates)
      .filter((address) => {
        const match = address.match(/^Y(\d+)$/i);
        if (!match) return false;
        const num = parseInt(match[1], 10);
        return num >= startY && num <= endY;
      })
      .map((address) => ({
        address: address.toUpperCase(),
        state: !!pointStates[address],
      }))
      .sort((a, b) =>
        a.address.localeCompare(b.address, undefined, { numeric: true, sensitivity: 'base' }),
      );
  }, [pointStates, startY, endY]);

  const isY01Running = useMemo(() => {
    return !!(pointStates['Y01'] || pointStates['y01']);
  }, [pointStates]);

  if (startY === undefined || endY === undefined) {
    return (
      <Box sx={{ my: 3 }}>
        <Skeleton variant="rectangular" width={220} height={36} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={80} />
      </Box>
    );
  }

  return (
    <Box sx={{ my: { xs: 2, xl: 3 } }}>
      {/* 顶部数字状态面板 */}
      <StatusPanel>
        <Box component="span" sx={{ color: '#8da2bf', fontSize: { xs: '13px', xl: '14px' } }}>
          线体速度:
        </Box>
        <HighlightValue>{isY01Running ? '0.5 m/s' : '0.0 m/s'}</HighlightValue>
        <Box
          component="span"
          sx={{ color: '#8da2bf', pl: 1, fontSize: { xs: '13px', xl: '14px' } }}
        >
          负载率:
        </Box>
        <HighlightValue>{isY01Running ? '42%' : '0%'}</HighlightValue>
      </StatusPanel>

      {/* 输送线侧板网格 */}
      <Box
        className="conveyor-wrapper"
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          width: '100%',
          py: 1,
          gap: 0.1,
        }}
      >
        {yPointsList.map((point) => (
          <ConveyorItem key={point.address} address={point.address} state={point.state} />
        ))}
      </Box>
    </Box>
  );
}
