import { Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getCardStyle } from '../theme/sharedStyles'; // 💡 导入共享样式

export default function Params() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...getCardStyle(isDark), // 💡 应用统一的毛玻璃样式
      }}
    >
      <Typography>[ 占位：参数设置123 ]</Typography>
    </Paper>
  );
}
