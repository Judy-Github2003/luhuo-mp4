// scripts/build-video.mjs
//
// 端到端构建:
//   1. node scripts/generate-audio.mjs   (生成 TTS mp3 + 词级时间戳 + 写回 shots.json)
//   2. node scripts/verify-assets.mjs    (扫 visual.src, 写回 effectiveType, 缺失回退 color-block)
//   3. npx remotion render src/index.ts LuhuoMain out/luhuo-main.mp4
//
// 用法:
//   node scripts/build-video.mjs
//   node scripts/build-video.mjs --skip-audio   (audio 已生成时)
//   node scripts/build-video.mjs --skip-verify  (素材检查已跑过)
//   node scripts/build-video.mjs --dry-run       (只跑 audio, 不渲染)

import {readFile, mkdir} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {spawn} from 'node:child_process';

const projectRoot = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const skipAudio = args.includes('--skip-audio');
const skipVerify = args.includes('--skip-verify');
const dryRun = args.includes('--dry-run');

const CHROME_PATH =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const run = (cmd, cmdArgs) =>
  new Promise((resolveRun, rejectRun) => {
    console.log(`\n$ ${cmd} ${cmdArgs.join(' ')}\n`);
    const p = spawn(cmd, cmdArgs, {
      cwd: projectRoot,
      shell: true,
      stdio: 'inherit',
    });
    p.on('exit', (code) =>
      code === 0
        ? resolveRun()
        : rejectRun(new Error(`${cmd} exited with code ${code}`)),
    );
  });

// Step 1: 音频 + 词级时间戳
if (!skipAudio) {
  console.log('=== [1/3] generate-audio ===');
  await run('node', [resolve(projectRoot, 'scripts', 'generate-audio.mjs')]);
}

// Step 2: 素材存在性校验 (写回 effectiveType)
if (!skipVerify) {
  console.log('\n=== [2/3] verify-assets ===');
  await run('node', [resolve(projectRoot, 'scripts', 'verify-assets.mjs')]);
}

// Step 3: 渲染
if (!dryRun) {
  const outDir = resolve(projectRoot, 'out');
  await mkdir(outDir, {recursive: true});
  const outFile = join(outDir, 'luhuo-main.mp4');

  // 读 shots.json 取最新总时长
  const shots = JSON.parse(
    await readFile(resolve(projectRoot, 'content', 'shots.json'), 'utf8'),
  );
  const totalSeconds = shots.totalDurationSeconds ?? 15;
  console.log(`\n=== [3/3] remotion render (${totalSeconds}s) ===`);

  await run('npx', [
    'remotion',
    'render',
    'src/index.ts',
    'LuhuoMain',
    outFile,
    `--browser-executable="${CHROME_PATH}"`,
    '--concurrency=1',
  ]);
  console.log(`\n✅ Wrote ${outFile}`);
}
