# CoWork API 配置

## 连接信息
- **Postiz API**: `https://social.mattera3dprint.com/api`
- **认证 Header**: `x-cowork-key: <COWORK_API_KEY>`

## API 端点

### GET /api/cowork/queue
返回所有 PENDING_PUBLISH 状态的帖子。

响应示例：
```json
[
  {
    "id": "post-uuid",
    "content": "<p>帖子内容（HTML）</p>",
    "image": "[\"https://...\"]",
    "publishDate": "2026-03-24T10:00:00Z",
    "settings": "{\"key\":\"value\"}",
    "integration": {
      "id": "integration-uuid",
      "name": "My Instagram",
      "providerIdentifier": "instagram",
      "picture": "https://...",
      "profile": "username"
    }
  }
]
```

### POST /api/cowork/publishing
标记帖子为 PUBLISHING（CoWork 开始处理，防止重复拉取）。

请求体：
```json
{ "postId": "post-uuid" }
```

### POST /api/cowork/result
回写发布结果。

成功：
```json
{
  "postId": "post-uuid",
  "status": "success",
  "releaseURL": "https://instagram.com/p/xxx",
  "platformPostId": "platform-post-id"
}
```

失败：
```json
{
  "postId": "post-uuid",
  "status": "error",
  "error": "上传图片失败：文件过大"
}
```

## providerIdentifier 映射

| providerIdentifier | 平台 | 操作手册 |
|---|---|---|
| facebook | Facebook Page | platforms/meta.md |
| instagram | Instagram | platforms/meta.md |
| tiktok | TikTok | platforms/tiktok.md |
| xiaohongshu | 小红书 | platforms/xiaohongshu.md |
