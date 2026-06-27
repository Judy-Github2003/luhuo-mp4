# v5 MiniMax Hub 任务书：剩余 7 张静态图升级为视频

> **任务对象**：MiniMax Hub 操作员（你 / Cursor / 任何能登录 Hub 的人）
> **项目路径**：`D:\YouTubeVideo\luhuo-mp4\`
> **当前版本**：v4.1（GitHub commit `c722ac5`）
> **任务目标**：用 MiniMax Hub 图生视频 (first_frame) 模式，把剩余 7 张静态图升级为 7 段横屏视频
> **最终形态**：12 段真视频 + 普通话旁白 + 中文字幕
> **本任务书只覆盖 Hub 操作；本地接管动作（shots.json 改造 + 渲染 + commit）由 ZCode 在 Hub 完成后接手**

---

## 0. 任务边界

### 0.1 Hub 操作员负责（本任务书范围）

- 在 MiniMax Hub 网页端跑 7 段图生视频
- 下载 mp4、**严格按命名**放入 `D:\YouTubeVideo\luhuo-mp4\public\videos\`

### 0.2 不在本任务书范围（ZCode 在 Hub 完成后接手）

- ❌ 改 `content/shots.json`
- ❌ 跑 `verify-assets.mjs` / `probe-shot-durations.mjs` / `build-video.mjs`
- ❌ 重渲染 / 重跑 TTS / 改字幕
- ❌ Git 提交 / push

### 0.3 上一轮历史（Hub 5 段已用过）

v3 阶段已经在 Hub 跑过 5 段（shot-01/04/06/10/12），首帧来自 `img/ChatGPT Image 2026年6月27日 17_09_xx.png`。

**注意**：本次 v5 的 7 段**首帧不是用那 5 张原始图**！本次首帧来自 `public/images/shot-XX.png`（见 §7 关键澄清）。

---

## 1. Hub 入口与基础设置

- **入口 URL**：https://hub.minimaxi.com/
- **登录**：用你已有的 MiniMax Hub 账号
- **路径**：顶部菜单 → `Media` / `视频生成` / `Video Generation`
- **模型**：`Hailuo-2.3`（与 v3 一致，3000 积分账号可用）
- **模式**：`图生视频` → `first_frame`（用上传图作为视频首帧）
- **分辨率**：`1080P`
- **时长**：❗ **不固定**，Hub 出多少就是多少，按实际生成时长落盘（详细策略见 §4）

---

## 2. 通用操作流程（每段通用）

```
1. 打开 Hub 视频生成页
2. 模型选 Hailuo-2.3
3. 模式选 图生视频 / first_frame
4. 上传图片（路径见 §3 每段"首帧路径"）
5. 在 prompt 框粘贴该段的 prompt（§3 每段已写好）
6. 分辨率选 1080P
7. 时长：按 Hub 页面提供的选项选择（不要硬卡 6s）
8. 点"生成"，等 1-3 分钟
9. 下载 mp4
10. 检查下载文件：
   - 文件名随机（如 12345.mp4）→ 重命名为目标 shot-XX.mp4
   - 肉眼快进看一眼：是否有人脸崩坏 / 文字水印 / 主体变形
   - 有问题立刻重新生成（Hub 一般允许 1-2 次免费重试）
11. 放进 D:\YouTubeVideo\luhuo-mp4\public\videos\
12. 重复下一段
```

---

## 3. 7 段视频详细参数

> 每段下面 3 项必须严格匹配：
> - **首帧路径**（upload 用）
> - **prompt**（粘贴到 Hub prompt 框）
> - **目标文件名**（下载后重命名）

### 3.1 shot-02 — 高原草原与山川纹理

**首帧**：

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-02.png
```

**prompt**：

```
请基于上传的高原山谷与草原参考图生成横屏 16:9 图生视频。保持远山、草地、天空和自然光的构图。画面表现炉霍高原的安静质感，山川、草原和岁月留下的纹理。镜头做极慢的向前推进或轻微横向平移，草地和云影有非常轻微的自然变化，整体安静、克制、真实。不要出现任何文字、字幕、logo、水印、藏文、中文，不要突然出现人物，不要大幅变形。
```

**目标文件名**：`shot-02.mp4`
**放入**：`D:\YouTubeVideo\luhuo-mp4\public\videos\shot-02.mp4`

**运动重点**：慢推 / 轻平移 / 云影轻动 / 草地微动

---

### 3.2 shot-03 — 博物馆展厅空间

