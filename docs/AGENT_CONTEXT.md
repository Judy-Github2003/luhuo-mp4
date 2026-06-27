# Agent Context — luhuo-mp4

> 目的：让任何新接手本项目的 agent（ChatGPT、ZCode、其他）能在 5 分钟内理解项目目标、当前状态、已知问题、关键文件和"不要做的事情"。

---

## 1. 项目是什么

`luhuo-mp4` 是一个**炉霍藏族传统文化宣传短片**自动化生成项目。

- **片名**：《一件藏袍里的炉霍》
- **主题**：四川甘孜炉霍县藏族传统文化 / 炉霍博物馆相关视觉短片
- **时长**：约 60 秒（v4.1 实测 ~60.31s）
- **比例**：横屏 16:9
- **规格**：1920×1080 · 30fps · MP4 · h264
- **旁白**：普通话男声
- **字幕**：中文字幕真正贴底；藏文字段先留空（不渲染）
- **技术路线**：Remotion + MiniMax TTS + MiniMax Hub 视频 / ChatGPT 静态图

---

## 2. 当前 v4.1 状态

v4.1 已出片（替代 v4）：

- **当前成片**：`out/luhuo-main.mp4`（不入库）
- v4 备份：`out/luhuo-main-v4-no-black-subtitle-bottom.mp4`
- v4.1 备份：`out/luhuo-main-v4.1-no-empty-head-tail.mp4`
- 时长：约 60.31 秒（1808 帧 @ 30fps）
- 分辨率：1920×1080
- 视觉结构：
  - 5 段真视频：`shot-01 / shot-04 / shot-06 / shot-10 / shot-12`
  - 7 张静态图：`shot-02 / shot-03 / shot-05 / shot-07 / shot-08 / shot-09 / shot-11`
- 转场：**shot 之间直接硬切**，无 fade、无黑场、无 crossfade
- 字幕：中文字幕**真正贴底**（普通 absolute div + bottom: 32）；藏文为空时不渲染

### v4.1 修复（最新）

| 类别 | 改动 |
|---|---|
| 首帧兜底 | `LuhuoMain.tsx` map 块：第一个 shot 强制 `startFrame = 0`（避免 shot-01.start=0.04 → frame 1 起 → 第 0 帧空） |
| 尾帧兜底 | `LuhuoMain.tsx` map 块：最后一个 shot 强制 `endFrame = durationInFrames`（避免 shot-12.end=57.46 → 1808 帧 → 1724-1808 共 2.8s 空） |
| shots.json | **未改**（避免被 TTS 脚本覆盖） |

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

## 4. 仍未处理的问题

1. ⚠️ shot-01 / shot-04 / shot-10 / shot-12 的 video 5.88s > Sequence 4-5s，会被 Remotion 截断（v4 接受，v5 再处理）
2. 12 独立视频架构（用 Remotion / ffmpeg 拼接）
3. 藏文字幕补齐
4. 旁白与镜头起止时间更精细对齐

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