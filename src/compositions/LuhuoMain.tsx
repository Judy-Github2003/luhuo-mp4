// src/compositions/LuhuoMain.tsx
//
// 主 Composition: 串行播放每个 shot, 旁白共享一条 audio track, 字幕按 shot 切换
//
// 数据来源:
//   - shots.json (含 audio 反推的 start/end, 第一次跑 npm run audio 后会被覆盖)
//   - public/audio/<videoId>.mp3
//
// 渲染逻辑:
//   durationInFrames = totalDurationSeconds * fps
//   每帧 → 当前 activeShot (按 shot.start * fps 找到)
//   activeShot 切换时, 字幕也切换 (BilingualSubtitle 接收 activeShot.zhSubtitle / .boSubtitle)
//   visual 按 shot.kind 选择 ShotVideo / TitleCard
//
// v4 修正: shot 之间直接硬切, 不做 fade / 不做 transition / 不做 fade-through-black
//   - 删除了 v3 的本地 FadeInOut 组件
//   - 外层背景由 #0a0a0a 改为 transparent, 避免间隙期间透出黑色

import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BilingualSubtitle} from '../components/BilingualSubtitle';
import {ShotVideo} from '../components/ShotVideo';
import {TitleCard} from '../components/TitleCard';
import shotsData from '../../content/shots.json';

const FPS = 30;

type Shot = {
  id: string;
  kind?: string;
  start: number;
  end: number;
  duration: number;
  zhNarration: string;
  zhSubtitle: string;
  boSubtitle?: string;
  visual: {
    type: string;
    background?: string;
    accent?: string;
    assetPath?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

const data = shotsData as {
  videoId: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  language: string;
  totalDurationSeconds?: number;
  audioLengthMs?: number;
  shots: Shot[];
};

const audioDurationSeconds = data.audioLengthMs
  ? data.audioLengthMs / 1000
  : data.totalDurationSeconds
    ? Math.max(0, data.totalDurationSeconds - 1.5)
    : 15;

export const LuhuoMain: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // 当前激活的 shot
  const seconds = frame / fps;
  const activeShot = useMemo<Shot | undefined>(() => {
    if (!data.shots.length) return undefined;
    // 第一段 (TTS 还没到) 默认显示第一个
    if (seconds < data.shots[0].start) return data.shots[0];
    return data.shots.find(
      (s) => seconds >= s.start && seconds < s.end,
    ) ?? data.shots[data.shots.length - 1];
  }, [seconds]);

  // Outro 期间 (audio 之后到 durationInFrames 结尾): 保留最后一帧
  const isOutro = seconds >= audioDurationSeconds;

  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill
      style={{
        background: 'transparent',
        color: '#f7f3ea',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 视觉层: 每个 shot 直接渲染, 不再包裹 FadeInOut, shot 之间直接硬切 */}
      {data.shots.map((shot, i) => {
        const startFrame = Math.round(shot.start * fps);
        const endFrame = Math.round(shot.end * fps);
        const shotDuration = Math.max(1, endFrame - startFrame);
        return (
          <Sequence
            key={shot.id ?? i}
            from={startFrame}
            durationInFrames={shotDuration}
            name={shot.id}
          >
            {shot.kind === 'title' || shot.kind === 'ending' ? (
              <TitleCard
                title={shot.zhSubtitle || data.title}
                subtitle={shot.kind === 'ending' ? 'ENDING' : 'LUHUO HERITAGE'}
                variant={shot.kind === 'ending' ? 'ending' : 'title'}
              />
            ) : (
              <ShotVideo
                visual={shot.visual}
                title={shot.zhSubtitle}
                subtitle={shot.id?.toUpperCase()}
              />
            )}
          </Sequence>
        );
      })}

      {/* 旁白: 单一 audio track */}
      <Audio src={staticFile(`audio/${data.videoId}.mp3`)} />

      {/* 字幕层: 只在有 active shot 时显示, 跳过 outro 阶段 */}
      {activeShot && !isOutro && (
        <BilingualSubtitle
          zh={activeShot.zhSubtitle}
          bo={activeShot.boSubtitle ?? ''}
        />
      )}

      {/* 底部进度条 */}
      <div
        style={{
          background: 'rgba(212, 160, 23, 0.85)',
          bottom: 0,
          height: 6,
          left: 0,
          position: 'absolute',
          width: `${progress * 100}%`,
        }}
      />
      {/* 底部装饰条 (固定) */}
      <div
        style={{
          background: 'rgba(247, 243, 234, 0.18)',
          bottom: 0,
          height: 6,
          left: 0,
          position: 'absolute',
          right: 0,
        }}
      />
    </AbsoluteFill>
  );
};