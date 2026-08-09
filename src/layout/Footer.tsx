import { Typography, Chip, Tooltip, Box, useMediaQuery } from '@mui/material';
import { useSignalR } from '../context/SignalRContext';
import { useSystemStatus } from '../context/SystemStatusContext';
import logo from '../assets/logo.png';
import logo2 from '../assets/logo2.png';
import StatusDot from '../theme/StatusDot';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useTheme } from '@mui/material/styles';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { hubConnected } = useSignalR();
  const { deviceStatus, initParams } = useSystemStatus();

  return (
    <>
      {/* 左侧：Logo (在 1080p 屏幕上适当缩小文字) */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={isDark ? logo2 : logo}
          style={{ marginRight: '12px' }}
          // 💡 图片大小自适应
          height={useMediaQuery(theme.breakpoints.up('xl')) ? 28 : 20}
        />
        <Typography
          variant="caption" // 💡 使用更小的 caption
          sx={{
            color: 'text.secondary',
            display: { xs: 'none', lg: 'block' },
            fontSize: { xs: '11px', xl: '13px' },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', xl: 'inline' } }}>
            2016 - {new Date().getFullYear()} © 版权所有---
          </Box>
          版本号: {initParams?.version} 【{initParams?.copyRight}】
        </Typography>
      </Box>

      {/* 中间：PLC 和 SCAN 状态 (去除冗赘字样，改用简写) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Tooltip title={initParams?.plcIp} arrow placement="left">
          <Chip
            icon={<StatusDot status={deviceStatus.plcConnected ? 6 : 1} size={12} />}
            // 💡 高分屏显示 "PLC: OnLine" 完整字样，小屏仅显示 "PLC"
            label={
              useMediaQuery(theme.breakpoints.up('xl'))
                ? `PLC: ${deviceStatus.plcConnected ? 'OnLine' : 'OffLine'}`
                : 'PLC'
            }
            color={deviceStatus.plcConnected ? 'success' : 'error'}
            variant="outlined"
            size="small"
            sx={{
              mr: 2,
              height: { xs: '22px', xl: '28px' }, // 💡 响应式高度
              fontSize: { xs: '11px', xl: '13px' },
              borderRadius: '4px',
              px: 2,
            }}
          />
        </Tooltip>

        <Tooltip title={initParams?.scanIp} arrow placement="right">
          <Chip
            icon={<StatusDot status={deviceStatus.scanStatus} size={12} />}
            label={
              useMediaQuery(theme.breakpoints.up('xl'))
                ? `SCAN: ${deviceStatus.scanStatus >= 3 ? 'OnLine' : 'OffLine'}`
                : 'SCAN'
            }
            color={
              deviceStatus.scanStatus >= 3
                ? 'success'
                : deviceStatus.scanStatus === 0
                  ? 'default'
                  : 'error'
            }
            variant="outlined"
            size="small"
            sx={{
              height: { xs: '22px', xl: '28px' },
              fontSize: { xs: '11px', xl: '13px' },
              borderRadius: '4px',
              px: 2,
            }}
          />
        </Tooltip>
      </Box>

      {/* 右侧：服务连接状态 */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {hubConnected ? (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 'bold', fontSize: { xs: '11px', xl: '13px' } }}
            >
              服务在线
            </Typography>
            <WifiIcon sx={{ ml: 0.5, fontSize: { xs: '16px', xl: '20px' } }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 'bold', fontSize: { xs: '11px', xl: '13px' } }}
            >
              服务断开
            </Typography>
            <WifiOffIcon sx={{ ml: 0.5, fontSize: { xs: '16px', xl: '20px' } }} />
          </Box>
        )}
      </Box>
    </>
  );
}
