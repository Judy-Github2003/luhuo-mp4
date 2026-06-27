# luhuo-mp4 — 视频自动化生产项目 技术方案

> **目的**：把当前 `D:\YouTubeVideo` 项目的技术栈、关键模块、数据流、已暴露的问题摸清楚，作为后续 `luhuo-mp4` 升级/迁移的参考基线。
>
> **范围**：本文档只描述"已发生的事实 + 已暴露的痛点"，**不**预测未来。给 ChatGPT 时可直接贴整篇。
>
> **基线版本**：扫描时间 2026-06-27 16:03。`out/moving-average-full.mp4` 实际只拼接了 chapter 1–7（最后写入 2026-06-15 15:12）；chapter 8–17 已分别有 mp4 但未参与那次拼接。

---

## 0. TL;DR（一段话给 ChatGPT）

`D:\YouTubeVideo` 是一个用 **Remotion 4 + React 19 + TypeScript 5** 做的"**音频优先 + 词级卡拉OK字幕**"视频自动化生产工具链，给量化交易 YouTube 课程（"均线"主题）批量产出 1920×1080@30fps 的英文旁白 MP4。**核心创新点**是用 `MiniMax TTS` 的流式 `word_streaming` 字幕接口把"段起止秒数"和"词级高亮"全部从音频里反推出来，**彻底消灭字幕/动画/音频的漂移**。流水线由 5 个 Node 脚本驱动 (`generate-audio-karaoke.mjs` / `slice-chart-data.mjs` / `build-chapter.mjs` / `concat.mjs` / `build-all.mjs`)，全部围绕"内容即数据"的 `content/*.json` + `content/manifest.json` 单一事实源展开。

---

## 1. 项目事实

### 1.1 技术栈（`package.json:52-62`）

| 类别 | 选型 | 版本 |
|---|---|---|
| 视频渲染 | Remotion | `4.0.473` |
| UI 框架 | React | `^19.1.1` |
| 语言 | TypeScript | `^5.9.2`（`strict: true`） |
| HTTP 客户端 | undici（仅 `ProxyAgent`） | `^8.4.1` |
| 包管理 | npm | — |
| 无数据库 / 无 Web 框架 | — | — |

外部工具：
- **ffmpeg 8.1.1**（`D:\ydzb2\.tools\ffmpeg\current\bin\ffmpeg.exe`，可被 `FFMPEG_PATH` 覆盖）
- **ffprobe**（默认 `D:\ydzb2\.tools\ffmpeg\current\bin\ffprobe.exe`）
- **Chrome** 固定 `C:\Program Files\Google\Chrome\Application\chrome.exe`（写死在 `build-chapter.mjs:35-36`）

### 1.2 输出规格（统一）

- 视频：1920×1080、30 fps、h264 + AAC、`.mp4`
- 音频：mp3、32 kHz、128 kbps、单声道
- 帧率常量：`src/scenes/shared/SceneFade.tsx:4` 的 `FPS = 30`
- 每章末尾的"冻结尾段"：`OUTRO_SECONDS = 2.5` 秒（其中最后 `FADE_OUT_SECONDS = 0.5` 秒淡出到黑）

### 1.3 必填环境变量

| 变量 | 必填 | 默认 | 用途 |
|---|---|---|---|
| `MINIMAX_API_KEY` | ✅ | — | TTS Bearer Token |
| `FFMPEG_PATH` | ❌ | `D:\ydzb2\.tools\ffmpeg\current\bin\ffmpeg.exe` | `concat.mjs` 拼接用 |
| `FFPROBE_PATH` | ❌ | `D:\ydzb2\.tools\ffmpeg\current\bin\ffprobe.exe` | 仅旧 `generate-audio.mjs` 用 |
| `HTTPS_PROXY` 等 | ❌ | — | undici 代理，仅 `generate-audio-karaoke.mjs` 启用 |

---

## 2. 目录结构

