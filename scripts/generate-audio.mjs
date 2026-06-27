// scripts/generate-audio.mjs
//
// 用 MiniMax TTS (word_streaming) 生成中文旁白 + 词级时间戳, 写回 shots.json
// (覆盖每个 shot 的实测 start/end/duration 字段)
//
// 设计原则 (参考旧 D:\YouTubeVideo\scripts\generate-audio-karaoke.mjs):
//   1. 拼接所有 shot.zhNarration (单空格) → narrationText
//   2. POST T2A v2, stream=true, subtitle_enable=true, subtitle_type=word_streaming
//   3. SSE 解析:
//        - status=2 的 audio 才是终态完整 mp3 (status=1 是累计+重叠, 跳过)
//        - timestamped_words 按 Math.round(time_begin) 去重
//   4. 中文 word 是字级 (word_end - word_begin = 1), 不需要英文那种"音节合并"
//   5. 按 shot 的字符区间映射回 start/end, 写回 shots.json
//   6. 总时长 = audio_length_ms/1000 + outro.seconds (默认 1.5s)
//
// 用法:
//   node scripts/generate-audio.mjs                       # 读 content/shots.json
//   node scripts/generate-audio.mjs --dry-run            # 只算时间, 不写文件
//
// 依赖: MINIMAX_API_KEY

import {readFile, writeFile, copyFile, mkdir} from 'node:fs/promises';
import {resolve, join, dirname} from 'node:path';

const apiKey = process.env.MINIMAX_API_KEY;
if (!apiKey) throw new Error('Missing MINIMAX_API_KEY environment variable.');

const projectRoot = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const positional = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const contentPath = positional
  ? resolve(projectRoot, positional)
  : resolve(projectRoot, 'content', 'shots.json');

const content = JSON.parse(await readFile(contentPath, 'utf8'));
if (!content.shots?.length) {
  throw new Error(`${contentPath} has no shots array.`);
}

const ttsConfig = content.tts ?? {};
const model = ttsConfig.model ?? 'speech-2.8-hd';
const voiceId = ttsConfig.voiceId ?? 'male-qn-jingying';
const speed = ttsConfig.speed ?? 1.0;
const outro = content.outro ?? {enabled: true, seconds: 1.5};
const OUTRO_SECONDS = outro.enabled ? outro.seconds : 0;

const baseName = content.videoId ?? 'luhuo-main';
const audioDir = resolve(projectRoot, 'public', 'audio');
const audioPath = join(audioDir, `${baseName}.mp3`);
const wordsPath = join(audioDir, `${baseName}.words.json`);
const bakPath = contentPath + '.bak';

// 拼接所有 shot.zhNarration (单空格) → narrationText
const narrations = content.shots.map((s) => s.zhNarration ?? '');
const narrationText = narrations.join(' ');

// 算每个 shot 在 narrationText 中的字符区间
const segCharRanges = [];
let cursor = 0;
for (let i = 0; i < narrations.length; i++) {
  const start = cursor;
  const end = start + narrations[i].length;
  segCharRanges.push({start, end});
  cursor = end + 1; // 跳过分隔空格
}

console.log(`Content:    ${contentPath}`);
console.log(`Video ID:   ${baseName}`);
console.log(`Model:      ${model}, voice: ${voiceId}, speed: ${speed}`);
console.log(`Shots:      ${content.shots.length}`);
console.log(`Narration:  ${narrationText.length} chars`);

// ── 流式 TTS ──
console.log(`\n[1/3] Streaming TTS (word_streaming)...`);
const response = await fetch('https://api.minimaxi.com/v1/t2a_v2', {
  method: 'POST',
  headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
  body: JSON.stringify({
    model,
    text: narrationText,
    stream: true,
    language_boost: 'Chinese',
    output_format: 'hex',
    voice_setting: {voice_id: voiceId, speed, vol: 1, pitch: 0},
    audio_setting: {sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1},
    subtitle_enable: true,
    subtitle_type: 'word_streaming',
  }),
});

if (!response.ok) {
  throw new Error(`TTS HTTP ${response.status}: ${await response.text()}`);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';
let finalAudioHex = '';
let audioLengthMs = null;
let chunkCount = 0;
const wordMap = new Map();

while (true) {
  const {done, value} = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, {stream: true});
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 1);
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const jsonStr = trimmed.slice(5).trim();
    if (!jsonStr || jsonStr === '[DONE]') continue;
    try {
      const evt = JSON.parse(jsonStr);
      chunkCount++;
      const status = evt.data?.status;
      if (evt.extra_info?.audio_length) audioLengthMs = evt.extra_info.audio_length;
      if (status === 2 && evt.data?.audio) {
        finalAudioHex = evt.data.audio;
      }
      const tw = evt.data?.subtitle?.timestamped_words;
      if (Array.isArray(tw)) {
        for (const w of tw) {
          if (w.word == null) continue;
          const key = Math.round(w.time_begin);
          if (!wordMap.has(key)) {
            wordMap.set(key, {
              word: w.word,
              begin: w.time_begin,
              end: w.time_end,
              charBegin: w.word_begin,
              charEnd: w.word_end,
            });
          }
        }
      }
    } catch (e) {}
  }
}

if (!finalAudioHex) throw new Error('No final audio (status=2) chunk received.');

const words = [...wordMap.values()].sort((a, b) => a.begin - b.begin);
console.log(`      chunks: ${chunkCount}, words: ${words.length}, audio: ${audioLengthMs}ms`);

// ── 把每个词归属到 shot, 重算 shot start/end ──
const alignedShots = content.shots.map((shot, i) => {
  const range = segCharRanges[i];
  const segWords = words.filter(
    (w) => w.charEnd > range.start && w.charBegin < range.end,
  );
  if (segWords.length === 0) {
    return {...shot, start: 0, end: 0};
  }
  return {
    ...shot,
    start: Math.round((segWords[0].begin / 1000) * 100) / 100,
    end: Math.round((segWords[segWords.length - 1].end / 1000) * 100) / 100,
  };
});

const contentSeconds = audioLengthMs / 1000;
const totalDurationSeconds = Math.round((contentSeconds + OUTRO_SECONDS) * 100) / 100;

console.log(`\n[2/3] Aligned shots:`);
alignedShots.forEach((s, i) => {
  console.log(`      [${i}] ${s.id}: ${s.start.toFixed(2)}s ~ ${s.end.toFixed(2)}s`);
});
console.log(`      total: ${totalDurationSeconds}s (content ${contentSeconds.toFixed(2)}s + outro ${OUTRO_SECONDS}s)`);

if (dryRun) {
  console.log(`\nDry run, no files written.`);
  process.exit(0);
}

// ── 写文件 ──
console.log(`\n[3/3] Writing files...`);
await mkdir(audioDir, {recursive: true});

const audioBytes = Buffer.from(finalAudioHex, 'hex');
await writeFile(audioPath, audioBytes);
console.log(`      audio: ${audioPath} (${audioBytes.length} bytes)`);

await writeFile(wordsPath, JSON.stringify(words, null, 2) + '\n', 'utf8');
console.log(`      words: ${wordsPath}`);

// 备份 + 写回 shots.json
await copyFile(contentPath, bakPath);
const newContent = {
  ...content,
  totalDurationSeconds,
  contentDurationSeconds: Math.round(contentSeconds * 100) / 100,
  audioLengthMs,
  shots: alignedShots,
};
await writeFile(contentPath, JSON.stringify(newContent, null, 2) + '\n', 'utf8');
console.log(`      json:  ${contentPath} (backup: ${bakPath})`);

console.log(`\n✅ Done. Next: npm run build`);
