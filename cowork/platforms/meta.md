# Meta Business Suite 发布指南

## 统一入口
**始终通过 Meta Business Suite 操作，不要打开 instagram.com 或 facebook.com**
- URL：`https://business.facebook.com`
- Business Suite 可同时管理 Facebook Page + Instagram，一次创建发到两个平台

## 适用 providerIdentifier
- `facebook` — Facebook Page 帖子
- `instagram` — Instagram 帖子/Reel

## 发帖流程（通用）

### 单平台发布
1. 打开 `https://business.facebook.com`
2. 确认左上角已选中正确的 Page/Account
3. 点击左侧 **"Content"** → **"Create post"**
4. 选择目标平台（Facebook 和/或 Instagram）
5. 粘贴 `content` 文本（去除 HTML 标签，保留纯文本）
6. 如果有 `image`：
   - 图片是 URL → 先下载到本地临时目录，再上传
   - 点击 **"Add photo/video"** → 选择文件上传
   - 多图逐张上传，等每张加载完成
7. 如果 `settings` 中有 hashtags → 追加到文案末尾
8. 点击 **"Publish"**（立即发布）或 **"Schedule"**（排期）
9. 等待发布成功确认
10. 获取帖子 URL 作为 `releaseURL`

### 同时发到 Facebook + Instagram
1. 在 Create post 界面，勾选 **Facebook Page** 和 **Instagram Account**
2. 如果内容需要差异化，点击 **"Customize"** 分别编辑
3. 其余步骤同上

## 图片处理
- 帖子 `image` 字段是 JSON 数组，包含图片 URL
- CoWork 需要：URL → Chrome 下载/或直接用 URL 上传 → Business Suite
- Instagram 不支持纯文字帖，必须有图片或视频

## 限制
- Instagram 图片：最多 10 张轮播
- Instagram Reel：最长 90 秒（feed），15 分钟（上传）
- Instagram 文案：2200 字符
- Instagram Hashtag：最多 30 个
- Facebook 文案：无硬性限制（建议 < 500 字）

## API 调用方式
**不要用 curl 或 WebFetch，用 Chrome JS fetch：**
```javascript
// 在 Chrome 任意页面的 console 里执行
const res = await fetch('https://social.mattera3dprint.com/api/cowork/queue', {
  headers: { 'x-cowork-key': '<从 .env.local 读取>' }
});
const posts = await res.json();
```