```
D:\YouTubeVideo\
├── package.json                 # npm scripts + 依赖
├── tsconfig.json                # strict TS, jsx=react-jsx, exclude src/_legacy
├── docs/                        # 调研/交接文档（极重要 — 包含历史决策）
│   ├── WORKFLOW.md              # 旧工作流（video-first 时代）
│   ├── GLM_HANDOFF.md           # 2026-06-15 给下一棒的迁移交接
│   ├── PROJECT_HANDBOOK.md      # 最全的项目说明书（592 行）
│   ├── moving-average-intro-script.md   # 人工可审稿（中英回译）
│   ├── chapters-bilingual-review.md     # chapter 1-7 双语对照
│   ├── superpowers/specs/...    # chapter 8-11 的设计 spec
│   └── superpowers/plans/...    # chapter 8-11 的实施 plan
├── content/                     # ★ 单一事实源
│   ├── manifest.json            # 课程序列（含 output 路径）
│   ├── chapter-1.json ~ chapter-17.json   # 17 个章节的内容+时序
│   ├── moving-average-intro.json          # legacy 开场白
│   ├── data/chapter-4.csv                 # NVDA 30 根 K 线 + 9 SMA
│   └── _legacy/                           # 旧快照
├── public/
│   ├── narration.mp3, hello.mp3           # legacy
│   ├── moving-average-intro.mp3           # legacy
│   └── audio/                             # ★ 当前生产产物
│       ├── chapter-1.mp3 ~ chapter-17.mp3
│       └── chapter-N.words.json           # 词级时间戳
├── src/
│   ├── index.ts                 # registerRoot(RemotionRoot)
│   ├── root.tsx                 # 注册全部 Composition
│   ├── hello-video.tsx          # legacy demo
│   ├── sma-ema-demo.tsx         # demo（不在当前课程）
│   ├── moving-average-intro.tsx # legacy 开场白
│   └── scenes/
│       ├── shared/              # ★ 共享组件/常量/工具
│       │   ├── palette.ts       # 颜色、字体、SMA 色阶、字号
│       │   ├── types.ts         # ChapterType / Segment / Chapter
│       │   ├── SceneFade.tsx    # FPS / OUTRO / clampOpacity / chapterOpacity
│       │   ├── KaraokeSubtitle.tsx   # ★ 卡拉OK高亮（生产中在用）
│       │   ├── Subtitles.tsx    # legacy 整段字幕（保留不用）
│       │   ├── CandleChart.tsx  # K线+多MA SVG 组件
│       │   ├── Pill.tsx         # chapter-2 的"四柱"
│       │   ├── AgendaItem.tsx   # chapter-3 的"6问"
│       │   └── ProgressBar.tsx  # 底部进度条
│       ├── chapter-1-title/     # 命名规则: chapter-N-name/{index.tsx, words.ts}
│       ├── chapter-2-intro/
│       ├── chapter-3-agenda/
│       ├── chapter-4/  + chart-data.ts    # NVDA 30 根（自动生成）
│       ├── chapter-5/                       # 复用 ch4 数据
│       ├── chapter-6/                       # NVDA + SMA sequence A
│       ├── chapter-7/                       # NVDA + SMA sequence B
│       ├── chapter-8/  + chart-data.ts     # 纯文字图
│       ├── chapter-9/  + chart-data.ts     # NVDA
│       ├── chapter-10/ + chart-data.ts     # NVDA + SMA/EMA/VWMA
│       ├── chapter-11/ + chart-data.ts     # 60 根合成 K 线
│       ├── chapter-12/ + chart-data.ts     # VWMA
│       ├── chapter-13/                      # 文字过渡
│       ├── chapter-14/                      # 周期概念
│       ├── chapter-15/ + chart-data.ts     # 多周期讲解
│       ├── chapter-16/ + chart-data.ts     # Visa 9 SMA（320 高亮）
│       └── chapter-17/ + chart-data.ts     # 同 ch16 + 浮动注释
├── scripts/                     # ★ Node 流水线
│   ├── generate-audio-karaoke.mjs   # ★ 当前生产：流式 TTS + 词级时间戳
│   ├── generate-audio.mjs           # 旧：probe+auto-fit speed（已废）
│   ├── generate-audio-aligned.mjs   # 中间态：句级对齐（被 karaoke 取代）
│   ├── generate-minimax-audio.mjs   # legacy hello-video
│   ├── generate-intro-audio.mjs     # legacy intro
│   ├── slice-chart-data.mjs         # CSV → src/scenes/chapter-4/chart-data.ts
│   ├── slice-chapter-10.mjs         # 新下载 CSV + ch4 join
│   ├── slice-chapter-16.mjs         # 切 Visa 数据
│   ├── slice-chart-data.mjs
│   ├── generate-ch11-synthetic.mjs  # 合成 K 线（xorshift32 种子 42）
│   ├── build-chapter.mjs            # 单章构建（audio + render）
│   ├── build-all.mjs                # 全部构建 + concat
│   ├── concat.mjs                   # ffmpeg concat demuxer
│   ├── probe-tts-response.mjs       # TTS 探针
│   └── _probe-*.mjs / _diag-*.mjs   # 一次性探针
├── ppt/
│   ├── 图解精讲常用技术指标-均线.pptx  # 源 PPT
│   ├── _extracted.json               # python-pptx dump
│   └── BATS_NVDA, 1D_defa5.csv       # 数据副本
├── motion-canvas-demo/                # ❌ 废弃栈，不动
└── out/
    ├── moving-average-full.mp4       # ★ 最终拼接（实际只有 ch1-7）
    ├── moving-average-intro.mp4      # legacy
    ├── chapters/chapter-1.mp4 ~ chapter-17.mp4
    ├── _legacy/                      # 旧产物
    └── *.log, *.err.log              # 调试日志
```

