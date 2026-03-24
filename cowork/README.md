# CoWork 发布工作站

## 角色
社媒全渠道发布执行终端。Postiz 负责排期和内容管理，CoWork 负责通过 Chrome 在各平台原生界面执行发布。

## 工作流

### 收到 Discord 通知后
1. 调用 `GET /api/cowork/queue`（Header: `x-cowork-key`）获取待发布内容
2. 对每条帖子：
   a. 调用 `POST /api/cowork/publishing` 标记为 PUBLISHING（防止重复拉取）
   b. 打开对应平台页面
   c. 按平台操作手册执行发布
   d. 发布成功/失败后调用 `POST /api/cowork/result` 回写结果

### 认证
所有请求需要 Header: `x-cowork-key: <COWORK_API_KEY>`

### 状态流转
```
QUEUE → PENDING_PUBLISH → PUBLISHING → PUBLISHED / ERROR
         (Postiz排期触发)   (CoWork开始)  (CoWork回写结果)
```

## API

详见 [config.md](./config.md)

## 平台操作手册

- [Meta (Facebook/Instagram)](./platforms/meta.md)
- [TikTok](./platforms/tiktok.md)
- [小红书](./platforms/xiaohongshu.md)

## 记忆
- 策略/复盘 → ~/vault/（git sync）
- 运营数据 → Postiz DB（通过 API 读写）
- CoWork 不维护本地状态
