// src/root.tsx
//
// 注册 LuhuoMain composition
// durationInFrames 从 shots.json.totalDurationSeconds 读 (run generate-audio 后才有)
// 兜底: 给个 15s (450 帧) 防止 audio 还没生成时 root.tsx import 失败

import React from 'react';
import {Composition} from 'remotion';
import {LuhuoMain} from './compositions/LuhuoMain';
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
    </>
  );
};