---

## 3. 核心数据模型（`src/scenes/shared/types.ts`）

```ts
type ChapterType =
  | 'title' | 'intro' | 'agenda' | 'definition' | 'reflection'
  | 'use' | 'participants' | 'family' | 'purity' | 'comparison'
  | 'ema-design' | 'vwma' | 'transition' | 'period-intro'
  | 'period-traders' | 'support-resistance' | 'long-ma-mechanism';

type Segment = {
  id: string;                          // e.g. 'spread-of-periods'
  start: number;                       // 秒（被 karaoke 流水线覆盖）
  end: number;                         // 秒（被 karaoke 流水线覆盖）
  originalChinese: string;             // 原始中文旁白
  englishNarration: string;            // 英文口播（TTS 输入）
  englishSubtitle: string;             // 字幕文本（已与 narration 对齐）
  backTranslationChinese: string;      // 回译中文，供人审
};

type Chapter = {
  id: string;                          // 'chapter-1' .. 'chapter-17'
  type: ChapterType;
  title: string;
  subtitle: string;                    // ⚠️ ch-8/16 缺该字段
  durationSeconds: number;             // 被 karaoke 流水线覆盖
  source?: { ppt: string; slide: string };
  segments: Segment[];
};
```

`content/manifest.json` 是课程序列：
```json
{
  "lessonId": "moving-average-1",
  "title": "Illustrated Guide to Moving Averages",
  "subtitle": "Lesson 1: Moving Averages",
  "chapters": [{"id": "chapter-1", "type": "title", "title": "...", "subtitle": "..."}, ...],
  "output": {
    "fullVideo": "out/moving-average-full.mp4",
    "chaptersDir": "out/chapters",
    "audioDir": "public/audio"
  }
}
```

**Schema 已知瑕疵**：
- `chapter-8.json` / `chapter-16.json` 缺 `type` / `subtitle`（手写漏了，但渲染没崩是因为 TS 用 `as Chapter` 强转）
- 文档类型注释和实际 JSON 不完全一致（如 `englishSubtitle` 在 7 章里是 narration 复制品）

---

## 4. 流水线（生产中的"音频优先"路径）

`PPT → JSON → TTS(带时间戳) → 反算时间轴 → Remotion 渲染 → ffmpeg 拼接`

```
[1] 一次性：python scripts/_extract_pptx.py
       ppt/图解精讲常用技术指标-均线.pptx  →  ppt/_extracted.json
       
[2] 人工 + AI 写：content/chapter-N.json
       {id, type, title, subtitle, durationSeconds:0, segments:[
         {id, start:0, end:0, originalChinese, englishNarration,
          englishSubtitle, backTranslationChinese}, ...]}
       
[3] （仅 ch4-17 涉及）数据准备:
       node scripts/slice-chart-data.mjs --start=YYYY-MM-DD --count=30
         → src/scenes/chapter-4/chart-data.ts  (NVDA 30 根 + 9 SMA)
       node scripts/slice-chapter-10.mjs
         → src/scenes/chapter-10/chart-data.ts  (NVDA + EMA20 + VWMA20)
       node scripts/slice-chapter-16.mjs
         → src/scenes/chapter-16/chart-data.ts  (Visa 108 根 + 9 SMA)
       node scripts/generate-ch11-synthetic.mjs
         → src/scenes/chapter-11/chart-data.ts  (60 根合成种子 42)
       
[4] ★ 核心：node scripts/generate-audio-karaoke.mjs content/chapter-N.json
       输入: chapter JSON
       流程:
         a. 拼接所有 englishNarration (空格) → narrationText
         b. POST https://api.minimaxi.com/v1/t2a_v2
            {model: 'speech-2.8-hd', stream: true,
             subtitle_enable: true, subtitle_type: 'word_streaming',
             voice_setting: {voice_id: 'male-qn-qingse', speed: 1, vol: 1, pitch: 0},
             audio_setting: {sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1}}
         c. SSE 解析: 
            - status=2 的 chunk 才是完整 mp3 (status=1 是累计+重叠, 跳过)
            - 收集所有 chunk 的 timestamped_words, 按 Math.round(time_begin) 去重
         d. 合并音节碎片: 上一个 charEnd == 当前 charBegin → append (原文无空格)
         e. 把每个词按 charBegin/charEnd 映射回 segment (用段在 narrationText 中的字符区间)
         f. durationSeconds = audio_length_ms/1000 + 2.5 (OUTRO)
       产物:
         - public/audio/chapter-N.mp3                 (来自 status=2)
         - public/audio/chapter-N.words.json          ([{word, begin, end, charBegin, charEnd}], ms)
         - src/scenes/chapter-N*/words.ts             (Remotion 静态 import, 含 "AUTO-GENERATED" 头)
         - content/chapter-N.json                     (写回真实 start/end/duration, 备份到 .karaoke.bak)
         
[5] node scripts/build-chapter.mjs content/chapter-N.json
       (内部按 COMPOSITION_OF 映射: chapter-1 → Chapter1Title, etc.)
       ├─ node scripts/generate-audio.mjs <chapter>   (⚠️ 仍是旧管线, 已废, 见 §6 痛点)
       └─ npx remotion render src/index.ts <CompositionId> out/chapters/chapter-N.mp4 \
            --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" \
            --concurrency=1
            (Remotion 用 chapter JSON + 自动生成的 words.ts 渲染, 严格 durationSeconds*30 帧)
            
[6] node scripts/concat.mjs
       ffmpeg -f concat -safe 0 -i <list.txt> -c copy out/moving-average-full.mp4
       列表来自 manifest.json.chapters (按顺序), 文件名 {chaptersDir}/{id}.mp4
```

