import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getCardStyle } from '../theme/sharedStyles'; // 💡 导入共享样式

export default function Trends() {
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
      <Box>
        <Typography>[ 占位：PLC 寄存器地址读写表单 ]</Typography>
      </Box>
    </Paper>
  );
}
