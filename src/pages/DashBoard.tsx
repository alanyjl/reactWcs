import { Box, Paper } from '@mui/material';
import { ControlBar } from '../components/ControlBar';
import LogConsole from '../components/LogConsole/LogConsole';
import YCoilList from '../components/conveyor/YCoilList';
import SortingConsole from '../components/SortingConsole';
import { useTheme } from '@mui/material/styles';
import { getCardStyle } from '../theme/sharedStyles';

export default function DashBoard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // 撑满父容器
        gap: { xs: 0.5, xl: 1 },
        overflow: 'hidden', // 💡 核心：防止整个页面出现滚动条，保持应用级单页体验
      }}
    >
      {/* ================= 1. 顶部控制条 (固定高度) ================= */}
      <Paper
        elevation={2}
        sx={{
          height: { xs: '50px', xl: '60px' },
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0, // 💡 防止被其他区域挤扁
          ...getCardStyle(isDark),
        }}
      >
        <ControlBar />
      </Paper>

      {/* ================= 2. 中间线圈列表 (自适应高度) ================= */}
      <Box
        sx={{
          flexGrow: 1, // 💡 核心：自动伸缩填满中间的全部空白空间
          minHeight: 0, // 💡 关键：配合层级计算，允许子元素在空间不足时收缩，防止撑破容器
          overflowY: 'auto', // 💡 当线圈过多时，在这个区域内部滚动，而不是页面的全局滚动
        }}
      >
        <YCoilList />
      </Box>

      {/* ================= 3. 底部日志与控制台 (固定/按比例高度) ================= */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          width: '100%',
          flexShrink: 0, // 💡 保证底部面板的高度保持 220px/300px 不变
        }}
      >
        {/* 左边：固定宽度的监控面板 */}
        <Paper
          sx={{
            p: 2,
            width: { xs: '100%', md: '300px' },
            flexShrink: 0, // 不缩放
            height: { xs: '220px', xl: '300px' },
            display: 'flex',
            flexDirection: 'column',
            ...getCardStyle(isDark),
          }}
        >
          <SortingConsole />
        </Paper>

        {/* 右边：自适应剩余全部空间的日志面板 */}
        <Paper
          sx={{
            p: 2,
            flexGrow: 1,
            height: { xs: '220px', xl: '300px' },
            display: 'flex',
            flexDirection: 'column',
            ...getCardStyle(isDark),
          }}
        >
          <LogConsole />
        </Paper>
      </Box>
    </Box>
  );
}