### 4.1 实际跑过的命令（来自日志回放）

```bash
# 单章：先 karaoke，再 render
node scripts/generate-audio-karaoke.mjs content/chapter-1.json
node scripts/build-chapter.mjs content/chapter-1.json --skip-audio
# 全量：build-all.mjs 会按 manifest 顺序串行跑 build-chapter
node scripts/build-all.mjs
node scripts/build-all.mjs --only=2,3          # 只跑指定章
node scripts/build-all.mjs --skip-build         # 只跑 concat
```

### 4.2 Remotion Composition 注册（`src/root.tsx`）

```tsx
<Composition id="Chapter1Title"  component={Chapter1Title}  durationInFrames={CHAPTER_1_DURATION_FRAMES}  fps={30} width={1920} height={1080} />
<Composition id="Chapter2Intro"  component={Chapter2Intro}  durationInFrames={CHAPTER_2_DURATION_FRAMES}  fps={30} width={1920} height={1080} />
...
<Composition id="Chapter17LongMaMechanism" component={Chapter17LongMaMechanismComposition} durationInFrames={CHAPTER_17_DURATION_FRAMES} fps={30} width={1920} height={1080} />
```

每个章节组件的标准结构（详见 §5）：
```tsx
<AbsoluteFill style={{background: palette.bg, fontFamily: palette.font}}>
  <SceneComponent frame={frame} activeSegment={...} />   {/* 视觉场景 */}
  <Audio src={staticFile('audio/chapter-N.mp3')} />     {/* 音频 (Remotion 音视频同步) */}
  <KaraokeSubtitle frame={frame} words={WORDS} />      {/* 卡拉OK字幕 */}
  <ProgressBar progress={progress} />                   {/* 底部进度条 */}
</AbsoluteFill>
```

---

## 5. 共享组件详解

### 5.1 `KaraokeSubtitle` (`src/scenes/shared/KaraokeSubtitle.tsx`)

**这是整个项目最有价值的设计**。

- 输入：`words: Word[]` (来自自动生成的 `words.ts`)，每项 `{word, begin(ms), end(ms), charBegin, charEnd}`
- 渲染时机：把 `frame / FPS * 1000` 映射到 `tMs`，在 `tMs` 区间内找"当前正在念的句"
- 句切分：以句末标点 `. ! ?` 结尾的词作为句尾
- 视觉效果：当前词金色 (`palette.accent`)，已念过白色 (`palette.surface`)，未念暗灰 (`rgba(247,243,234,0.55)`)
- 字号自适应：句字符数 ≤60→44pt / ≤120→38pt / ≤180→32pt / >180→28pt

**优势**：音频和字幕字字对齐，零漂移，且字幕本身就是音频的"投影"。

### 5.2 `CandleChart` (`src/scenes/shared/CandleChart.tsx`)

通用 K 线 + 多 MA 的 SVG 组件。

- `Candle` 类型: `{i, date, open, high, low, close, sma5, sma10, sma20, sma40, sma80, sma160, sma320, sma640, sma1280, ema20, vwma20}`
- `MaKey` 支持 11 种: `sma5|sma10|sma20|sma40|sma80|sma160|sma320|sma640|sma1280|ema20|vwma20`
- `MaLine` 支持 `width` / `opacity` / `shown`（动画"画到第 N 根"）
- 坐标范围用**全部** K 线 + **所有** MA 计算固定区间，避免动画时坐标轴跳动
- 上下 6% padding
- 网格 4 档 + 价格轴 label

