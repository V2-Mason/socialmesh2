# TikTok Business Center 发布指南

## 统一入口
**通过 TikTok Business Center 操作，不要打开 tiktok.com**
- URL：`https://business.tiktok.com`

## 适用 providerIdentifier
- `tiktok`

## 发布流程

### 视频帖子（主要）
1. 打开 `https://business.tiktok.com`
2. 确认已选中正确的 Business Account
3. 进入 **"Content"** → **"Create"**
4. 上传视频文件
5. 等待上传完成（进度条 100%）
6. 填写标题/描述（`content`，纯文本）
7. 如果 `settings` 中有 hashtags → 输入 # 触发标签选择
8. 设置封面（如有指定）
9. 隐私设置：默认"所有人"
10. 点击"发布"
11. 等待发布成功
12. 获取视频 URL 作为 `releaseURL`

### 图文帖子
1. 同上入口，切换到"照片模式"（如可用）
2. 上传图片 → 填写描述 → 发布

## 图片/视频处理
- 帖子 `image` 字段包含媒体 URL
- CoWork 需要下载到本地或直接用 URL 上传

## 限制
- 视频：最长 10 分钟
- 描述：2200 字符
- 上传大视频需等待处理完成再发布

## API 调用方式
**用 Chrome JS fetch，不要用 curl：**
```javascript
const res = await fetch('https://social.mattera3dprint.com/api/cowork/queue', {
  headers: { 'x-cowork-key': '<从 .env.local 读取>' }
});
const posts = await res.json();
```
