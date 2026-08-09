import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Tooltip,
  Typography,
  Box,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Collapse,
  Fade,
  Stack,
} from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import DeleteIcon from '@mui/icons-material/Delete';
import TerminalIcon from '@mui/icons-material/Terminal';
import { LogItem } from './LogItem';
import { useSystemLogs } from './useSystemLogs';
import { type SystemLog } from './useSystemLogs';
import { useTheme } from '@mui/material/styles';

type LogFilter = 'all' | SystemLog['level'];

export default function LogConsole() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { logs, clearLogs } = useSystemLogs();

  const [activeTab, setActiveTab] = useState<LogFilter>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 计算各个分类的数量
  const logCounts = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      { info: 0, debug: 0, warning: 0, error: 0 } as Record<SystemLog['level'], number>,
    );
  }, [logs]);

  // 根据分类过滤日志列表
  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') return logs;
    return logs.filter((log) => log.level === activeTab);
  }, [logs, activeTab]);

  // 自动滚动到最新日志 (如果是新日志在最底下，用 scrollHeight；如果在首行，用 0)
  useEffect(() => {
    if (scrollRef.current) {
      // 💡 如果你的日志是最新一条置顶，用 0：
      scrollRef.current.scrollTop = 0;
      // 💡 如果你的日志是新的一条在最下面追加，用这行：
      // scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%', // 💡 让容器占满外层 Paper 的 100% 高度
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 头部区域 (固定高度，不参与缩放) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0, // 💡 防止头部被下方滚动区域压缩
          pb: 1.5, // 💡 用 pb 代替子元素的 mb，确保所有元素完美垂直居中对齐
          borderBottom: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Stack direction="row" spacing={1}>
          <TerminalIcon color="info" sx={{ fontSize: '1.3rem' }} />
          <Typography
            color="info"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 'bold',
              letterSpacing: 0.5,
            }}
          >
            系统实时日志
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 24,
              height: 24,
              '& .MuiTab-root': {
                minHeight: 24,
                height: 24,
                py: 0,
                px: 1.2,
                fontSize: '0.75rem',
                color: isDark ? '#858585' : '#757575',
                '&.Mui-selected': {
                  color: isDark ? '#3b98ca' : '#1976d2',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: isDark ? '#3b98ca' : '#1976d2',
              },
            }}
          >
            <Tab
              value="all"
              label={
                <Badge
                  badgeContent={logs.length}
                  color="primary"
                  max={99}
                  slotProps={{
                    badge: { style: { transform: 'scale(0.65) translate(18px, -4px)' } },
                  }}
                >
                  全部
                </Badge>
              }
            />
            <Tab
              value="info"
              label={
                <Badge
                  badgeContent={logCounts.info}
                  color="info"
                  max={99}
                  slotProps={{
                    badge: { style: { transform: 'scale(0.65) translate(18px, -4px)' } },
                  }}
                >
                  Info
                </Badge>
              }
            />
            <Tab
              value="debug"
              label={
                <Badge
                  badgeContent={logCounts.debug}
                  max={99}
                  slotProps={{
                    badge: {
                      style: {
                        transform: 'scale(0.65) translate(18px, -4px)',
                        backgroundColor: isDark ? '#555' : '#bdbdbd',
                        color: '#fff',
                      },
                    },
                  }}
                >
                  Debug
                </Badge>
              }
            />
            <Tab
              value="warning"
              label={
                <Badge
                  badgeContent={logCounts.warning}
                  color="warning"
                  max={99}
                  slotProps={{
                    badge: { style: { transform: 'scale(0.65) translate(18px, -4px)' } },
                  }}
                >
                  Warn
                </Badge>
              }
            />
            <Tab
              value="error"
              label={
                <Badge
                  badgeContent={logCounts.error}
                  color="error"
                  max={99}
                  slotProps={{
                    badge: { style: { transform: 'scale(0.65) translate(18px, -4px)' } },
                  }}
                >
                  Error
                </Badge>
              }
            />
          </Tabs>

          <Tooltip title="清空日志" arrow placement="top" enterDelay={300}>
            <IconButton size="small" color="error" onClick={clearLogs} sx={{ p: 0.5 }}>
              <DeleteIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 日志内容区域 (自适应剩余高度) */}
      <Box
        ref={scrollRef}
        sx={{
          flexGrow: 1, // 💡 动态吃掉剩余全部高度
          height: 0, // 💡 配合 flexGrow，防止内容撑爆容器，确保滚动条能在组件内部正常工作
          overflowY: 'auto',
          mt: 1,
          fontFamily: 'Consolas, Monaco, Courier New, monospace',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
        }}
      >
        <TransitionGroup component={null}>
          {filteredLogs.map((log) => (
            <Collapse key={log.id} timeout={{ enter: 300, exit: 200 }}>
              <Fade in={true} timeout={250}>
                <div style={{ paddingBottom: '4px', transformOrigin: 'top' }}>
                  <LogItem log={log} isDark={isDark} />
                </div>
              </Fade>
            </Collapse>
          ))}
        </TransitionGroup>

        {filteredLogs.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography sx={{ color: isDark ? 'grey.700' : 'grey.400', fontSize: '1.25rem' }}>
              暂无 {activeTab !== 'all' ? `[${activeTab.toUpperCase()}] ` : ''}实时日志...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
