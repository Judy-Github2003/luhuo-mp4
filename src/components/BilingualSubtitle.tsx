// src/components/BilingualSubtitle.tsx
//
// 中/藏双语字幕组件
//  - 真正贴底（普通 absolute div，不再用 AbsoluteFill）
//  - 第一行: 中文 (zh)
//  - 第二行: 藏文 (bo) — 为空时整行隐藏
//  - 底部半透明深色背景
//  - 不做卡拉 OK 高亮 (整段显示)
//  - 字幕文本/时间由父组件传入 (activeShot), 不直接依赖 JSON
//
// v4 修正: 外层由 AbsoluteFill 改为普通 absolute div, 真正贴底

import React from 'react';

export type BilingualSubtitleProps = {
  zh: string;           // 中文文本 (可空)
  bo?: string;          // 藏文文本 (可空 — 空时只显示中文)
  // 布局参数 (可调)
  fontSizeZh?: number;  // 默认 44
  fontSizeBo?: number;  // 默认 36
  bottom?: number;      // 距底 px, 默认 32
  maxWidthRatio?: number; // 0~1, 默认 0.84
  bgOpacity?: number;   // 0~1, 默认 0.6
};

export const BilingualSubtitle: React.FC<BilingualSubtitleProps> = ({
  zh,
  bo = '',
  fontSizeZh = 44,
  fontSizeBo = 36,
  bottom = 32,
  maxWidthRatio = 0.84,
  bgOpacity = 0.6,
}) => {
  // 都没内容就不渲染
  if (!zh && !bo) return null;

  const hasBoth = Boolean(zh && bo);
  const lineHeight = 1.3;

  // 外层: 普通 absolute div, 真正贴底 (不再用 AbsoluteFill)
  // 避免 AbsoluteFill 撑满全屏导致字幕被 flex 居中到画面中部
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: `rgba(15, 12, 10, ${bgOpacity})`,
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          color: '#f7f3ea',
          display: 'flex',
          flexDirection: 'column',
          gap: hasBoth ? 10 : 0,
          maxWidth: `${maxWidthRatio * 100}%`,
          minWidth: '40%',
          padding: '14px 48px',
          textAlign: 'center',
          textShadow: '0 2px 6px rgba(0,0,0,0.6)',
        }}
      >
        {zh && (
          <div
            style={{
              fontFamily:
                '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
              fontSize: fontSizeZh,
              fontWeight: 700,
              letterSpacing: 0.5,
              lineHeight,
            }}
          >
            {zh}
          </div>
        )}
        {bo && (
          <div
            style={{
              fontFamily:
                '"Noto Sans Tibetan", "Microsoft Himalaya", sans-serif',
              fontSize: fontSizeBo,
              fontWeight: 500,
              letterSpacing: 0,
              lineHeight,
            }}
          >
            {bo}
          </div>
        )}
      </div>
    </div>
  );
};