**首帧**：

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-03.png
```

**prompt**：

```
请基于上传的博物馆展厅参考图生成横屏 16:9 图生视频。保持展柜、暖色展灯、传统服饰或文博陈列的空间关系。画面表现走进博物馆后，炉霍的记忆被一件件保存下来的感觉。镜头沿展柜做非常缓慢的横向移动，玻璃反射和展灯光线有轻微变化，空间安静、庄重、真实。不要出现任何文字、字幕、logo、水印、藏文、中文、展牌文字，不要让展品变形，不要加入游客或复杂人群。
```

**目标文件名**：`shot-03.mp4`
**放入**：`D:\YouTubeVideo\luhuo-mp4\public\videos\shot-03.mp4`

**运动重点**：沿展柜慢横移 / 展灯光线轻变 / 玻璃反射轻变

---

### 3.3 shot-05 — 藏袍衣襟、袖口、布料细节

**首帧**：

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-05.png
```

**prompt**：

```
请基于上传的藏袍衣襟、袖口和布料细节参考图生成横屏 16:9 图生视频。保持厚重衣料、毛边、刺绣、袖口和边饰的细节。画面表现藏袍抵御风雪、回应日常劳作的质感。镜头做非常缓慢的微距推近，布料纹理和边饰在光线下有轻微层次变化，整体真实、细腻、克制。不要出现任何文字、字幕、logo、水印、藏文、中文，不要让服饰变成奇幻盔甲或舞台服装，不要塑料质感。
```

**目标文件名**：`shot-05.mp4`
**放入**：`D:\YouTubeVideo\luhuo-mp4\public\videos\shot-05.mp4`

**运动重点**：微距慢推 / 布料光影轻动 / 细节质感

---

### 3.4 shot-07 — 手整理服饰边纹和针脚（最容易崩的一段）

**首帧**：

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-07.png
```

**prompt**：

```
请基于上传的手工刺绣与纺织细节参考图生成横屏 16:9 图生视频。保持手、针脚、边纹、织物和传统服饰细节。画面表现细密针脚像时间留下的线索。动作要非常克制，只让手指轻轻整理或拂过服饰边纹，织物有轻微自然移动，镜头轻微推近。不要出现任何文字、字幕、logo、水印、藏文、中文。重点保持手部稳定，不要畸形手指，不要多余手指，不要让纹样乱跳。
```

**目标文件名**：`shot-07.mp4`
**放入**：`D:\YouTubeVideo\luhuo-mp4\public\videos\shot-07.mp4`

**运动重点**：手指轻拂 / 轻整理边纹 / 微距慢推 / 手部稳定

⚠️ **重要警告**：这是 7 段里**最容易崩**的一段。手指畸形明显时（多指、少指、手指变形、纹样乱跳），**必须重生成**，不能凑合。

---

### 3.5 shot-08 — 传统生活器物

**首帧**：

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-08.png
```

**prompt**：

```
请基于上传的传统生活器物参考图生成横屏 16:9 图生视频。保持木碗、布包、织物、旧物件或展柜陈列的构图。画面表现传统不是遥远的陈列，而是曾经真实的生活。镜头缓慢扫过器物表面，暖色展灯轻微变化，材质有真实的木质、布料和旧物肌理。不要出现任何文字、字幕、logo、水印、藏文、中文、展牌文字，不要加入现代塑料物品，不要让器物变形。
```

**目标文件名**：`shot-08.mp4`
**放入**：`D:\YouTubeVideo\luhuo-mp4\public\videos\shot-08.mp4`

**运动重点**：慢扫 / 暖光轻变 / 器物材质真实

---

### 3.6 shot-09 — 暖色展灯下的旧物

**首帧**：

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-09.png
```

**prompt**：

```
请基于上传的展柜旧物和金属器物参考图生成横屏 16:9 图生视频。保持旧物、金属器皿、玻璃展柜和暖色展灯。画面表现旧物在暖色展灯下重新拥有被观看的光。镜头非常缓慢地向前推进，金属表面反光轻微变化，玻璃反射轻微移动，整体安静、庄重、有时间感。不要出现任何文字、字幕、logo、水印、藏文、中文、展牌文字，不要让金属器物变成现代商品，不要闪烁过强。
```

**目标文件名**：`shot-09.mp4`
**放入**：`D:\YouTubeVideo\luhuo-mp4\public\videos\shot-09.mp4`

**运动重点**：慢推 / 金属反光轻变 / 玻璃反射轻动

---

### 3.7 shot-11 — 草原风与延续的记忆（人脸敏感段）

**首帧**：

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-11.png
```

**prompt**：

```
请基于上传的高原风景、经幡或人物氛围参考图生成横屏 16:9 图生视频。保持高原草原、远山、风感、经幡或传统服饰氛围。画面表现风吹过草原，也吹动仍在延续的记忆。镜头从侧后方或远处非常缓慢地靠近，风轻轻吹动经幡、衣摆或草地，人物如果存在应保持端庄稳定。不要出现任何文字、字幕、logo、水印、藏文、中文，不要夸张动作，不要跳舞，不要让人物面部或手部崩坏。
```

