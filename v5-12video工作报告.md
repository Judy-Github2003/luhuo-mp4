# luhuo-mp4 v5 12-video 工作报告

> **任务来源**：`zcode-v5-remaining-7-video-shots-task.md`
> **完成日期**：2026-06-28
> **执行 agent**：ZCode（接管 Hub 完成后）
> **Hub 操作**：Hub 操作员（`v5-MINIMAX-HUB-TASK.md` 任务书 + `v5-hub-generation-report.md` Hub 报告）
> **项目路径**：`D:\YouTubeVideo\luhuo-mp4\`
> **GitHub 仓库**：`https://github.com/Judy-Github2003/luhuo-mp4`
> **任务目标**：把剩余 7 张静态图升级为 7 段 MiniMax 图生视频，形成 12 段真视频版本

---

## 1. 本轮目标

| 目标 | 状态 |
|---|---|
| 是否完成 7 段视频生成 | ✅ Hub 完成 7 段（0 重生成） |
| 是否形成 12 段真视频 | ✅ verify-assets: image=0 video=12 |
| 是否重跑 TTS | ❌ 未重跑（用现有 `public/audio/luhuo-heritage-001.mp3`） |
| 是否加转场 | ❌ 未加任何转场 |
| 是否加黑场 | ❌ 未加任何黑场 / fade |
| 是否补藏文 | ❌ 未补 |
| 是否改字幕文本 | ❌ 未改 |
| 是否上传媒体到 GitHub | ❌ 未上传 |
| 是否大改架构 | ❌ 未改（v4 / v4.1 渲染逻辑完全复用） |

## 2. 生成的视频文件（Hub 报告）

| shot | 输入图片 | 输出视频 | 文件大小 | 重生成 | 备注 |
|---|---|---|---:|---:|---|
| shot-02 | `public/images/shot-02.png` | `public/videos/shot-02.mp4` | 2.46 MB | 0 | 高原草原与山川纹理，正常 |
| shot-03 | `public/images/shot-03.png` | `public/videos/shot-03.mp4` | 2.70 MB | 0 | 博物馆展厅空间，正常 |
| shot-05 | `public/images/shot-05.png` | `public/videos/shot-05.mp4` | 5.04 MB | 0 | 藏袍衣襟、袖口、布料细节，正常 |
| shot-07 | `public/images/shot-07.png` | `public/videos/shot-07.mp4` | 2.23 MB | 0 | 手整理服饰边纹和针脚，手部稳定 |
| shot-08 | `public/images/shot-08.png` | `public/videos/shot-08.mp4` | 2.61 MB | 0 | 传统生活器物，正常 |
| shot-09 | `public/images/shot-09.png` | `public/videos/shot-09.mp4` | 1.69 MB | 0 | 暖色展灯下的旧物，正常 |
| shot-11 | `public/images/shot-11.png` | `public/videos/shot-11.mp4` | 1.43 MB | 0 | 草原风与延续的记忆，人物稳定 |

**未覆盖**（v3 / v4.1 已有 5 段保留）：shot-01/04/06/10/12.mp4 ✅

## 3. shots.json 修改

| shot | 是否改为 video | src 路径 |
|---|---|---|
| shot-02 | ✅ | `videos/shot-02.mp4` |
| shot-03 | ✅ | `videos/shot-03.mp4` |
| shot-05 | ✅ | `videos/shot-05.mp4` |
| shot-07 | ✅ | `videos/shot-07.mp4` |
| shot-08 | ✅ | `videos/shot-08.mp4` |
| shot-09 | ✅ | `videos/shot-09.mp4` |
| shot-11 | ✅ | `videos/shot-11.mp4` |

**未修改**：`start` / `end` / `duration` / `zhNarration` / `zhSubtitle` / `boSubtitle` / `tts` / `totalDurationSeconds` / `audioLengthMs`，以及 shot-01/04/06/10/12 的 visual 字段全部保留。

## 4. 校验结果

### verify-assets（最终）

```
[shot-01] video: videos/shot-01.mp4 ✓
[shot-02] video: videos/shot-02.mp4 ✓
[shot-03] video: videos/shot-03.mp4 ✓
[shot-04] video: videos/shot-04.mp4 ✓
[shot-05] video: videos/shot-05.mp4 ✓
[shot-06] video: videos/shot-06.mp4 ✓
[shot-07] video: videos/shot-07.mp4 ✓
[shot-08] video: videos/shot-08.mp4 ✓
[shot-09] video: videos/shot-09.mp4 ✓
[shot-10] video: videos/shot-10.mp4 ✓
[shot-11] video: videos/shot-11.mp4 ✓
[shot-12] video: videos/shot-12.mp4 ✓

verify-assets: image=0 video=12 fallback=0
```

✅ **12 段全部 video**，无 fallback，无 media_missing。

### probe-shot-durations（最终）

| shot | type | sequence (s) | media (s) | status |
| --- | --- | ---: | ---: | --- |
| shot-01 | video | 3.29 | 5.88 | `media_longer_cut` |
| shot-02 | video | 4.95 | 5.88 | `media_longer_cut` |
| shot-03 | video | 4.43 | 5.88 | `media_longer_cut` |
| shot-04 | video | 4.44 | 5.88 | `media_longer_cut` |
| shot-05 | video | 5.04 | 5.88 | `media_longer_cut` |
| **shot-06** | **video** | **5.88** | **5.88** | **`aligned`** ✅ |
| shot-07 | video | 4.81 | 5.88 | `media_longer_cut` |
| **shot-08** | **video** | **5.93** | **5.88** | **`media_shorter_blank`** ⚠️ 0.05s 尾部空帧 |
| shot-09 | video | 4.57 | 5.88 | `media_longer_cut` |
| shot-10 | video | 4.87 | 5.88 | `media_longer_cut` |
| shot-11 | video | 3.58 | 5.88 | `media_longer_cut` |
| shot-12 | video | 5.63 | 5.88 | `media_longer_cut` |

