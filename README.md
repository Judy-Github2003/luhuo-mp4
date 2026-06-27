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

## 当前状态（v3）

- 已出片：`out/luhuo-main.mp4`（不入库）
- 视觉结构：**5 段真视频 + 7 张静态图**（共 12 个镜头）
  - 真视频：`shot-01 / shot-04 / shot-06 / shot-10 / shot-12`
  - 静态图：`shot-02 / shot-03 / shot-05 / shot-07 / shot-08 / shot-09 / shot-11`
- 音频：1 条普通话旁白，含 254 个字级时间戳
- 字幕：中文字幕可显示，藏文为空

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

1. 时间对齐 / 黑屏问题
2. 转场衔接（更像"黑一下衔接"）
3. 字幕贴底（目前偏中）
4. 12 独立视频架构（用 Remotion / ffmpeg 拼接）
5. 藏文字幕补齐

## 许可与备注

- 项目内部使用，公开仓库仅供 ChatGPT / 其他 agent 查阅代码
- 所有媒体素材（音频、视频、图片）默认**不入库**
- 上传前已扫描敏感词：未发现真实 API key，所有命中均为文档中的占位符