**目标文件名**：`shot-11.mp4`
**放入**：`D:\YouTubeVideo\luhuo-mp4\public\videos\shot-11.mp4`

**运动重点**：风感 / 经幡轻动 / 衣摆轻动 / 草地轻动 / 稳定人物

⚠️ **重要警告**：如果首帧含人物且 Hub 生成的视频**人脸崩坏 / 手部崩坏**（五官错位、多手指、脸变形），**必须重生成**。

---

## 4. 不固定时长策略

### 4.1 用户最新决定

> "不要固定时长，能生成出多少是多少，我们主动去适配生成视频。"

### 4.2 含义

- Hub 页面允许的时长选项（如 5s / 6s / 10s），按 Hub 当前可用选项选
- 不强行卡 6s（v3 时是 6s，本轮不强求）
- 下载下来的 mp4 实际时长是多少就用多少

### 4.3 本地如何适配（ZCode 接管时处理）

- 视频比 Sequence 长：✅ 接受，会被 Remotion 在 Sequence 边界截断
- 视频比 Sequence 短：⚠️ ZCode 会跑 `probe-shot-durations.mjs` 排查，必要时调 `shots.json` 的 `start` / `end`
- 视频与 Sequence 几乎一致：✅ 最佳

**你不需要做任何时长对齐动作**，按 Hub 实际给就行。

---

## 5. 不要覆盖以下 5 段视频

这 5 段是 v4.1 已经在用的真视频（之前从 Hub 生成过），**绝对不要动它们**：

```
D:\YouTubeVideo\luhuo-mp4\public\videos\shot-01.mp4   ← 不要覆盖
D:\YouTubeVideo\luhuo-mp4\public\videos\shot-04.mp4   ← 不要覆盖
D:\YouTubeVideo\luhuo-mp4\public\videos\shot-06.mp4   ← 不要覆盖
D:\YouTubeVideo\luhuo-mp4\public\videos\shot-10.mp4   ← 不要覆盖
D:\YouTubeVideo\luhuo-mp4\public\videos\shot-12.mp4   ← 不要覆盖
```

落盘前请先确认目标目录已有文件大小：

```
public/videos/shot-01.mp4   ~3.5 MB
public/videos/shot-04.mp4   ~3.0 MB
public/videos/shot-06.mp4   ~3.9 MB
public/videos/shot-10.mp4   ~1.1 MB
public/videos/shot-12.mp4   ~2.0 MB
```

如果发现上面 5 个文件大小与列表不符，说明你可能搞错了，请停下来确认。

---

## 6. 落盘后接管清单

7 段都齐了之后，**通知 ZCode（我）**，我会按以下顺序接管：

```
1. 跑 node scripts/verify-assets.mjs  → 确认 12 段全部 OK
2. 跑 node scripts/probe-shot-durations.mjs → 排查每个视频 vs Sequence 时长
3. 根据 probe 结果，决定是否需要调 content/shots.json 的 start/end（只调需要调的）
4. 修改 content/shots.json：把 shot-02/03/05/07/08/09/11 的 visual 从 image 改为 video
5. 跑 node scripts/build-video.mjs --skip-audio → 渲染 v5 成片
6. 复制 out/luhuo-main.mp4 → out/luhuo-main-v5-12video.mp4
7. 同步更新 README.md / docs/AGENT_CONTEXT.md / docs/shot-durations.md
8. git add + commit + push
9. 返回 v5 工作报告
```

**通知我时请告诉我**：

- 7 段是否全部生成成功
- 哪几段重生成过（手脸崩了重生成的）
- 落盘后文件大小（Hub 出片差异大，方便我判断）
- 是否遇到 Hub 异常（积分不足 / 模型报错 / 下载失败等）

---

## 7. 关键澄清：首帧路径

### 7.1 本次 v5 的 7 段首帧来自

```
D:\YouTubeVideo\luhuo-mp4\public\images\shot-XX.png
```

具体是：

```
public/images/shot-02.png   ← shot-02 用这个
public/images/shot-03.png   ← shot-03 用这个
public/images/shot-05.png   ← shot-05 用这个
public/images/shot-07.png   ← shot-07 用这个
public/images/shot-08.png   ← shot-08 用这个
public/images/shot-09.png   ← shot-09 用这个
public/images/shot-11.png   ← shot-11 用这个
```

### 7.2 不是 v3 那 5 张原始图

v3 Hub 历史用的 5 张首帧是 `img/ChatGPT Image 2026年6月27日 17_09_xx.png`，那是给 **shot-01/04/06/10/12** 用的。**本次 v5 不要用那 5 张原始图做首帧**。

如果你不小心用了 `img/ChatGPT Image...png` 作为本次首帧，会导致 Hub 重新生成跟 v3 一样的视频，浪费积分。

