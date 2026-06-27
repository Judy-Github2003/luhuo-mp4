# Agent Context — luhuo-mp4

> 目的：让任何新接手本项目的 agent（ChatGPT、ZCode、其他）能在 5 分钟内理解项目目标、当前状态、已知问题、关键文件和"不要做的事情"。

---

## 1. 项目是什么

`luhuo-mp4` 是一个**炉霍藏族传统文化宣传短片**自动化生成项目。

- **片名**：《一件藏袍里的炉霍》
- **主题**：四川甘孜炉霍县藏族传统文化 / 炉霍博物馆相关视觉短片
- **时长**：约 60 秒（v3 实测 60.27s）
- **比例**：横屏 16:9
- **规格**：1920×1080 · 30fps · MP4 · h264
- **旁白**：普通话男声
- **字幕**：中文字幕（可显示）；藏文字段先留空
- **技术路线**：Remotion + MiniMax TTS + MiniMax Hub 视频 / ChatGPT 静态图

---

## 2. 当前 v3 状态

v3 已出片：

- **当前成片**：`out/luhuo-main.mp4`（不入库）
- 时长：约 60.27 秒
- 分辨率：1920×1080
- 视觉结构：
  - 5 段真视频：`shot-01 / shot-04 / shot-06 / shot-10 / shot-12`
  - 7 张静态图：`shot-02 / shot-03 / shot-05 / shot-07 / shot-08 / shot-09 / shot-11`
- 字幕：中文字幕可显示，藏文为空

---

## 3. 用户已反馈的 5 个核心问题（暂不修）

按优先级：

1. **时间对齐 / 黑屏问题**
2. **转场衔接需要更像"黑一下衔接"**
3. **字幕定位仍偏中，应贴底**
4. **倾向后续改成 12 个独立视频**，再用 Remotion / ffmpeg 拼接
5. **需要上传 GitHub，供 ChatGPT 查阅代码**（本任务就是为了这个）

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

- ❌ 时间对齐 / 黑屏
- ❌ 字幕贴底
- ❌ 转场衔接
- ❌ 12 独立视频架构
- ❌ 藏文字幕补齐
- ❌ 重跑 TTS
- ❌ 重新生成视频素材
- ❌ 重新渲染视频
- ❌ 修改当前成片

**本项目当前首要任务**是让 ChatGPT 能通过 GitHub 查阅代码。次要任务才是上述工程优化。

---

## 6. 下一轮工程优先级

1. 解决时间对齐 / 黑屏问题
2. 改转场为"黑一下衔接"
3. 字幕贴底
4. 改成 12 个独立视频，再用 ffmpeg / Remotion 拼接
5. 补藏文字幕

---

## 7. GitHub 同步说明

- 仓库名：`luhuo-mp4`
- 可见性：public（供 ChatGPT / 其他 agent 查阅）
- 账户：`Judy-Github2003`
- 默认分支：`main`
- 上传策略：仅源码 + 配置 + 内容 JSON + 脚本 + 报告 + MCP 调试产物，不传媒体素材和渲染产物

---

## 8. 给新 agent 的一句话

> 「这是一个 Remotion 短视频自动化项目，v3 已出片，但还有 5 个工程问题没解决。本轮你不需要修这些问题。如果用户明确要求修某一个，再按顺序处理。」