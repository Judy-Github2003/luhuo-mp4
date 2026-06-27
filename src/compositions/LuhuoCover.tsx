// src/compositions/LuhuoCover.tsx
//
// v6 封面 composition (1920x1080)
// 用 shot-12 抽帧作为背景, 代码叠加中藏文标题
// 重要: 文字必须由代码叠加, 不能让 AI 图片模型生成伪藏文
//
// 渲染:
//   npx remotion still src/index.ts LuhuoCover out/luhuo-cover-v6.png \
//     --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" \
//     --concurrency=1
//
// 依赖背景图 (不入库):
//   out/luhuo-cover-bg.png
// 由 scripts/extract-cover-frame.mjs 从 public/videos/shot-12.mp4 抽帧得到

import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;

export const LuhuoCover: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: '#0a0a0a',
        fontFamily:
          '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 背景图: shot-12 抽帧 */}
      <Img
        src={staticFile('luhuo-cover-bg.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* 暗色渐变遮罩: 顶部 25% 透, 底部 70% 深 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* 上方小标题 (藏文) */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 0,
          right: 0,
          fontFamily:
            '"Noto Sans Tibetan", "Microsoft Himalaya", sans-serif',
          fontSize: 36,
          fontWeight: 500,
          color: '#d4a017',
          textAlign: 'center',
          letterSpacing: 2,
          textShadow: '0 2px 8px rgba(0,0,0,0.65)',
        }}
      >
        ཕྱུ་པ་གཅིག་ནས་མཐོ་སྒང་གི་དྲན་པ་མཐོང་།
      </div>

      {/* 中部主标题 (中文) */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: 0,
          right: 0,
          fontFamily:
            '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: 96,
          fontWeight: 850,
          color: '#f7f3ea',
          textAlign: 'center',
          letterSpacing: 8,
          textShadow: '0 4px 16px rgba(0,0,0,0.65)',
        }}
      >
        一件藏袍里的炉霍
      </div>

      {/* 中下副标题 (藏文) */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: 0,
          right: 0,
          fontFamily:
            '"Noto Sans Tibetan", "Microsoft Himalaya", sans-serif',
          fontSize: 56,
          fontWeight: 500,
          color: '#f7f3ea',
          textAlign: 'center',
          letterSpacing: 4,
          textShadow: '0 2px 8px rgba(0,0,0,0.65)',
        }}
      >
        ཕྱུ་པ་གཅིག་གི་ནང་གི་བྲག་འགོ།
      </div>

      {/* 底部说明 (中文) */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          fontFamily:
            '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: 36,
          fontWeight: 500,
          color: 'rgba(247, 243, 234, 0.85)',
          textAlign: 'center',
          letterSpacing: 6,
          textShadow: '0 2px 8px rgba(0,0,0,0.65)',
        }}
      >
        炉霍藏族传统文化视觉短片
      </div>
    </AbsoluteFill>
  );
};