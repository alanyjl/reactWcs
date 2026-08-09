import { useState, useEffect } from 'react';
import { useSignalREvent } from '../context/useSignalREvent';
import { Typography, Box, Chip, Avatar, Stack, Paper, Divider } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { useSystemStatus } from '../context/SystemStatusContext';

interface SortingStatusDto {
  mode: string;
  wayId: number;
  barcode: string;
  timestamp: string;
}

export default function SortingConsole() {
  const [sortingData, setSortingData] = useState<SortingStatusDto | null>(null);
  const { deviceStatus, initParams } = useSystemStatus();

  const scanStatus = deviceStatus.scanStatus;
  const defaultWay = initParams?.defaultWayOut || initParams?.defaultWayOut || '1';

  // 💡 1. 当工作模式（scanStatus）发生变化时，清空历史推送状态
  useEffect(() => {
    setSortingData(null);
  }, [scanStatus]);

  // 💡 2. 持续监听后端推送（无论是手动切换了通道，还是自动扫码成功，都会接收）
  useSignalREvent<[string, number, string]>('ReceiveSortingStatus', (mode, wayId, barcode) => {
    setSortingData({
      mode,
      wayId,
      barcode,
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  // 💡 3. 构建统一的显示逻辑
  const displayData: SortingStatusDto | null = (() => {
    if (scanStatus === 3) {
      // 手动模式：始终显示出口面板
      return {
        mode: sortingData?.mode || 'Manual',
        // 优先使用后端推送的实时通道，若没有则回退到系统默认参数通道
        wayId: sortingData?.wayId ?? Number(defaultWay),
        // 手动模式下若无条码，显示说明文字
        barcode: sortingData?.barcode || '手动直通模式',
        timestamp: sortingData?.timestamp || new Date().toLocaleTimeString(),
      };
    }

    if (scanStatus === 6) {
      // 扫码模式：只有存在推送数据时才进行展示，否则返回 null 触发等待扫码占位状态
      return sortingData;
    }

    return null;
  })();

  return (
    <Box sx={{ width: '100%' }}>
      {/* 头部 */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <CropFreeIcon color="info" sx={{ mr: 0.5, fontSize: '1.3rem' }} />
        <Typography
          color="info"
          sx={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: 0.5 }}
        >
          扫码分拣监控
        </Typography>
      </Stack>

      {displayData ? (
        // === 有数据状态（显示分配成功的出口通道） ===
        <Box>
          {/* 第一区：状态与出口 */}
          <Stack direction="row">
            <Stack direction="row" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: 'success.light',
                  color: 'success.dark',
                  width: 42,
                  height: 42,
                  fontSize: '1.5rem',
                  fontWeight: 800,
                }}
              >
                <MeetingRoomIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  分配目标出口
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
                  {displayData.wayId}{' '}
                  <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>号口</span>
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<SettingsSuggestIcon />}
              label={displayData.mode === 'Auto' ? '自动分配' : '手动指定'}
              color={displayData.mode === 'Auto' ? 'primary' : 'warning'}
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderRadius: 1,
                ml: 'auto',
              }}
            />
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* 第二区：扫码结果 */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              当前读取条码
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                bgcolor: 'action.hover',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: 2,
                  minHeight: 30,
                }}
              >
                {displayData.barcode}
              </Typography>
            </Paper>
          </Box>

          {/* 第三区：页脚信息 */}
          <Stack direction="row" sx={{ mt: 2 }}>
            <Stack direction="row" spacing={0.5} sx={{ color: 'success.main' }}>
              <CheckCircleIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 600, pr: 1 }}>
                已分配
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              更新时间：{displayData.timestamp}
            </Typography>
          </Stack>
        </Box>
      ) : (
        // === 无数据占位状态（扫码模式下还未开始扫码） ===
        <Stack spacing={2} sx={{ py: 2, alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.1)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 0.7 },
              },
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            等待箱体扫码中...
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              textAlign: 'center',
              display: 'none',
              '@media (min-width: 1920px)': {
                display: 'block',
              },
            }}
          >
            在线通道已开启，正在自动监听扫描状态
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