### 5.3 `palette.ts` (颜色规范)

```ts
palette = {
  bg: '#151515', surface: '#f7f3ea', accent: '#d4a017', teal: '#0ea5a6',
  text: '#151515', textInverse: '#f7f3ea',
  candleUp: '#22c55e', candleDown: '#ef4444',
  font: 'Inter, Arial, sans-serif'
}
SMA_COLOR = {
  sma5:   '#60a5fa',  // 浅蓝
  sma20:  palette.accent,  // 金 (主线)
  sma80:  '#06b6d4',  // 青
  sma160: '#a855f7',  // 紫
  sma320: '#f43f5e',  // 玫红
  sma640: '#ec4899',  // 粉
}
EMA_COLOR = '#60a5fa';   // 浅蓝
VWMA_COLOR = '#a855f7';  // 紫
```

**章节色谱稳定性**：chapter-6/7 共享同一套 SMA 色，chapter-16/17 共享 Visa 数据 + 同一套色（其中 320 升为 `palette.accent` 主角）。

### 5.4 `SceneFade.tsx` (时间工具)

```ts
export const FPS = 30;
export const OUTRO_SECONDS = 2.5;
export const FADE_OUT_SECONDS = 0.5;

chapterOpacity(frame, durationSeconds, fadeInSeconds=0.7)
//   在 [0, fadeInSeconds*FPS] 淡入, 在 [duration-FADE_OUT, duration] 淡出

segmentOpacity(frame, start, end)
//   段字幕的淡入淡出 (Segment 边界 + 14 帧)
```

### 5.5 `AgendaItem` / `Pill` / `ProgressBar` / `Subtitles` (legacy)

- `AgendaItem`: chapter-3 的 6 问，左列偶数索引、右列奇数索引
- `Pill`: chapter-2 的 4 柱 (Foundation / Method / Roadmap / Promise)
- `ProgressBar`: 底部 8px 高
- `Subtitles`: 整段字幕（被 KaraokeSubtitle 取代，但代码保留）

---

## 6. 关键问题 & 痛点（迁移前必须修）

> 这些是真实暴露的、不是想象的问题。每条都附证据。

### 6.1 流水线接线不完整（高优先）

`scripts/build-chapter.mjs:88-93` 仍调旧的 `generate-audio.mjs`（probe+auto-fit），不是当前生产用的 `generate-audio-karaoke.mjs`。
**影响**：
- `npm run build:chapter-N` 会用旧管线重新覆盖 `words.ts` 和 `chapter-N.json` 的 `start/end/duration`，把卡拉OK对齐的结果冲掉
- `npm run build:all` 也是同样的事
- 解决：把 `build-chapter.mjs` 第 89 行的 `generate-audio.mjs` 换成 `generate-audio-karaoke.mjs`
- 证据：`docs/PROJECT_HANDBOOK.md:441` + `docs/PROJECT_HANDBOOK.md:484-486`

### 6.2 拼接没跟上手动产出（低优先但是显眼的）

`out/moving-average-full.mp4` 是 2026-06-15 拼接的 ch1-7 (77MB, 20013 KiB)。ch8-17 各自有 mp4 但**没有被拼进 full 视频**。
- 解决：重跑 `node scripts/build-all.mjs --skip-build`（前提是 ch8-17 mp4 还在）
- 证据：`out/` 目录清单，`_concat_final.log` 显示 7 个 input

### 6.3 Chrome 路径硬编码（环境耦合）

`build-chapter.mjs:35-36` 写死 `C:\Program Files\Google\Chrome\Application\chrome.exe`。
- 解决：和 `FFMPEG_PATH` 一样做 `CHROME_PATH` 环境变量 + 默认值

### 6.4 章节 JSON schema 不一致（中优先）

- `chapter-8.json` / `chapter-16.json` 缺 `type` / `subtitle` 字段
- `chapter-1.json` 有 `source` 字段，`chapter-2.json` 有 `source` 字段，`chapter-3` 没填——**手写规范不严格**
- `tsconfig` 排除 `src/scenes/_archive` 但该目录不存在（历史残留）
- 解决：在 `scripts/build-chapter.mjs` 入口加 schema 校验（用 `zod` 或自写）

### 6.5 卡拉OK字幕只渲染在画面下沿（视觉）

`KaraokeSubtitle` 强制 bottom=56、left/right=120/120、单行。
- 长段（>180 字符）会压字 28pt
- 解决：长段改为双行 + 滚动，或允许场景内嵌入"卡片式"字幕

