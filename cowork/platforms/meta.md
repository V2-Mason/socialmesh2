# Meta (Facebook / Instagram) 发布指南

## 适用 providerIdentifier
- `facebook` — Facebook Page 帖子
- `instagram` — Instagram 帖子/Reel

## Facebook Page 发布

### 发帖流程
1. 打开 `https://www.facebook.com/<page-name>`
2. 点击"创建帖子"区域
3. 粘贴 `content` 文本（需去除 HTML 标签，保留纯文本）
4. 如果有 `image`：点击"照片/视频" → 上传图片/视频
5. 如果 `settings` 中有 link：粘贴链接等待预览加载
6. 点击"发布"
7. 等待发布成功确认
8. 复制帖子 URL 作为 `releaseURL`

### 注意事项
- 多图帖子：逐张上传，等每张加载完成
- 视频帖子：等上传进度条完成后再发布
- 链接预览：粘贴链接后等 2-3 秒让预览加载

## Instagram 发布

### 图片/轮播帖子
1. 打开 `https://www.instagram.com/`
2. 点击左侧"+"（创建）按钮
3. 选择"帖子"
4. 上传图片（多图则逐张添加）
5. 裁剪/滤镜页面 → 下一步
6. 填写 `content` 作为文案
7. 如果 `settings` 中有 hashtags → 追加到文案末尾
8. 点击"分享"
9. 复制帖子 URL 作为 `releaseURL`

### Reel
1. 点击"+"→ 选择"Reel"
2. 上传视频文件
3. 编辑封面（如有）
4. 填写文案 + hashtags
5. 点击"分享"

### 注意事项
- Instagram 图片限制：最多 10 张轮播
- Reel 视频限制：最长 90 秒（feed），15 分钟（上传）
- 文案限制：2200 字符
- Hashtag 限制：最多 30 个
