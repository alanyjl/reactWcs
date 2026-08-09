import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/DashBoard';
import Trends from '../pages/Trends';
import Logs from '../pages/logs';
import Params from '../pages/Params';

import { PATHS } from './paths'; // 💡 引入路径
import { RequireAuth } from '../components/RequireAuth'; //权限验证

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: PATHS.DASHBOARD, // 💡 使用常量
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
  // 后续新增页面，在这里继续添加
]);
