# Agent Context — luhuo-mp4

> 目的：让任何新接手本项目的 agent（ChatGPT、ZCode、其他）能在 5 分钟内理解项目目标、当前状态、已知问题、关键文件和"不要做的事情"。

---

## 1. 项目是什么

`luhuo-mp4` 是一个**炉霍藏族传统文化宣传短片**自动化生成项目。

- **片名**：《一件藏袍里的炉霍》
- **主题**：四川甘孜炉霍县藏族传统文化 / 炉霍博物馆相关视觉短片
- **时长**：约 60 秒（v6 实测 ~60.31s）
- **比例**：横屏 16:9
- **规格**：1920×1080 · 30fps · MP4 · h264
- **旁白**：普通话男声
- **字幕**：中文字幕 + 藏文字幕（双语，真正贴底；藏文字段由 ChatGPT 提供，文博宣传片书面风格，**发布前建议藏语母语者校对**）
- **封面**：1920×1080 PNG，**文字由代码叠加**（避免 AI 生成伪藏文）
- **技术路线**：Remotion + MiniMax TTS + MiniMax Hub 图生视频（Hailuo-2.3）+ ChatGPT 静态图 + ffmpeg 抽帧

---

## 2. 当前 v6 状态

v6 已出片（替代 v5）：

- **当前成片**：`out/luhuo-main.mp4`（不入库）
- v4 备份：`out/luhuo-main-v4-no-black-subtitle-bottom.mp4`
- v4.1 备份：`out/luhuo-main-v4.1-no-empty-head-tail.mp4`
- v5 备份：`out/luhuo-main-v5-12video.mp4`
- v6 备份：`out/luhuo-main-v6-tibetan-subtitle.mp4`
- **封面**：`out/luhuo-cover-v6.png`（1920×1080）
- 时长：约 60.31 秒（1808 帧 @ 30fps）
- 分辨率：1920×1080
- 视觉结构：**12 段真视频**
- 转场：**shot 之间直接硬切**，无 fade、无黑场、无 crossfade
- 字幕：**中文字幕 + 藏文字幕**（藏文 12 段全部填入，`boSubtitle` 非空；藏文 + 中文分两行；字号小幅下调）

### v6 升级（最新）

| 类别 | 改动 |
|---|---|
| 12 段藏文字幕 | `content/shots.json` 12 段 `boSubtitle` 从 `""` 填入 ChatGPT 提供的藏文（文博宣传片书面风格） |
| 字幕字号小幅下调 | `BilingualSubtitle.tsx` 默认值：zh 44→40、bo 36→32、bottom 32→24、padding 14px 48px→10px 36px |
| LuhuoCover composition | 新建 `src/compositions/LuhuoCover.tsx`（1920×1080），文字全部由代码叠加（避免 AI 伪藏文） |
| 封面背景抽帧 | 新建 `scripts/extract-cover-frame.mjs`（ffmpeg 从 shot-12.mp4 抽中间帧到 `public/luhuo-cover-bg.png`，已 .gitignore 排除） |
| root.tsx 注册 | 新增 LuhuoCover composition（durationInFrames=1，width/height=1920×1080） |

### v5 升级

### v4.1 修复

| 类别 | 改动 |
|---|---|
| 首帧兜底 | `LuhuoMain.tsx` map 块：第一个 shot 强制 `startFrame = 0` |
| 尾帧兜底 | `LuhuoMain.tsx` map 块：最后一个 shot 强制 `endFrame = durationInFrames` |

### v4 主要变更

| 类别 | 改动 |
|---|---|
| 黑场转场 | 删 `FadeInOut` 组件；Sequence 内不再包裹；外层背景 `#0a0a0a` → `transparent` |
| 字幕贴底 | `BilingualSubtitle` 外层 `<AbsoluteFill>` → 普通 `<div style={{position:absolute, bottom:32}}>` |
| shot-06 黑底 | `shots.json` shot-06.end 从 `29.82` 改 `28.07`（Sequence 7.63s → 5.88s，与 video 对齐） |
| 间隙填实 | shot-04.start `13.23` → `12.71`；shot-07.start `30.28` → `28.07`；shot-10.start `43.81` → `43.38` |
| 时长排查 | 新增 `scripts/probe-shot-durations.mjs` + `docs/shot-durations.md` |

---

## 3. 已修复的问题

按优先级：

1. ✅ **黑场转场**（v4）：删除 FadeInOut，shot 之间直接硬切
2. ✅ **字幕贴底**（v4）：外层改为普通 absolute div
3. ✅ **shot-06 空帧 / 黑底**（v4）：end 改 28.07，Sequence 与 video 对齐
4. ✅ **3 个间隙**（v4）：shot-04/07/10 的 start 填实
5. ✅ **首帧空画面**（v4.1）：第一个 shot 强制 frame 0
6. ✅ **尾段空画面**（v4.1）：最后一个 shot 撑到 durationInFrames
7. ✅ **7 段静态图升级为视频**（v5）：12 段全是真视频
8. ✅ **12 段藏文字幕**（v6）：boSubtitle 全部非空
9. ✅ **1920×1080 封面**（v6）：LuhuoCover composition，文字由代码叠加

## 4. 仍未处理的问题

