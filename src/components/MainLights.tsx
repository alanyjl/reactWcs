import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { usePointStatus } from '../context/PointStatusContext';
import StatusDot, { type LedColorType } from '../theme/StatusDot';

// 💡 1. 抽离配置项（避免在 Render 中重复创建）
const LIGHT_CONFIGS = [
  {
    pointKey: 'Y00',
    activeColor: 'yellow' as LedColorType,
    activeLabel: '待机',
    // 根据是否激活，计算是否闪烁
    getPulse: (active: boolean) => active,
  },
  {
    pointKey: 'Y01',
    activeColor: 'green' as LedColorType,
    activeLabel: '运行中',
    getPulse: (active: boolean) => !active, // 遵循你原有的 !tagStates.run 逻辑
  },
  {
    pointKey: 'Y02',
    activeColor: 'red' as LedColorType,
    activeLabel: '停止',
    getPulse: (active: boolean) => active,
  },
];

export default function MainLights() {
  const { pointStates } = usePointStatus();

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{
        alignItems: 'center',
        flexWrap: 'nowrap',
        pr: 1,
      }}
    >
      {LIGHT_CONFIGS.map(({ pointKey, activeColor, activeLabel, getPulse }) => {
        // 读取当前点位的状态，不存在则默认为 false
        const isActive = !!pointStates[pointKey];

        return (
          <Tooltip key={pointKey} title={isActive ? activeLabel : 'OFF'} arrow placement="top">
            {/* Box 保留，用以支撑 Tooltip 的 Ref 绑定 */}
            <Box>
              <StatusDot
                color={isActive ? activeColor : 'grey'}
                size={24}
                showPulse={getPulse(isActive)}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}
