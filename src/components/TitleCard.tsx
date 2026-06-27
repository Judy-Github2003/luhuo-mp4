// src/components/TitleCard.tsx
//
// 标题卡: 全屏大标题 + 副标题 + 底部署名条
// 用于片头 (kind=title) 和片尾 (kind=ending)

import React from 'react';
import {AbsoluteFill} from 'remotion';

export const TitleCard: React.FC<{
  title: string;
  subtitle?: string;
  byline?: string;
  variant?: 'title' | 'ending';
}> = ({title, subtitle, byline = 'LUHUO HERITAGE', variant = 'title'}) => {
  const isEnding = variant === 'ending';
  return (
    <AbsoluteFill
      style={{
        background: '#151515',
        color: '#f7f3ea',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 装饰: 大色块 + 斜线 */}
      <div
        style={{
          background: '#3a1f1a',
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <svg
        height="1080"
        style={{opacity: 0.25, position: 'absolute'}}
        width="1920"
      >
        {Array.from({length: 14}).map((_, i) => (
          <line
            key={i}
            stroke="#d4a017"
            strokeWidth={1.5}
            x1={-100 + i * 160}
            x2={300 + i * 160}
            y1={200 + i * 60}
            y2={80 + i * 60}
          />
        ))}
      </svg>
      {/* 中央标题 */}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          position: 'absolute',
          width: '100%',
        }}
      >
        {subtitle && (
          <div
            style={{
              color: '#d4a017',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 6,
              marginBottom: 28,
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </div>
        )}
        <div
          style={{
            color: '#f7f3ea',
            fontSize: isEnding ? 60 : 96,
            fontWeight: 850,
            letterSpacing: 2,
            lineHeight: 1.1,
            textAlign: 'center',
            textShadow: '0 6px 30px rgba(0,0,0,0.6)',
            width: 1600,
          }}
        >
          {title}
        </div>
        <div
          style={{
            background: '#d4a017',
            borderRadius: 2,
            height: 4,
            marginTop: 36,
            width: 240,
          }}
        />
        <div
          style={{
            color: 'rgba(247,243,234,0.55)',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 8,
            marginTop: 56,
            textTransform: 'uppercase',
          }}
        >
          {byline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
