import React from 'react';
import { PATHS } from '../router/paths';
import {
  MonitorHeart as MonitorIcon,
  Timeline as ChartIcon,
  SettingsSuggest as SettingsIcon,
  ReportProblem as AlarmIcon,
} from '@mui/icons-material';

export interface MenuItem {
  id: string;
  text: string;
  icon: React.ReactNode;
  path: string; // 💡 新增：路由路径
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', text: '实时监控', icon: <MonitorIcon />, path: PATHS.DASHBOARD },
  { id: 'logs', text: '报警日志', icon: <AlarmIcon />, path: PATHS.LOGS },
  { id: 'trends', text: '历史趋势', icon: <ChartIcon />, path: PATHS.TRENDS },
  { id: 'params', text: '参数设定', icon: <SettingsIcon />, path: PATHS.PARAMS },
];
