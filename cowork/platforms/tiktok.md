# TikTok 发布指南

## 适用 providerIdentifier
- `tiktok`

## 发布流程

### 视频帖子（主要）
1. 打开 `https://www.tiktok.com/creator#/upload`
2. 点击"选择视频"上传视频文件
3. 等待上传完成（进度条）
4. 填写标题/描述（`content`，纯文本）
5. 如果 `settings` 中有 hashtags → 输入 # 触发标签选择
6. 设置封面（如果 `settings` 中指定）
7. 隐私设置：默认"所有人"
8. 点击"发布"
9. 等待发布成功
10. 复制视频 URL 作为 `releaseURL`

### 图文帖子
1. 打开 `https://www.tiktok.com/creator#/upload`
2. 切换到"照片模式"（如可用）
3. 上传图片
4. 填写描述
5. 发布

## 注意事项
- 视频限制：最长 10 分钟
- 描述限制：2200 字符
- TikTok Creator Center 界面可能有版本差异，以实际页面为准
- 上传大视频时需要等待较长时间，确认进度条 100% 后再操作
- 如遇到"处理中"提示，等待处理完成再发布
