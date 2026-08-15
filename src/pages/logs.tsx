import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Collapse,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getCardStyle } from '../theme/sharedStyles'; // 💡 导入共享样式
import { myFetch } from '../utils/request';

interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  renderedMessage: string;
  exception?: string | null;
  properties?: string | null;
}

// 统一的列宽定义 (5列：展开按钮、级别、时间、内容、操作)
const GRID_TEMPLATE = '40px 120px 140px 1fr 70px';

const getLevelColor = (level: string) => {
  switch (level?.toUpperCase()) {
    case 'FATAL':
    case 'ERROR':
      return { main: '#f44336', light: 'rgba(244, 67, 54, 0.08)' };
    case 'WARN':
    case 'WARNING':
      return { main: '#ff9800', light: 'rgba(255, 152, 0, 0.08)' };
    case 'INFO':
    case 'INFORMATION':
      return { main: '#4caf50', light: 'rgba(33, 150, 243, 0.08)' };
    case 'DEBUG':
      return { main: '#9e9e9e', light: 'rgba(76, 175, 80, 0.04)' };
    default:
      return { main: '#9e9e9e', light: 'rgba(158, 158, 158, 0.04)' };
  }
};

// 单个日志行 (基于 CSS Grid)
const LogRow = ({
  log,
  isDark,
  handleCopy,
}: {
  log: LogEntry;
  isDark: boolean;
  handleCopy: (log: LogEntry) => void;
}) => {
  const [open, setOpen] = useState(false);
  const colors = getLevelColor(log.level);

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        // 左侧日志级别指示线
        borderLeft: `4px solid ${colors.main}`,
        maxHeight: 400,
        backgroundColor: open ? (isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa') : 'transparent',
      }}
    >
      {/* 日志行主体 */}
      <Box
        onClick={() => log.exception && setOpen(!open)}
        sx={{
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          alignItems: 'center',
          py: 0.8,
          px: 1,
          cursor: log.exception ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          },
        }}
      >
        {/* 1. 折叠按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {log.exception && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              {open ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>

        {/* 2. 级别 */}
        <Box>
          <Chip
            label={log.level.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: colors.main,
              color: '#fff',
              border: `1px solid ${colors.main}40`,
              fontWeight: 'bold',
              borderRadius: '4px',
              fontSize: '0.6rem',
              py: 1.3,
              height: 20,
              width: 90,
            }}
          />
        </Box>

        {/* 3. 时间戳 */}
        <Box sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {new Date(log.timestamp).toLocaleString()}
        </Box>

        {/* 4. 日志消息 */}
        <Box
          sx={{
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: colors.main,
            pr: 2,
          }}
        >
          {log.renderedMessage}
        </Box>

        {/* 5. 操作 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Tooltip title="复制日志">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(log);
              }}
            >
              <CopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 折叠的 Exception 堆栈面板 */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box
          sx={{
            p: 2,
            m: '0px 16px 12px 48px', // 避开左侧按钮的缩进
            bgcolor: isDark ? '#1a1a1c' : '#fcfcfd',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: isDark ? '#2d2d30' : '#e0e0e0',
          }}
        >
          <Typography
            variant="subtitle2"
            gutterBottom
            color="error"
            sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            Exception Details:
          </Typography>
          <Typography
            component="pre"
            sx={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.75rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: isDark ? '#ff8a80' : '#c62828',
              m: 0,
            }}
          >
            {log.exception}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default function Logs() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  console.log('当前是否暗黑模式:', isDark); // 👈 打开控制台看看切换时有没有打印 output
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [limit, setLimit] = useState<number>(50);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await myFetch(`/api/logs?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort(
          (a: LogEntry, b: LogEntry) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setLogs(sortedData);
      }
    } catch (error) {
      console.error('获取 SQLite 日志失败:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = levelFilter === 'ALL' || log.level.toUpperCase() === levelFilter;
      const matchesSearch =
        searchQuery === '' ||
        log.renderedMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.exception?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [logs, levelFilter, searchQuery]);

  const handleCopy = (log: LogEntry) => {
    const text = `[${log.timestamp}] [${log.level}] ${log.renderedMessage}\n${log.exception || ''}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <Box
      sx={{
        maxHeight: 'calc(100vh - 120px)',
        '@media (min-width: 1920px)': {
          maxHeight: 'calc(100vh - 150px)', // 💡 仅在分辨率宽度 >= 1920px 时才显示
        },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 2,
        ...getCardStyle(isDark), // 💡 应用统一的毛玻璃样式
      }}
    >
      {/* 1. 头部筛选区 */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 'auto' }}>
          系统日志排查
        </Typography>

        <FormControl size="small" variant="outlined" sx={{ width: 140 }}>
          <InputLabel>获取条数</InputLabel>
          <Select value={limit} onChange={(e) => setLimit(Number(e.target.value))} label="获取条数">
            <MenuItem value={50}>最近 50 条</MenuItem>
            <MenuItem value={100}>最近 100 条</MenuItem>
            <MenuItem value={300}>最近 300 条</MenuItem>
            <MenuItem value={500}>最近 500 条</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" variant="outlined" sx={{ width: 130 }}>
          <InputLabel>日志级别</InputLabel>
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            label="日志级别"
          >
            <MenuItem value="ALL">全部级别</MenuItem>
            <MenuItem value="INFORMATION">INFO</MenuItem>
            <MenuItem value="DEBUG">DEBUG</MenuItem>
            <MenuItem value="WARNING">WARN</MenuItem>
            <MenuItem value="ERROR">ERROR</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          sx={{ width: 240 }}
          placeholder="搜索消息/堆栈..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          disabled={loading}
          onClick={fetchLogs}
        >
          刷新
        </Button>
      </Box>

      {/* 2. 列表内容区 (用原生 CSS Sticky 控制表头) */}
      <Box
        // 💡 关键核心：使用 key 强制 React 在切换主题时重建这个组件，从而重绘整个滚动条
        key={isDark ? 'scroll-container-dark' : 'scroll-container-light'}
        sx={{
          flexGrow: 1,
          mt: 2,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '4px',
          // 之前你的透明度背景写法
          bgcolor: isDark ? '#1e1e1e20' : '#ffffff30',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? '#424242' : '#c1c1c1',
            borderRadius: '3px',
          },
        }}
      >
        {/* 💡 绝对靠谱的 100% 响应式 Sticky 表头 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: GRID_TEMPLATE,
            alignItems: 'center',
            p: 1,
            position: 'sticky',
            top: 0,
            zIndex: 2,
            backgroundColor: isDark ? '#1b3e7a' : '#f0f2f5', // 完美响应亮暗主题切换
            color: isDark ? '#bfbfbf' : '#8a8888',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            borderBottom: '1px solid',
            borderColor: isDark ? '#3c6ebf' : '#dcdfe6',
          }}
        >
          <Box />
          <Box>级别</Box>
          <Box>时间戳</Box>
          <Box>日志内容</Box>
          <Box sx={{ textAlign: 'left', pr: 2 }}>操作</Box>
        </Box>

        {/* 列表数据 */}
        {filteredLogs.length === 0 ? (
          <Box sx={{ py: 8, textColr: 'text.secondary', textAlign: 'center' }}>
            <Typography sx={{ color: '#888', fontStyle: 'italic' }}>
              {loading ? '正在从 SQLite 读取数据...' : '没有找到符合筛选条件的日志记录'}
            </Typography>
          </Box>
        ) : (
          filteredLogs.map((log) => (
            <LogRow key={log.id} log={log} isDark={isDark} handleCopy={handleCopy} />
          ))
        )}
      </Box>
    </Box>
  );
}
