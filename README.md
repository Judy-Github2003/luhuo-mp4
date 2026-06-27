# luhuo-mp4

炉霍藏族传统文化视觉短片自动化生成项目。

> 片名：《一件藏袍里的炉霍》
> 主题：四川甘孜炉霍县藏族传统文化 / 炉霍博物馆相关视觉短片
> 时长：约 60 秒（当前 60.27s）
> 比例：横屏 16:9 · 1920×1080 · 30fps · MP4
> 旁白：普通话男声（speech-2.8-hd · voice: male-qn-jingying）
> 字幕：中文为主；藏文字段先留空，后续再补

## 技术栈

- Remotion 4（视频编排 / 渲染）
- React + TypeScript
- Node.js
- MiniMax TTS v2（音频生成 + 字级时间对齐）
- MiniMax Hub matrix_batch_image_to_video（5 段图生视频，手工模式）
- ChatGPT 图生图（首帧参考图）
- ffmpeg / ffprobe（封装、探测）

## 当前状态（v5 12-video）

- 已出片：`out/luhuo-main.mp4`（不入库）
  - v4 备份：`out/luhuo-main-v4-no-black-subtitle-bottom.mp4`
  - v4.1 备份：`out/luhuo-main-v4.1-no-empty-head-tail.mp4`
  - v5 备份：`out/luhuo-main-v5-12video.mp4`
- 视觉结构：**12 段真视频**（v3 Hub 5 段 + v5 Hub 7 段）
  - 全部 video：`shot-01 ~ shot-12` 都是 `videos/shot-XX.mp4`
- 音频：1 条普通话旁白，含 254 个字级时间戳
- 字幕：中文字幕真正贴底（不再偏中），藏文为空时不渲染

### v5 升级（最新）

1. **7 段静态图升级为视频**：shot-02/03/05/07/08/09/11 通过 MiniMax Hub (Hailuo-2.3, 图生视频 first_frame, 1080P) 生成
2. **12 段全是真视频**：v3 的 5 段 + v5 的 7 段，总计 12 段视频
3. **shots.json 同步改造**：7 段 visual.type 从 `image` 改为 `video`，src 指向 `videos/shot-XX.mp4`
4. **保留所有 v4 / v4.1 修复**：黑场转场删除、字幕贴底、首帧 frame 0、尾帧 durationInFrames 兜底
5. **未做**：12 独立视频架构、未补藏文、未重跑 TTS、未改字幕文本

### v4.1 修复

1. **首帧兜底**：第一个 shot 强制从 `frame 0` 开始（避免 shot-01.start=0.04 → frame 1 起 → 第 0 帧空）
2. **尾帧兜底**：最后一个 shot 撑到 `durationInFrames`（避免 shot-12.end=57.46 → 1808 帧 → 1724-1808 共 2.8s 空）
3. **渲染层兜底**，不改 `shots.json`（避免被 TTS 脚本覆盖）
4. **中间 shot 仍按 shots.json** 的 start/end，shot 之间仍直接硬切

### v4 主要修复

1. **彻底禁止黑场转场**
   - 删除 v3 的本地 `FadeInOut` 组件
   - shot 之间采用**直接硬切**，不再 fade
   - 外层 `<AbsoluteFill>` 背景从 `#0a0a0a` 改为 `transparent`，避免间隙期间透出黑色
   - 不引入 `@remotion/transitions`、不使用 `TransitionSeries`
2. **字幕真正贴底**
   - `BilingualSubtitle` 外层由 `<AbsoluteFill>` 改为普通 `<div>` + 显式 `position: absolute; bottom: 32`
   - 不再被 AbsoluteFill 撑满导致字幕被 flex 居中到画面中部
3. **时长排查与修复**
   - 新增 `scripts/probe-shot-durations.mjs`：自动对比 shots.json Sequence 时长 vs ffprobe 真实时长
   - 修复 `shot-06.end`（22.19+5.88=28.07），避免 Sequence 7.63s 但 video 5.88s 导致 1.75s 黑底
   - 填实 3 个间隙（shot-03↔04 / 06↔07 / 09↔10 各 0.4-0.5s）
   - 输出 `docs/shot-durations.md`，作为排查记录

## 上传到 GitHub 时的范围

本仓库**只上传源码、配置、内容 JSON、脚本和报告**，**不上传**：

- `node_modules/`
- `out/`（渲染产物）
- `public/audio/`、`public/videos/`、`public/images/`（媒体素材）
- `img/`（ChatGPT 生成的首帧参考图）
- 任何 `.env` / 真实 API key

完整上传报告见 `docs/AGENT_CONTEXT.md`。

## 常用命令

```bash
# 安装依赖
npm install

# 仅生成音频（不渲染）
npm run audio

# 仅探测 TTS 配额
npm run probe:tts

# 全流程构建（先音频 → 校验素材 → 渲染）
npm run build

# Remotion 直接渲染
npm run render

# 启动 Remotion 预览（开发用）
npm run preview
```

> 渲染依赖本地 Chrome：`C:\Program Files\Google\Chrome\Application\chrome.exe`
> 也可通过环境变量 `CHROME_PATH` 覆盖。

## 关键文件

```
content/shots.json            当前内容主表（音视频对齐、时长、字幕）
content/shots.json.v0.bak     v0 历史快照
src/compositions/LuhuoMain.tsx       主 Composition
src/components/BilingualSubtitle.tsx 双语字幕组件
src/components/ShotVideo.tsx         单镜头视频/静态图组件
src/components/TitleCard.tsx         片头/片尾标题组件
src/scenes/shared/palette.ts         配色 / 公共样式
scripts/generate-audio.mjs           调 TTS 生成音频 + 字级时间戳
scripts/verify-assets.mjs            校验素材是否齐全
scripts/build-video.mjs              端到端构建入口
scripts/probe-minimax-tts.mjs        探测 MiniMax TTS 接口
scripts/probe-key.mjs                探测 key 配额（余额 / quota）
remotion.config.ts                   Remotion 配置
```

## 后续工程优先级（不在本任务范围）

v3 → v4 → v4.1 → v5 全部修复：黑场转场、字幕贴底、首帧 frame 0、尾帧 durationInFrames、shot-06 空帧、3 个间隙、7 段静态图升级为视频。

仍未处理：
1. shot-01 / 04 / 08 / 10 / 11 / 12 的 video 5.88s 与 Sequence 4-5s 不严格对齐，会被 Remotion 截断或尾部 0.05s 空帧（v5 接受，v6 再处理）
2. 12 独立视频架构（用 Remotion / ffmpeg 拼接）
3. 藏文字幕补齐
4. 旁白与镜头起止时间更精细对齐

## 许可与备注

- 项目内部使用，公开仓库仅供 ChatGPT / 其他 agent 查阅代码
- 所有媒体素材（音频、视频、图片）默认**不入库**
- 上传前已扫描敏感词：未发现真实 API key，所有命中均为文档中的占位符