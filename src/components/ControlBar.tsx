import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  ToggleButton,
  Tooltip,
  ToggleButtonGroup,
  Typography,
  Backdrop,
  CircularProgress,
  Portal,
} from '@mui/material';
import { DirectionsRun, FrontHand } from '@mui/icons-material';
import MainLight from './MainLights';
import { usePointStatus } from '../context/PointStatusContext';
import { useSystemStatus } from '../context/SystemStatusContext';
import { useSignalRInvoke } from '../context/useSignalREvent';
import { useSignalR } from '../context/SignalRContext';

export const ControlBar = () => {
  const { initParams } = useSystemStatus();
  const { pointStates } = usePointStatus();
  const { deviceStatus } = useSystemStatus();
  const { hubConnected } = useSignalR();
  const { safeInvoke } = useSignalRInvoke();
  const defaultWay = initParams?.defaultWayOut || '1';

  // 💡 1. Y01 为 true 时，代表线体“正在运转”
  const isRunning = pointStates['Y01'];
  const isPlcConnected = deviceStatus.plcConnected === true;
  const isScanAvailable = isPlcConnected && (deviceStatus.scanStatus ?? 0) >= 3;
  const isHubConnected = hubConnected !== false;

  // 💡 2. 按钮禁用逻辑
  // 启动禁用：未连接后端 OR 未连接PLC OR 线体已经在运转
  const isRunDisabled = !isHubConnected || !isPlcConnected || isRunning;
  // 停止禁用：未连接后端 OR 未连接PLC OR 线体处于静止状态
  const isStopDisabled = !isHubConnected || !isPlcConnected || !isRunning;

  // 💡 3. 控制面板禁用逻辑：未连接后端 OR 未连接PLC
  const isControlDisabled = !isHubConnected || !isPlcConnected;

  const [selectedValue, setValue] = useState('3');
  const [wayOut, setwayOut] = useState(defaultWay);
  const [countdown, setCountdown] = useState(0);

  const isManual = selectedValue === '3';

  // 同步工作模式
  useEffect(() => {
    // 💡 1. 如果线体没有运转，重置为手动模式
    if (!isRunning) {
      setValue('3');
      setwayOut(defaultWay);
      return;
    }

    // 💡 2. 如果线体正在运转，根据 PLC 状态同步模式
    if (isPlcConnected && deviceStatus.scanStatus === 6) {
      setValue('6');
      setwayOut('');
    } else {
      setValue('3'); // 或者是别的状态时默认回手动
      setwayOut(defaultWay);
    }
  }, [isPlcConnected, deviceStatus.scanStatus, isRunning, defaultWay]);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRun = async () => {
    setCountdown(5);
    const success = await safeInvoke('WritePlc', 'M100', [true]);
    if (!success) setCountdown(0);
  };

  const handleStop = () => safeInvoke('WritePlc', 'M99', [true]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    const prevValue = selectedValue;
    const prevWayOut = wayOut;

    setValue(val);
    setwayOut(val === '6' ? '' : defaultWay);

    const success = await safeInvoke('SetWorkMode', Number(val));
    if (!success) {
      setValue(prevValue);
      setwayOut(prevWayOut);
    }
  };

  const handleWayOut = async (_event: React.MouseEvent<HTMLElement>, newWayOut: string | null) => {
    if (newWayOut && newWayOut !== wayOut) {
      const prevWayOut = wayOut;
      setwayOut(newWayOut);
      const success = await safeInvoke('UpdateWayOut', Number(newWayOut), false);
      if (!success) setwayOut(prevWayOut);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3, width: '100%' }}>
      <Tooltip title="启动线体" arrow placement="left">
        <span>
          <IconButton color="success" disabled={isRunDisabled} onClick={handleRun}>
            <DirectionsRun />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="停止运转" arrow placement="right">
        <span>
          <IconButton size="small" color="error" disabled={isStopDisabled} onClick={handleStop}>
            <FrontHand />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 2 }} />

      {/* 工作模式 */}
      <Typography color="text.secondary">工作模式</Typography>
      <RadioGroup row value={selectedValue} onChange={handleChange}>
        <FormControlLabel
          value="3"
          disabled={isControlDisabled || !isRunning}
          control={<Radio color="success" />}
          label="手动"
        />
        <FormControlLabel
          value="6"
          disabled={isControlDisabled || !isScanAvailable || !isRunning}
          control={<Radio color="secondary" />}
          label="扫码"
        />
      </RadioGroup>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 2 }} />

      {/* 通道选择 */}
      <Typography color="text.secondary">通道选择</Typography>
      <ToggleButtonGroup
        value={wayOut}
        size="small"
        exclusive
        onChange={handleWayOut}
        aria-label="通道选择"
        color="secondary"
        disabled={isControlDisabled || !isManual || !isRunning}
      >
        {Array.from({ length: initParams?.wayOutNum || 0 }).map((_, index) => {
          const value = String(index + 1);
          return (
            <ToggleButton key={value} value={value} sx={{ px: 3 }}>
              {value + '#'}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {/* 报警指示灯 */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
        <MainLight />
      </Box>

      {/* 遮罩 */}
      <Portal>
        <Backdrop
          sx={(theme) => ({
            color: '#fff',
            zIndex: theme.zIndex.drawer + 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          })}
          open={countdown > 0}
        >
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">设备正在启动，请稍候... ({countdown}s)</Typography>
        </Backdrop>
      </Portal>
    </Box>
  );
};
