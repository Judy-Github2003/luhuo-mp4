// scripts/extract-cover-frame.mjs
//
// v6 封面背景抽帧: 从 public/videos/shot-12.mp4 抽中间帧到 public/luhuo-cover-bg.png
// 用途: LuhuoCover composition 用作背景图 (Remotion staticFile 只能读 public/)
// 注意: public/luhuo-cover-bg.png 已在 .gitignore 排除, 不入库
//
// 用法:
//   node scripts/extract-cover-frame.mjs

import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const src = resolve(projectRoot, 'public', 'videos', 'shot-12.mp4');
const out = resolve(projectRoot, 'public', 'luhuo-cover-bg.png');

if (!existsSync(src)) {
  throw new Error(`shot-12.mp4 not found: ${src}`);
}
mkdirSync(dirname(out), {recursive: true});

// shot-12 视频实际时长 ~5.875s, 抽中间帧 ~3s
console.log(`Source: ${src}`);
console.log(`Output: ${out}`);

execFileSync(
  'ffmpeg',
  [
    '-y',
    '-ss', '3',
    '-i', src,
    '-frames:v', '1',
    '-q:v', '2',
    out,
  ],
  {stdio: 'inherit'},
);

console.log(`✅ Wrote ${out}`);