### 7.3 简单自检

打开 `D:\YouTubeVideo\luhuo-mp4\public\images\` 目录，确认你能看到这 7 个文件：

```
shot-02.png
shot-03.png
shot-05.png
shot-07.png
shot-08.png
shot-09.png
shot-11.png
```

每个文件应该 1.6 - 2.4 MB 大小（ChatGPT 生成的图片，PNG 格式）。

---

## 8. 异常处理

### 8.1 Hub 失败 / 积分不足

- Hub 单次失败：直接重试 1-2 次
- 积分不足：暂停，通知用户充会员或购买积分
- 模型报错：换 `Seedance 2.0 Mini`（35 折，独立 quota）作为备选

### 8.2 视频带水印 / 文字 / 字幕

- **绝对不要**接受，**重新生成**
- 7 段里任何一段有明显文字 / 水印 / 伪藏文 / 伪中文 / 展牌文字，**重跑该段**

### 8.3 视频文件损坏 / 无法播放

- 重新生成
- 若 Hub 持续给出损坏文件，告知 ZCode，可能需要换模型

### 8.4 手指 / 人脸崩坏（shot-07 / shot-11）

- 这是 Hub 已知的薄弱环节
- **重新生成**，Hub 一般会给出不同的结果
- 多次仍崩坏：可考虑换 prompt（删掉"手指 / 人物"相关描述，让画面变成纯器物 / 风景），但要通知 ZCode 调整

### 8.5 文件名下载下来是数字

- Hub 下载的文件名一般是数字（`abc123.mp4`），需要手动重命名为目标 `shot-XX.mp4`
- 大小写不敏感，但建议用全小写匹配任务书

---

## 9. 积分预算

按 v3 历史数据：

- 1080P 图生视频 ≈ 30-50 积分 / 段
- 7 段 × 30-50 ≈ **210-350 积分**
- 3000 积分账号足够（v3 已用过 5 段约 150-250 积分）
- 本次不需要额外充值

如果重生成 / 换模型，总积分消耗会更高，但 3000 积分上限应该够。

---

## 10. 关键检查清单（落盘前自检）

### 10.1 文件名检查

落盘后这 12 个文件都应该存在于 `D:\YouTubeVideo\luhuo-mp4\public\videos\`：

```
shot-01.mp4   (v3 已存在, 不要动)
shot-02.mp4   ← v5 新增
shot-03.mp4   ← v5 新增
shot-04.mp4   (v3 已存在, 不要动)
shot-05.mp4   ← v5 新增
shot-06.mp4   (v3 已存在, 不要动)
shot-07.mp4   ← v5 新增
shot-08.mp4   ← v5 新增
shot-09.mp4   ← v5 新增
shot-10.mp4   (v3 已存在, 不要动)
shot-11.mp4   ← v5 新增
shot-12.mp4   (v3 已存在, 不要动)
```

### 10.2 时长检查（粗略）

每段 mp4 大小约 1-4 MB，时长 4-6s 不等。如果某段文件 < 500 KB，可能是空视频或纯色块，**重生成**。

### 10.3 格式检查

- 必须是 `mp4` 格式（Hub 下载默认就是 mp4）
- 如果下载到其他格式（如 webm），通知 ZCode 处理
- 用 ffprobe 查时长（在 cmd 里跑 `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 path`）

---

## 11. 完成通知格式

7 段都齐了之后，请按下面格式告诉 ZCode：

```text
✅ v5 Hub 7 段图生视频已完成落盘

| shot | 落盘状态 | 文件大小 | 重生成次数 | 备注 |
| --- | --- | --- | --- | --- |
| shot-02 | ✅ | X.XX MB | 0/1 | 正常 |
| shot-03 | ✅ | X.XX MB | 0/1 | 正常 |
| shot-05 | ✅ | X.XX MB | 0/1 | 正常 |
| shot-07 | ✅ | X.XX MB | 2 | 手指崩了重生成 2 次 |
| shot-08 | ✅ | X.XX MB | 0 | 正常 |
| shot-09 | ✅ | X.XX MB | 0 | 正常 |
| shot-11 | ✅ | X.XX MB | 1 | 脸崩了重生成 1 次 |

5 段原视频 (shot-01/04/06/10/12) 未动。
```

如果有任何段失败 / 跳过 / 还在生成中，也请明确说明。

---

## 12. 一句话总览

> 用 Hub 网页端 (Hailuo-2.3 + 图生视频 first_frame + 1080P)，把 7 张 `public/images/shot-XX.png` 生成 7 段 mp4，按命名严格放进 `public\videos\`，不覆盖 v3 已有的 5 段，全部完成后通知 ZCode 接管后续（shots.json + build + commit）。