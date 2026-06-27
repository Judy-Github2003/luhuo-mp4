// src/root.tsx
//
// 注册 Composition: 主视频 LuhuoMain + 封面 LuhuoCover
// 主视频 durationInFrames 从 shots.json.totalDurationSeconds 读 (run generate-audio 后才有)
// 兜底: 给个 15s (450 帧) 防止 audio 还没生成时 root.tsx import 失败
//
// v6 新增 LuhuoCover composition, durationInFrames=1 (still image)

import React from 'react';
import {Composition} from 'remotion';
import {LuhuoMain} from './compositions/LuhuoMain';
import {LuhuoCover} from './compositions/LuhuoCover';
import shotsData from '../content/shots.json';

const FPS = 30;
const FALLBACK_SECONDS = 15;
const totalSeconds = shotsData.totalDurationSeconds ?? FALLBACK_SECONDS;
const totalFrames = Math.round(totalSeconds * FPS);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LuhuoMain"
        component={LuhuoMain}
        durationInFrames={totalFrames}
        fps={FPS}
        width={shotsData.width ?? 1920}
        height={shotsData.height ?? 1080}
      />
      <Composition
        id="LuhuoCover"
        component={LuhuoCover}
        durationInFrames={1}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};