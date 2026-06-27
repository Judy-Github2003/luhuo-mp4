# Shot 时长排查 (v5)

> 生成时间: 2026-06-27T17:18:03.039Z
> 数据源: `content/shots.json` (未修改)
> 脚本: `scripts/probe-shot-durations.mjs`

> **v5 说明**：本表显示的是 v5（12 段真视频版本）状态。所有 shot 已是 `type: video`。
> 11 段 `media_longer_cut` 是 video 比 Sequence 长（被 Remotion 截断，接受）；
> shot-08 `media_shorter_blank` 是 sequence 5.93s > video 5.88s（后段 0.05s 可能空帧，肉眼几乎不可见，接受）；
> shot-06 `aligned` 是 5.88s = 5.88s 完美对齐。

## 1. 时长对比表

| shot | type | sequence start (s) | sequence end (s) | sequence (s) | media (s) | status |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| shot-01 | video | 0.04 | 3.33 | 3.29 | 5.88 | media_longer_cut |
| shot-02 | video | 3.33 | 8.28 | 4.95 | 5.88 | media_longer_cut |
| shot-03 | video | 8.28 | 12.71 | 4.43 | 5.88 | media_longer_cut |
| shot-04 | video | 12.71 | 17.15 | 4.44 | 5.88 | media_longer_cut |
| shot-05 | video | 17.15 | 22.19 | 5.04 | 5.88 | media_longer_cut |
| shot-06 | video | 22.19 | 28.07 | 5.88 | 5.88 | aligned |
| shot-07 | video | 28.07 | 32.88 | 4.81 | 5.88 | media_longer_cut |
| shot-08 | video | 32.88 | 38.81 | 5.93 | 5.88 | media_shorter_blank |
| shot-09 | video | 38.81 | 43.38 | 4.57 | 5.88 | media_longer_cut |
| shot-10 | video | 43.38 | 48.25 | 4.87 | 5.88 | media_longer_cut |
| shot-11 | video | 48.25 | 51.83 | 3.58 | 5.88 | media_longer_cut |
| shot-12 | video | 51.83 | 57.46 | 5.63 | 5.88 | media_longer_cut |

## 2. 状态码说明

- `aligned` — video 时长与 Sequence 时长基本一致 (差 < 0.05s)
- `media_longer_cut` — video 比 Sequence 长, 会被 Remotion 截断
- `media_shorter_blank` — video 比 Sequence 短, 后段可能空帧
- `media_missing` — video 文件不存在
- `image_ok` — image 类, 无时长问题
- `color_block` — 纯色占位, 无素材

## 3. 间隙

未发现 Sequence 之间的间隙。

## 4. 备注

- v4 主目标: 删除 fade 转场 + 字幕真正贴底
- 本脚本是排查工具, 不动 shots.json、不动素材、不动 remotion config
- 后续 v5+ 如果要严格对齐, 可考虑:
  1. 调整 shots.json 的 start/end, 消除间隙
  2. 改成 12 个独立视频, 再用 ffmpeg/Remotion 拼接