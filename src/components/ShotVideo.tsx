// src/components/ShotVideo.tsx
//
// 单镜头视觉层: 三种 visual.type
//   1. "color-block"  : 纯色 + accent 装饰 (无素材占位)
//   2. "image"        : Remotion <Img> + staticFile, 满铺 cover
//   3. "video"        : Remotion <OffthreadVideo> + staticFile, 满铺 cover, 静音
//
// 缺失/未配置: 自动回退到 color-block (effectiveType 由 verify-assets.mjs 写入)
//
// 视觉数据 (来自 shots.json shot.visual):
//   {
//     type:        "color-block" | "image" | "video",
//     effectiveType?: 上面的某值 (verify-assets.mjs 写入),
//     background?:  颜色块背景色 (color-block 模式),
//     accent?:      颜色块装饰色 (color-block 模式),
//     src?:         "images/shot-02.png" 或 "videos/shot-03.mp4" (相对 public/),
//     muted?:       boolean, video 模式默认 true,
//     showTitle?:   boolean, image/video 模式下是否叠加标题 (默认 false)
//   }

import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';

export type ShotVisual = {
  type: string;
  effectiveType?: string;
  background?: string;
  accent?: string;
  src?: string;
  muted?: boolean;
  showTitle?: boolean;
  [k: string]: unknown;
};

const ColorBlock: React.FC<{
  bg: string;
  accent: string;
  title?: string;
  subtitle?: string;
}> = ({bg, accent, title, subtitle}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    <div
      style={{
        background: accent,
        borderRadius: 4,
        height: 6,
        left: 120,
        opacity: 0.85,
        position: 'absolute',
        top: 80,
        width: 200,
      }}
    />
    <svg
      height="1080"
      style={{opacity: 0.18, position: 'absolute'}}
      width="1920"
    >
      {Array.from({length: 12}).map((_, i) => (
        <line
          key={i}
          stroke={accent}
          strokeWidth={1.5}
          x1={-100 + i * 180}
          x2={200 + i * 180}
          y1={120 + i * 64}
          y2={20 + i * 64}
        />
      ))}
    </svg>
    {title && (
      <div
        style={{
          color: '#f7f3ea',
          fontFamily:
            '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: 76,
          fontWeight: 850,
          left: 120,
          letterSpacing: 0,
          lineHeight: 1.08,
          position: 'absolute',
          top: 360,
          width: 1500,
        }}
      >
        {title}
      </div>
    )}
    {subtitle && (
      <div
        style={{
          color: accent,
          fontFamily:
            '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: 30,
          fontWeight: 600,
          left: 120,
          letterSpacing: 4,
          position: 'absolute',
          textTransform: 'uppercase',
          top: 300,
        }}
      >
        {subtitle}
      </div>
    )}
  </AbsoluteFill>
);

// 在素材层之上叠加标题/副标题 (用于 image / video 模式)
const TitleOverlay: React.FC<{
  title?: string;
  subtitle?: string;
  accent: string;
}> = ({title, subtitle, accent}) => {
  if (!title && !subtitle) return null;
  return (
    <>
      <div
        style={{
          background: 'rgba(15,12,10,0.55)',
          borderRadius: 8,
          bottom: 180,
          color: '#f7f3ea',
          fontFamily:
            '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: 56,
          fontWeight: 800,
          left: 120,
          lineHeight: 1.2,
          maxWidth: 1400,
          padding: '24px 36px',
          position: 'absolute',
          textShadow: '0 4px 20px rgba(0,0,0,0.6)',
        }}
      >
        {subtitle && (
          <div
            style={{
              color: accent,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </div>
        )}
        {title}
      </div>
    </>
  );
};

export const ShotVideo: React.FC<{
  visual: ShotVisual;
  title?: string;
  subtitle?: string;
}> = ({visual, title, subtitle}) => {
  const effectiveType = visual.effectiveType ?? visual.type ?? 'color-block';
  const accent = visual.accent ?? '#d4a017';

  // 1) image 分支
  if (effectiveType === 'image') {
    if (!visual.src) {
      return (
        <ColorBlock
          bg={visual.background ?? '#222'}
          accent={accent}
          title={title}
          subtitle={subtitle}
        />
      );
    }
    return (
      <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
        <Img
          src={staticFile(visual.src)}
          style={{
            height: '100%',
            objectFit: 'cover',
            width: '100%',
          }}
        />
        {(visual.showTitle ?? false) && (
          <TitleOverlay title={title} subtitle={subtitle} accent={accent} />
        )}
      </AbsoluteFill>
    );
  }

  // 2) video 分支
  if (effectiveType === 'video') {
    if (!visual.src) {
      return (
        <ColorBlock
          bg={visual.background ?? '#222'}
          accent={accent}
          title={title}
          subtitle={subtitle}
        />
      );
    }
    return (
      <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
        <OffthreadVideo
          muted={visual.muted ?? true}
          src={staticFile(visual.src)}
          style={{
            height: '100%',
            objectFit: 'cover',
            width: '100%',
          }}
        />
        {(visual.showTitle ?? false) && (
          <TitleOverlay title={title} subtitle={subtitle} accent={accent} />
        )}
      </AbsoluteFill>
    );
  }

  // 3) color-block (兜底) — 含 unknown type
  return (
    <ColorBlock
      bg={visual.background ?? '#151515'}
      accent={accent}
      title={title}
      subtitle={subtitle}
    />
  );
};
