import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/DashBoard';
import Trends from '../pages/Trends';
import Logs from '../pages/logs';
import Params from '../pages/Params';
import Activate from '../pages/Activate'; // 🟢 引入你编写的激活码输入页面

import { PATHS } from './paths';
import { RequireAuth } from '../components/RequireAuth'; // 权限验证
import { RequireLicense } from '../components/RequireLicense'; // 🟢 导入授权验证

export const router = createBrowserRouter([
  // 1. 🟢 受授权保护的路由组
  {
    element: <RequireLicense />, // 所有子路由在渲染 MainLayout 前必须通过授权校验
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            path: PATHS.DASHBOARD,
            element: <Dashboard />,
          },
          {
            path: PATHS.TRENDS,
            element: <Trends />,
          },
          {
            path: PATHS.LOGS,
            element: <Logs />,
          },
          {
            path: PATHS.PARAMS,
            element: (
              <RequireAuth>
                <Params />
              </RequireAuth>
            ),
          },
        ],
      },
    ],
  },

  // 2. 🟢 开放的路由：激活页面（这里不需要 RequireLicense，保证未授权时也能访问）
  {
    path: PATHS.ACTIVATE,
    element: <Activate />,
  },

  // 3. 兜底路由
  {
    path: '*',
    element: <Navigate to={PATHS.DASHBOARD} replace />,
  },
]);