1. ⚠️ shot-01 / 04 / 10 / 12 的 video 5.88s > Sequence 4-5s，会被 Remotion 截断（v6 接受）
2. ⚠️ shot-08 sequence 5.93s > video 5.88s，后段约 0.05s 可能是空帧（v6 接受，肉眼几乎不可见）
3. ⚠️ **藏文未做母语者校对**（ChatGPT 提供的书面风格，**公开发布前必须**）
4. 12 独立视频架构（用 Remotion / ffmpeg 拼接）
5. 旁白与镜头起止时间更精细对齐

---

## 4. 当前关键文件

```
D:\YouTubeVideo\luhuo-mp4\
├── package.json
├── package-lock.json
├── tsconfig.json
├── remotion.config.ts
├── .gitignore
├── README.md
├── docs\
│   └── AGENT_CONTEXT.md
├── content\
│   ├── shots.json              # 当前主表
│   └── shots.json.v0.bak       # 历史快照（已 force add 入库）
├── src\
│   ├── index.ts
│   ├── root.tsx
│   ├── compositions\
│   │   └── LuhuoMain.tsx
│   ├── components\
│   │   ├── BilingualSubtitle.tsx
│   │   ├── ShotVideo.tsx
│   │   └── TitleCard.tsx
│   └── scenes\shared\palette.ts
├── scripts\
│   ├── generate-audio.mjs       # TTS 音频 + 字级时间戳
│   ├── verify-assets.mjs        # 素材校验
│   ├── build-video.mjs          # 端到端构建入口
│   ├── probe-minimax-tts.mjs    # 探测 TTS 接口
│   └── probe-key.mjs            # 探测 key 余额 / quota
├── mcp_args.json                # 5 段图生视频的 MCP 参数（调试产物，已入库）
├── mcp_test.json                # 单 shot MCP 测试
├── mcp_call.log                 # MCP 调用日志
├── mcp_test.log                 # MCP 测试日志
├── mcp_test2.log                # MCP 测试日志
├── build-mcp-args.ps1           # 构造 mcp_args.json（PowerShell 版）
├── build-mcp-args.py            # 构造 mcp_args.json（Python 版）
├── build-mcp-test.py            # 单 shot 测试
├── ffprobe.json                 # out/luhuo-main.mp4 的 ffprobe 输出
├── *.log                        # 各种构建/探测日志（被 .gitignore 排除）
└── hub-5-shots-manual.md        # Hub 5 段图生视频的人工流程记录
```

**入库情况**：

- ✅ 入库：源码、配置、`content/`、`scripts/`、`mcp_*`、`build-mcp-*`、`ffprobe.json`、所有 `*.md` 报告
- ❌ **不入库**：`node_modules/`、`out/`、`public/audio/`、`public/videos/`、`public/images/`、`img/`、`.env`、所有 `*.log`

---

## 5. 当前不要改 / 不要解决的内容

接手本项目的 agent **请勿主动修改**以下工程问题（属于后续轮次）：

- ❌ shot-01/04/10/12 video 被截断（v4 接受）
- ❌ 12 独立视频架构
- ❌ 藏文字幕补齐
- ❌ 重跑 TTS
- ❌ 重新生成视频素材
- ❌ 重新渲染视频
- ❌ 修改当前成片
- ❌ **绝对不要**加任何 fade 转场 / FadeInOut / 黑底 / fade-through-black

**本项目当前首要任务**是让 ChatGPT 能通过 GitHub 查阅代码。次要任务是排查剩余时长精度问题。

---

## 9. v4.1 补充：shot-12 end 显示问题

`docs/shot-durations.md` 表格中 `shot-12` 的 `end` 仍显示 `57.46s` —— **这是 v4.1 的预期行为**，不是 bug。

原因：

- v4.1 没有改 `content/shots.json`（避免被 TTS 脚本覆盖）
- v4.1 在 Remotion 渲染层把最后一个 shot 的 `endFrame` 撑到 `durationInFrames`
- 所以 `probe-shot-durations.mjs` 输出仍是 shots.json 原始值 57.46，但实际渲染时 shot-12 Sequence 会延伸到 composition 末尾

校验方法：直接看 v4.1 mp4 末尾帧，或在浏览器预览中确认 shot-12 持续到最后一帧。

---

## 6. 下一轮工程优先级（v5+）

1. 解决 shot-01/04/10/12 video 截断问题（可通过调整 shots.json 的 end 或重新生成更短 video）
2. 改成 12 个独立视频，再用 ffmpeg / Remotion 拼接
3. 补藏文字幕
4. 旁白与镜头起止时间更精细对齐

---

## 7. GitHub 同步说明

- 仓库名：`luhuo-mp4`
- 可见性：public（供 ChatGPT / 其他 agent 查阅）
- 账户：`Judy-Github2003`
- 默认分支：`main`
- 上传策略：仅源码 + 配置 + 内容 JSON + 脚本 + 报告 + MCP 调试产物，不传媒体素材和渲染产物

---

## 8. 给新 agent 的一句话

> 「这是一个 Remotion 短视频自动化项目，v4 已出片（删除了 v3 的 FadeInOut 黑场转场、字幕真正贴底、shot-06 黑底修复、3 个间隙填实）。**绝对不要加任何黑场转场**。如果用户明确要求修下一个问题，按第 6 节优先级处理。」