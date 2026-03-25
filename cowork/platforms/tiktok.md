# TikTok Business Center 发布 SOP

> 部分步骤已验证（2026-03-25），Publisher 入口确认存在但需要 Business Account 验证。

## 基本规则
- **入口**：`https://business.tiktok.com`，绝不打开 tiktok.com
- **适用 providerIdentifier**：`tiktok`
- **前置条件**：Business Account 必须已通过验证（Verify Business Account）

## 第一步：标记 PUBLISHING

同 Meta SOP，在 Postiz tab 执行 fetch POST `/api/cowork/publishing`。

## 第二步：导航到 Publisher

1. `navigate` → `https://business.tiktok.com/manage/business-suite/content-management?org_id=7605859094808821776`
   - 直接用完整 URL，跳过首页 "Go to Business Center" → 选择账户的步骤
2. `wait` 3 秒
3. `read_page` 确认看到左侧导航 "Posts" 区域
4. 如果当前不在 Publisher 页面 → `left_click` 左侧 "Publisher"
5. 确认页面标题为 **"Post management"** 且已选中正确的 TikTok 账号（"Mattera 3D Print"）

### 如果看到 "Verify your Business Account"
→ 无法继续发布，回写 error 到 Postiz，提示 Mason 手动验证。

## 第三步：上传视频

> ⚠️ 此步骤尚未实际验证，待 Business Account 验证完成后测试。

预期流程：
1. 找到 "Create" 或 "Upload" 按钮
2. 视频上传可能需要 file input 注入（同 Meta 的 Canvas Blob 方法，但传 video/mp4）
3. 等待上传 + 处理完成

## 第四步：填写文案

1. 填写描述（content 纯文本）
2. 添加 hashtags（TikTok hashtag 影响分发，必须加）
3. 隐私设置：默认"所有人"

## 第五步：发布 + 回写

同 Meta SOP，发布后获取 URL，fetch POST `/api/cowork/result`。

## 导航速查

| 页面 | 直达 URL |
|------|----------|
| Business Center 首页 | `https://business.tiktok.com/manage/users/members?org_id=7605859094808821776` |
| Publisher（发帖） | `https://business.tiktok.com/manage/business-suite/content-management?org_id=7605859094808821776` |

## 当前阻塞项

| 问题 | 状态 | 解决方案 |
|------|------|----------|
| Business Account 未验证 | ❌ 阻塞 | Mason 手动在 Publisher 页面点 "Verify now" |
| 视频上传方法 | 未测试 | 待验证后补充 SOP |