### 6.6 `compositionOf` 表是手维护的脆弱映射

`build-chapter.mjs:25-43` 维护 `chapter-N → CompositionId` 字典，加一章要手加一行。
- 解决：让 `root.tsx` 自己导出这个映射（或者用 manifest.json 的 id 当作 composition id，统一命名）

### 6.7 `_*.log` 调试日志没清理（卫生）

`D:\YouTubeVideo\` 根目录散落 30+ 个 `_b*.log` `_align*.log` `_render.log` 等调试日志（~700KB 总和）。
- 解决：把日志归到 `out/_logs/` 或 `.gitignore`

### 6.8 `motion-canvas-demo/` 残留（卫生）

项目里有完整的 motion-canvas 试作目录，已被用户明确放弃。
- 解决：`mavis-trash motion-canvas-demo`

### 6.9 Manifest 路径硬编码（低）

`content/manifest.json.output.fullVideo` 是 `out/moving-average-full.mp4`，但 `concat.mjs:30-33` 兜底用 `out/moving-average-full.mp4` 没问题——**无问题**，但 `--out=...` 参数时容易踩坑。

### 6.10 miniTest 中 README 缺失

项目无 README，外部协作者 / 未来 AI 接手必须读 `docs/PROJECT_HANDBOOK.md` 才搞得清。
- 解决：写一个 1 页的 `README.md`，指向 `docs/PROJECT_HANDBOOK.md`

### 6.11 数据流无版本控制（高优先）

`content/*.json` 的 `start/end/duration` 是被脚本覆盖的（卡拉OK 流水线会改它），没有 git-friendly 的 idempotency 标记。
- 解决：把 `start/end/duration` 移到独立的 `content/.audio-alignment/` JSON，让 `chapter-N.json` 是真"原始稿"

### 6.12 TTS 切换 vendor 的代价（架构性）

整套流水线绑死 `MiniMax TTS` + `male-qn-qingse` + `speech-2.8-hd` + `word_streaming`。
- 这套时间戳机制不是所有 TTS 厂商都有（OpenAI TTS 只能 `verbose_json` 给词级但精度差；Google Cloud TTS 给 `timepoints` 但只有句级）
- 解决：在 `generate-audio-karaoke.mjs` 之上做一层 `TtsProvider` 抽象

---

## 7. Remotion 渲染细节（生产观察）

### 7.1 单帧渲染速度

- chapter-1: 305 帧 @ 30fps = 10.2s（实际渲染 ~14s）
- chapter-4: 540 帧 = 18s（实际 ~50s）
- 瓶颈是 **headless Chrome 启动 + bundle 编译**（每次重 build 都重新 bundle）
- `--concurrency=1` 写死，单核
- 改进：开 bundle cache（Remotion 默认行为），CI 持久化 `node_modules/.cache/remotion/`

### 7.2 渲染调用模板

```bash
npx remotion render src/index.ts <CompositionId> <outFile> \
  --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --concurrency=1
```

无 `--quality`、无 codec 选项——默认 h264 + AAC，单 mp4。

### 7.3 视觉动画模式（catalog）

| 章节 | 主视觉 | 关键动画 |
|---|---|---|
| ch-1 | 标题卡 (双色分割 + 斜线) | 斜线从 x=-160 滑到 210, 0-220 帧 |
| ch-2 | 4 Pill + 引言侧框 | 顶部斜条 sweep, 60→(duration-2.5-60) 帧 |
| ch-3 | 6 问清单 (2列3行) | segment 切换时高亮 |
| ch-4 | K线 + SMA20 渐入 | K线 0-3s 长出，SMA20 5s-6.5s 从左到右画 |
| ch-5 | K线 + SMA5/10 临时出现 | WHY20 段 (9.3-17.5s) 渐入 1s, 保持 6s, 渐出 1s |
| ch-6 | Sequence A: SMA5→20→80→160→640 | SEG2.start + {11,13,15,17}s 触发 |
| ch-7 | Sequence B: 5→20→80→320 | SEG0.start + {10.0, 11.4, 12.6}s 触发 |
| ch-8 | 纯文字图 | 静态 + 文字飞入 |
| ch-9 | K线 + SMA20/10/40 | 全部静态 |
| ch-10 | K线 + SMA20/EMA20/VWMA20 | 全部静态 |
| ch-11 | 合成 K线 + 副曲线 | 静态 + 进度条 |
| ch-12 | VWMA 强调 | — |
| ch-13 | 文字过渡 | — |
| ch-14 | 周期概念 | — |
| ch-15 | 多周期 (5/10/20/40/80/160) | 讲解式 |
| ch-16 | Visa 9 SMA, 320 高亮 | 静态 + hero 强化 |
| ch-17 | 同 ch16 + 浮动注释 | 注释按 segment id 切到 4 个角 |

### 7.4 动画时序的脆弱点

- ch-6/ch-7 的 `+11/13/15/17` / `+10.0/11.4/12.6` 是**硬编码的秒数偏移**——一旦 `englishNarration` 改字、segment 数变、TTS 节奏变，就会错位
- 验证：用户已在 2026-06-15 确认 ch-6/7 仍正常
- 解决：把"reveal 时机"绑定到 `KaraokeSubtitle` 的"当前词命中关键词"上，而不是秒数

---

## 8. 主题与数据

### 8.1 内容主题

YouTube 课程"图解精讲常用技术指标 — 均线（Lesson 1）"，17 章中文 → 英文口播 + 英文字幕 + 中文回译。

### 8.2 真实股票数据

- NVDA (chapter-4/5/6/7/9/10)：从 `content/data/chapter-4.csv` 切 30 根窗口（2026-03-13 → 2026-04-24），含 9 SMA 预计算值（来自更长历史集）
- Visa (chapter-16/17)：108 根（2026-01-13 → 2026-06-17），含 9 SMA
- CSV 列: `time, open, high, low, close, volume, SMA 5, 10, 20, 40, 80, 160, 320, 640, 1280`
- chapter-10 额外有 `EMA 20, VWMA 20`（从 TradingView 导出）

### 8.3 合成数据

chapter-11 用 xorshift32 PRNG (种子 42) 生成 60 根 K 线，模拟"温和回调 A"，用于讲 EMA 设计理念时不需要真实股票。

### 8.4 数据增强

`scripts/slice-chart-data.mjs` 的 `--start` / `--count` 灵活切窗口，方便重选视觉上有戏的 K 线段。`content/data/_window_report.txt` 是历史挑选记录。

---

## 9. TTS API 行为档案（已实测）

### 9.1 端点
`POST https://api.minimaxi.com/v1/t2a_v2`
鉴权：`Authorization: Bearer ${MINIMAX_API_KEY}`

### 9.2 字幕能力档位
- `subtitle_enable: false`（默认）→ 只返回 `data.audio` (hex)
- `subtitle_enable: true, subtitle_type: 'sentence'`（非流式）→ 返回 `data.subtitle_file` (OSS 链接，**24h 过期**)，内容是 JSON 数组，每项 `{text, pronounce_text, time_begin(ms), time_end(ms), text_begin, text_end, is_final_segment}`
- `subtitle_enable: true, subtitle_type: 'word_streaming'`（必须 `stream: true`）→ SSE 流，每 chunk `data.subtitle.timestamped_words: [{word, time_begin, time_end, word_begin, word_end}]`

### 9.3 已知坑
1. **句级切分不可靠**：61 字符 2 句测试输入只返回 1 个 entry，**未按 `.!?` 切**。所以生产不用句级。
2. **status=1 的 audio chunk 是累计+重叠的**（不是 incremental），不要拼接，要丢弃。
3. **status=2 才是完整 mp3**。
4. **词级是音节碎片**（"twenty" → "twen" + "ty"），要按 `charEnd == charBegin` 合并。
5. **`extra_info.audio_length` 单位是毫秒**。
6. **每个 chunk 的 `timestamped_words` 是该句的累计**（不是增量），所以去重要按 `time_begin` 而非数组下标。

### 9.4 当前生产参数（不可改）
```js
{
  model: 'speech-2.8-hd',
  voice_id: 'male-qn-qingse',
  language_boost: 'English',
  output_format: 'hex',
  voice_setting: {speed: 1, vol: 1, pitch: 0},
  audio_setting: {sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1},
  subtitle_enable: true,
  subtitle_type: 'word_streaming',
  stream: true
}
```

---

## 10. 工程元数据

### 10.1 文件计数（截至 2026-06-27）

| 类别 | 数量 |
|---|---|
| 章节 JSON | 17 个主 + 1 个 legacy intro + 17 个 .karaoke.bak |
| 章节 src/scenes 子目录 | 17 个 |
| 章节 words.ts (auto-gen) | 17 个（ch-1/2/3 子目录命名带后缀） |
| 章节 chart-data.ts | 9 个 (ch-4, 9, 10, 11, 12, 15, 16, 17) |
| 章节 mp4 产物 | 17 个 (ch-1 ~ ch-17) |
| 章节 mp3 产物 | 17 个 (在 public/audio/) |
| 章节 words.json | 17 个 (在 public/audio/) |
| 调试日志 | ~40 个 (`_*.log` 散布) |
| 文档 | 8 个 md (含 superpowers/specs/plans) |

### 10.2 总产物大小
- `out/moving-average-full.mp4`: 77.5 MB (ch1-7 拼接)
- 17 个章节 mp4 总计: ~95 MB
- 17 个章节 mp3 总计: ~18 MB
- 17 个 words.json 总计: ~370 KB

### 10.3 时间预算
- 一章渲染（headless Chrome + 540 帧）: ~30-50s
- 17 章全跑: ~15-20min
- concat: <1s
- 一次完整 build-all: ~25min

### 10.4 已知不稳的脚本调用
- `npm run audio:chapter-N` → 调 `generate-audio.mjs`（**旧**），不是卡拉OK
- `npm run build:chapter-N` → 内部调旧 `generate-audio.mjs`
- `npm run render:chapter-N` → 直接调 `remotion render`，跳过音频生成
- **`scripts/generate-audio-karaoke.mjs` 没在 package.json 里被 alias**（必须用 `node scripts/generate-audio-karaoke.mjs`）

---

## 11. 迁移到 luhuo-mp4 的建议清单

> 不是"必须做"，是"按性价比排"。

### P0（必做）
1. 修 §6.1：把 `build-chapter.mjs` 的 audio step 切到 karaoke 流水线
2. 跑一次全量 build-all 验证 ch1-17 端到端，重新拼 `moving-average-full.mp4`
3. 加 `README.md` 指向 PROJECT_HANDBOOK

### P1（强烈建议）
4. §6.6: 把 `COMPOSITION_OF` 字典改成 `root.tsx` 导出的常量
5. §6.4: 章节 JSON schema 校验（`zod` 或自写）
6. §6.11: 把"被脚本覆盖的 start/end/duration"从 `chapter-N.json` 剥到独立 alignment 文件
7. §6.3: Chrome 路径走环境变量

### P2（可选）
8. §6.5: 卡拉OK字幕加"卡片式"备选
9. §6.7/6.8: 清理调试日志和 `motion-canvas-demo/`
10. §7.4: 动画触发从"秒数偏移"改到"词命中"

### P3（架构演进）
11. §6.12: TtsProvider 抽象
12. §6.2: 让 build-all 不依赖 manifest 输出路径常量
13. 考虑 `--keep-hierarchy` 让 preview 支持多端口（已有 `preview:chapter-1` 等脚本，但端口 3011-3013 写死）

---

## 12. 给 ChatGPT 的"快速问答"

**Q1: 这个项目用什么渲染视频？**
A: Remotion 4.0.473，headless Chrome，30fps，1920×1080。`--concurrency=1` 写死。

**Q2: 音频怎么来的？**
A: MiniMax TTS API (`https://api.minimaxi.com/v1/t2a_v2`)，`speech-2.8-hd` 模型，`male-qn-qingse` 声音，32kHz/128kbps/mono MP3。

**Q3: 字幕怎么对齐的？**
A: 流式 TTS 自带 `word_streaming` 时间戳。`generate-audio-karaoke.mjs` 收集所有 chunk 的 `timestamped_words`，合并音节碎片，按字符区间映射回 segment，写回 `chapter-N.json` 的 `start/end/duration`。零漂移。

**Q4: 关键文件路径？**
- 入口: `src/index.ts` → `src/root.tsx`
- 核心 pipeline: `scripts/generate-audio-karaoke.mjs`
- 内容源: `content/manifest.json` + `content/chapter-N.json`
- 共享组件: `src/scenes/shared/`
- 完整说明: `docs/PROJECT_HANDBOOK.md` (592 行，最权威)

**Q5: 现在能跑出完整视频吗？**
A: ch1-7 完整拼接过 (`out/moving-average-full.mp4`)。ch8-17 各自有 mp4，但没拼进 full 视频。重拼需要先修 §6.1（否则 build-all 会用旧 pipeline 覆盖数据），然后 `node scripts/build-all.mjs`。

**Q6: 这套设计的最大优势是什么？**
A: 字幕的"开始/结束"和卡拉OK高亮的"当前词"全部由 TTS API 给的词级时间戳驱动，**音频 → 字幕 → 动画时序 完全闭环**。改文案后只要重跑 karaoke 脚本（30s），所有时序自动同步，不需要人手校秒数。

**Q7: 最大的坑是什么？**
A: TTS vendor 绑定。一旦换厂商（OpenAI/Google/字节），整套 word_streaming 机制要重写或模拟。

---

> 文档结束。扫描时点 2026-06-27 16:03。基线 commit 不可考（无 git log），但产物 mp3/mp4/words.json 的修改时间集中在 2026-06-15（ch1-7）和 2026-06-17（ch8-11 实施）附近。
