import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyIcon from '@mui/icons-material/Key';
import darkBg from '../assets/darkbg.png';
import { getCardStyle } from '../theme/sharedStyles'; // 💡 导入共享样式

export const Activate: React.FC = () => {
  const [machineCode, setMachineCode] = useState<string>('');
  const [licenseKey, setLicenseKey] = useState<string>(''); // 激活码/注册码
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. 获取机器码 (使用原生 fetch 解析返回的 machineCode)
  useEffect(() => {
    const getMachineCode = async () => {
      try {
        const response = await fetch('/api/license/machine-code');
        if (!response.ok) {
          throw new Error(`HTTP 错误! 状态码: ${response.status}`);
        }
        const data = await response.json();

        // 🟢 匹配后端返回的结构: {"success":true,"machineCode":"DF5DA6B42952D85C"}
        if (data.success && data.machineCode) {
          setMachineCode(data.machineCode);
        } else {
          throw new Error(data.message || '获取机器码解析失败');
        }
      } catch (err: any) {
        setMsg({
          type: 'error',
          text: `无法获取系统机器码: ${err.message || '后端服务未开启'}`,
        });
      } finally {
        setLoading(false);
      }
    };

    getMachineCode();
  }, []);

  // 2. 复制机器码到剪贴板
  const handleCopy = () => {
    navigator.clipboard.writeText(machineCode);
    alert('机器码已复制到剪贴板');
  };

  // 3. 提交激活码
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setSubmitting(true);
    setMsg(null);

    try {
      const response = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }), // 传给后端的字段名根据接口调整
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMsg({ type: 'success', text: '系统激活成功！正在跳转至主页...' });
        // 🚀 激活成功后，刷新页面重新触发 LicenseContext 组件的鉴权
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        throw new Error(data.message || '激活失败，请检查激活码是否正确');
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>正在读取设备机器配置...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: `url(${darkBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Card sx={{ width: 450, p: 2, boxShadow: 3, ...getCardStyle(true) }}>
        <CardContent>
          <Box sx={{ display: 'flex', textAlign: 'center', mb: 2 }}>
            <KeyIcon color="primary" sx={{ fontSize: 50 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, ml: 2 }}>
              WCS 系统授权管理
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            当前系统未激活或授权已过期，请使用机器码获取激活文件。
          </Typography>

          {msg && (
            <Alert severity={msg.type} sx={{ mb: 3 }}>
              {msg.text}
            </Alert>
          )}

          {/* 机器码展示区域 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              borderRadius: 1,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontFamily: 'monospace', flexGrow: 1, wordBreak: 'break-all' }}
            >
              <strong>机器码：</strong>
              {machineCode || '无法读取'}
            </Typography>
            {machineCode && (
              <Tooltip title="复制机器码">
                <IconButton onClick={handleCopy} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* 激活表单 */}
          <form onSubmit={handleActivate}>
            <TextField
              label="请输入激活码"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="请粘贴您的序列号/激活码..."
              disabled={submitting}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={submitting || !machineCode}
            >
              {submitting ? '正在验证激活...' : '立即激活'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Activate;
