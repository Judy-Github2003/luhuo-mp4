// scripts/probe-shot-durations.mjs
//
// 调查 content/shots.json 中每个 shot 的 Sequence 时长, 对比真实 mp4 时长
// 输出 markdown 表格到 stdout 和 docs/shot-durations.md
//
// 不修改 shots.json, 不重新生成素材, 不重新渲染
//
// 用法:
//   node scripts/probe-shot-durations.mjs
//
// 输出示例:
//   | shot | type | sequence (s) | media (s) | status |
//   | --- | --- | ---: | ---: | --- |
//   | shot-01 | video | 3.29 | 5.875 | media_longer_cut |
//   | shot-02 | image | 4.95 | N/A | image_ok |

import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';

const projectRoot = resolve(import.meta.dirname, '..');
const shotsPath = resolve(projectRoot, 'content', 'shots.json');
const publicDir = resolve(projectRoot, 'public');
const docsDir = resolve(projectRoot, 'docs');
const outMd = join(docsDir, 'shot-durations.md');

// 读 shots.json
const raw = await readFile(shotsPath, 'utf8');
const data = JSON.parse(raw);
const shots = data.shots ?? [];

// ffprobe 取视频时长 (秒, 浮点)
const probeVideoDuration = (relSrc) => {
  const abs = resolve(publicDir, relSrc);
  if (!existsSync(abs)) return null;
  try {
    const out = execFileSync(
      'ffprobe',
      [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=nw=1:nk=1',
        abs,
      ],
      {encoding: 'utf8', timeout: 10000},
    ).trim();
    const sec = parseFloat(out);
    return Number.isFinite(sec) ? sec : null;
  } catch (e) {
    return null;
  }
};

const rows = [];
for (const shot of shots) {
  const id = shot.id;
  const type = shot.visual?.effectiveType ?? shot.visual?.type ?? 'unknown';
  const seqStart = Number(shot.start ?? 0);
  const seqEnd = Number(shot.end ?? seqStart);
  const seqDur = +(seqEnd - seqStart).toFixed(3);

  let mediaDur = null;
  let status = 'unknown';

  if (type === 'video') {
    mediaDur = probeVideoDuration(shot.visual?.src);
    if (mediaDur == null) {
      status = 'media_missing';
    } else if (Math.abs(mediaDur - seqDur) < 0.05) {
      status = 'aligned';
    } else if (mediaDur > seqDur) {
      status = 'media_longer_cut';
    } else {
      status = 'media_shorter_blank';
    }
  } else if (type === 'image') {
    mediaDur = null;
    status = 'image_ok';
  } else if (type === 'color-block') {
    mediaDur = null;
    status = 'color_block';
  }

  rows.push({
    id,
    type,
    seqStart,
    seqEnd,
    seqDur,
    mediaDur: mediaDur == null ? null : +mediaDur.toFixed(3),
    status,
  });
}

// 间隙检测: 相邻 shot end → next shot start
const gaps = [];
for (let i = 0; i < rows.length - 1; i++) {
  const a = rows[i];
  const b = rows[i + 1];
  const gap = +(b.seqStart - a.seqEnd).toFixed(3);
  if (gap > 0.01) {
    gaps.push({from: a.id, to: b.id, gapSec: gap});
  }
}

// 拼 markdown
const md = [];
md.push('# Shot 时长排查 (v4)');
md.push('');
md.push(`> 生成时间: ${new Date().toISOString()}`);
md.push(`> 数据源: \`content/shots.json\` (未修改)`);
md.push(`> 脚本: \`scripts/probe-shot-durations.mjs\``);
md.push('');
md.push('## 1. 时长对比表');
md.push('');
md.push('| shot | type | sequence start (s) | sequence end (s) | sequence (s) | media (s) | status |');
md.push('| --- | --- | ---: | ---: | ---: | ---: | --- |');
for (const r of rows) {
  md.push(
    `| ${r.id} | ${r.type} | ${r.seqStart.toFixed(2)} | ${r.seqEnd.toFixed(2)} | ${r.seqDur.toFixed(2)} | ${r.mediaDur == null ? 'N/A' : r.mediaDur.toFixed(2)} | ${r.status} |`,
  );
}
md.push('');
md.push('## 2. 状态码说明');
md.push('');
md.push('- `aligned` — video 时长与 Sequence 时长基本一致 (差 < 0.05s)');
md.push('- `media_longer_cut` — video 比 Sequence 长, 会被 Remotion 截断');
md.push('- `media_shorter_blank` — video 比 Sequence 短, 后段可能空帧');
md.push('- `media_missing` — video 文件不存在');
md.push('- `image_ok` — image 类, 无时长问题');
md.push('- `color_block` — 纯色占位, 无素材');
md.push('');
if (gaps.length > 0) {
  md.push('## 3. 间隙 (Sequence 之间)');
  md.push('');
  md.push('| from | to | gap (s) |');
  md.push('| --- | --- | ---: |');
  for (const g of gaps) {
    md.push(`| ${g.from} | ${g.to} | ${g.gapSec.toFixed(2)} |`);
  }
  md.push('');
  md.push('> v4 暂不改 `content/shots.json`。间隙期间外层背景已改为 `transparent`, 不会黑场, 但 Sequence 不连续。');
  md.push('');
} else {
  md.push('## 3. 间隙');
  md.push('');
  md.push('未发现 Sequence 之间的间隙。');
  md.push('');
}
md.push('## 4. 备注');
md.push('');
md.push('- v4 主目标: 删除 fade 转场 + 字幕真正贴底');
md.push('- 本脚本是排查工具, 不动 shots.json、不动素材、不动 remotion config');
md.push('- 后续 v5+ 如果要严格对齐, 可考虑:');
md.push('  1. 调整 shots.json 的 start/end, 消除间隙');
md.push('  2. 改成 12 个独立视频, 再用 ffmpeg/Remotion 拼接');

// 写文件
await mkdir(dirname(outMd), {recursive: true});
await writeFile(outMd, md.join('\n'), 'utf8');

// stdout 镜像
console.log(md.join('\n'));
console.log(`\n✅ Wrote ${outMd}`);