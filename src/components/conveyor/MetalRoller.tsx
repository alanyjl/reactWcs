import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material';

interface MetalRollerProps {
  isRunning: boolean;
}

const CanvasRoller = styled('canvas')({
  width: '8px',
  height: '100%',
  display: 'block',
});

// 使用 React.memo 避免父级重绘导致子级 Canvas 重新实例化
const MetalRoller = React.memo(
  ({ isRunning }: MetalRollerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const rotationOffsetRef = useRef<number>(0);
    const isRunningRef = useRef<boolean>(isRunning);

    useEffect(() => {
      isRunningRef.current = isRunning;
    }, [isRunning]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false }); // 优化性能：关闭透明通道
      if (!ctx) return;

      canvas.width = 16;
      canvas.height = 88;

      const draw = () => {
        const w = canvas.width;
        const h = canvas.height;

        // 1. 绘制背景及渐变
        const metalBg = ctx.createLinearGradient(0, 0, w, 0);
        metalBg.addColorStop(0, '#1a222d');
        metalBg.addColorStop(0.3, '#8fa3b5');
        metalBg.addColorStop(0.5, '#ffffff');
        metalBg.addColorStop(0.7, '#7e92a4');
        metalBg.addColorStop(1, '#111822');
        ctx.fillStyle = metalBg;
        ctx.fillRect(0, 0, w, h);

        // 2. 更新旋转弧度
        if (isRunningRef.current) {
          rotationOffsetRef.current = (rotationOffsetRef.current + 0.15) % (Math.PI * 2);
        }

        // 3. 绘制反光拉丝
        for (let i = 0; i < 3; i++) {
          const angle = rotationOffsetRef.current + (i * Math.PI) / 1.5;
          const xPos = (Math.sin(angle) + 1) / 2;
          const lineX = xPos * w;

          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, Math.cos(angle) * 0.4)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lineX, 0);
          ctx.lineTo(lineX, h);
          ctx.stroke();

          const shadowX = lineX + 1.5;
          ctx.strokeStyle = `rgba(0, 0, 0, ${Math.max(0, Math.cos(angle) * 0.3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(shadowX, 0);
          ctx.lineTo(shadowX, h);
          ctx.stroke();
        }

        // 4. 叠加顶层 3D 柱体弧面阴影
        const glassGlow = ctx.createLinearGradient(0, 0, w, 0);
        glassGlow.addColorStop(0, 'rgba(0,0,0,0.6)');
        glassGlow.addColorStop(0.2, 'rgba(0,0,0,0)');
        glassGlow.addColorStop(0.8, 'rgba(0,0,0,0)');
        glassGlow.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = glassGlow;
        ctx.fillRect(0, 0, w, h);

        // 【核心性能优化】：如果不在运行，画完这一帧就退出循环，不再申请下一帧
        if (isRunningRef.current) {
          animationFrameIdRef.current = requestAnimationFrame(draw);
        } else {
          animationFrameIdRef.current = null;
        }
      };

      // 当 isRunning 从 false 变为 true，且当前没有处于动画循环中时，启动它
      if (isRunning && !animationFrameIdRef.current) {
        draw();
      } else if (!isRunning) {
        // 停止状态时，仅绘制单帧静止画面
        draw();
      }

      return () => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
      };
    }, [isRunning]); // 当运行状态改变时重新评估是否开启循环

    return <CanvasRoller ref={canvasRef} />;
  },
  (prevProps, nextProps) => prevProps.isRunning === nextProps.isRunning,
);

export default MetalRoller;