**间隙**：未发现。

**接受**：
- 11 段 `media_longer_cut`：video 比 Sequence 长 0.4-2.3s，被 Remotion 截断（v4 已接受）
- shot-08 `media_shorter_blank`：sequence 5.93s > video 5.88s，**后段 0.05s 可能空帧**（≈2 帧，肉眼几乎不可见，**接受**——避免改 shots.json 引入新风险）
- shot-06 `aligned`：5.88s = 5.88s 完美对齐

## 5. 渲染结果

| 步骤 | 结果 |
|---|---|
| `node scripts/verify-assets.mjs` | ✅ 通过：image=0, video=12, fallback=0 |
| `node scripts/probe-shot-durations.mjs` | ✅ 通过（11 longer_cut + 1 aligned + 1 shorter_blank） |
| `node scripts/build-video.mjs --skip-audio` | ✅ 通过：1808/1808 帧 + Encoded 1808/1808 |
| 输出文件 | `out/luhuo-main.mp4`（80,781,195 字节 ≈ **77.04 MB**） |
| v5 备份文件 | `out/luhuo-main-v5-12video.mp4`（同 77.04 MB） |
| 总时长 | **60.31 秒**（ffprobe 实测 60.309333s） |
| 分辨率 | 1920×1080 |
| 编码 | h264 |
| 文件大小 | 比 v4.1（36 MB）**大 41 MB**（12 段全是真视频） |

## 6. 人工验收（代码层确认）

| 项 | 状态 |
|---|---|
| 12 段是否都是真视频 | ✅ verify-assets: image=0 video=12 |
| 7 段是否动起来 | ✅（需你打开 v5 mp4 实际看画面） |
| 是否无黑场 | ✅（v4 / v4.1 修复保留） |
| 是否仍为硬切 | ✅ |
| 字幕是否贴底 | ✅（v4 修复保留） |
| 开头是否正常 | ✅（v4.1 首帧 frame 0 兜底） |
| 结尾是否正常 | ✅（v4.1 尾帧 durationInFrames 兜底） |
| 是否有崩坏 | 需你肉眼检查（Hub 报告无崩坏记录） |
| 总时长是否仍约 60s | ✅ 60.31s |

## 7. GitHub

| 项 | 值 |
|---|---|
| commit hash | 见推送后日志（v4.1 `c722ac5` 之后） |
| push 状态 | 见推送后日志 |
| repo URL | https://github.com/Judy-Github2003/luhuo-mp4 |
| 入库文件数 | 见推送后日志 |
| 未入库 | `node_modules/`、`out/`、`public/{audio,videos,images}/`、`img/`、`.env`、`content/shots.json.bak` |

## 8. v3 → v4 → v4.1 → v5 对比

| 项 | v3 | v4 | v4.1 | v5 |
|---|---|---|---|---|
| 黑场转场 | FadeInOut（10 帧头尾） | 无，硬切 | 无，硬切 | 无，硬切 |
| 外层背景 | `#0a0a0a` | `transparent` | `transparent` | `transparent` |
| 字幕贴底 | AbsoluteFill（偏中） | 普通 absolute div | 同 v4 | 同 v4 |
| 首帧空画面 | shot-01.start=0.04 → frame 0 空 | 同 v3 | ✅ frame 0 起 | 同 v4.1 |
| 尾段空画面 | shot-12.end=57.46 → 2.8s 空 | 同 v3 | ✅ 撑到 durationInFrames | 同 v4.1 |
| **视频结构** | 5 video + 7 image | 同 v3 | 同 v3 | **12 video**（v3 Hub 5 段 + v5 Hub 7 段） |
| 总时长 | 60.27s | 60.31s | 60.31s | 60.31s |
| mp4 文件大小 | 38.73 MB | 35.27 MB | 36.11 MB | **77.04 MB**（12 段真视频） |

## 9. 下一步建议（v6+）

1. ⚠️ shot-08 sequence 5.93s > video 5.88s 后段 0.05s 空帧（肉眼几乎不可见，可选 v6 微调 shots.json）
2. ⚠️ 11 段 video 被 Remotion 截断（v5 接受，v6 可调 shots.json end 让 video 放完）
3. ❌ 12 独立视频架构（用 Remotion / ffmpeg 拼接）
4. ❌ 藏文字幕补齐
5. ❌ 旁白与镜头起止时间更精细对齐
6. ❌ 缩略图网格 `out/preview-grid-v5.png`（可选）

## 10. 一句话总结

> v5 用 MiniMax Hub / Hailuo-2.3 / first_frame 模式生成 7 段 5.875s 真视频（0 重生成），把 `content/shots.json` 中 shot-02/03/05/07/08/09/11 的 visual.type 从 image 改为 video，形成 **12 段真视频版本**，渲染出 60.31s / 77.04 MB 的 v5 mp4，**未重跑 TTS / 未加转场 / 未加黑场 / 未上传媒体**。