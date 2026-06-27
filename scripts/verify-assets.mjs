// scripts/verify-assets.mjs
//
// 扫 content/shots.json 的 shot.visual.src, 写回 shot.visual.effectiveType
//   - 文件存在     → effectiveType = visual.type (image / video)
//   - 文件不存在   → effectiveType = 'color-block' (兜底, 不会导致 build 失败)
//   - type=color-block 或未配 src → effectiveType = 'color-block'
//
// 写回前备份 content/shots.json.bak
//
// 依赖: 无
//
// 用法: node scripts/verify-assets.mjs

import {readFile, writeFile, copyFile, access} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const contentPath = resolve(projectRoot, 'content', 'shots.json');
const publicDir = resolve(projectRoot, 'public');

const content = JSON.parse(await readFile(contentPath, 'utf8'));
if (!content.shots?.length) {
  throw new Error(`${contentPath} has no shots array.`);
}

let imageCount = 0;
let videoCount = 0;
let fallbackCount = 0;

for (const shot of content.shots) {
  const visual = shot.visual ?? {};
  const requested = visual.type ?? 'color-block';

  if (requested === 'color-block') {
    visual.effectiveType = 'color-block';
    continue;
  }

  if (requested !== 'image' && requested !== 'video') {
    console.warn(`[${shot.id}] unknown visual.type="${requested}" → fallback to color-block`);
    visual.effectiveType = 'color-block';
    fallbackCount++;
    continue;
  }

  if (!visual.src) {
    console.warn(`[${shot.id}] visual.type=${requested} but no src → fallback to color-block`);
    visual.effectiveType = 'color-block';
    fallbackCount++;
    continue;
  }

  const filePath = resolve(publicDir, visual.src);
  try {
    await access(filePath);
    visual.effectiveType = requested;
    if (requested === 'image') imageCount++;
    else videoCount++;
    console.log(`[${shot.id}] ${requested}: ${visual.src} ✓`);
  } catch {
    console.warn(`[${shot.id}] ${requested}: ${visual.src} ✗ (not found) → fallback to color-block`);
    visual.effectiveType = 'color-block';
    fallbackCount++;
  }
}

// 写回 (备份)
await copyFile(contentPath, contentPath + '.bak');
content.shots.forEach((s) => (s.visual = (() => {
  const v = s.visual ?? {};
  return v;
})()));
await writeFile(contentPath, JSON.stringify(content, null, 2) + '\n', 'utf8');

console.log(`\nverify-assets: image=${imageCount} video=${videoCount} fallback=${fallbackCount}`);
console.log(`updated: ${contentPath}`);
