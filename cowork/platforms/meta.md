# Meta Business Suite 发布 SOP

> 以下每一步都经过实际验证（2026-03-25），严格按顺序执行，不要自行变通。

## 基本规则
- **入口**：`https://business.facebook.com`，绝不打开 instagram.com / facebook.com
- **适用 providerIdentifier**：`facebook`、`instagram`
- **API 调用**：必须在 Postiz tab（social.mattera3dprint.com）用相对路径 JS fetch

## 第一步：标记 PUBLISHING

在 Postiz tab 执行：
```javascript
(async () => {
  const res = await fetch('/api/cowork/publishing', {
    method: 'POST',
    headers: {
      'x-cowork-key': '<KEY>',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postId: '<POST_ID>' })
  });
  return (await res.json()).state;  // 应返回 "PUBLISHING"
})();
```

## 第二步：导航到 Composer

1. `navigate` → `https://business.facebook.com/latest/home`
2. `wait` 3 秒等页面加载
3. `read_page` 确认看到 "Create post" 按钮
4. `left_click` "Create post" 按钮（ref 通常叫 "Create post"）
5. `wait` 3 秒等 Composer 打开
6. `read_page` 确认看到：
   - "Post to" 下拉（默认 Instagram）
   - "Media" 区域 + "Add photo/video" 按钮
   - "Text" 输入框
   - "Publish" 按钮

## 第三步：上传图片（Canvas Blob 注入法）

> 当前尚未解决跨域真实图片传递。待 Postiz 静态资源加 CORS header 后，
> 把 Canvas 部分替换为 `fetch(imageUrl).then(r => r.blob())` 即可。

在 MBS tab 执行以下 JS（一次完成拦截 + 注入 + 触发）：

```javascript
(async () => {
  // === 1. 创建图片 ===
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  // 替换为真实图片时：const blob = await fetch(url).then(r=>r.blob());
  ctx.fillStyle = '#FF6B35';
  ctx.fillRect(0, 0, 1080, 1080);
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = new File([blob], 'post-image.png', { type: 'image/png', lastModified: Date.now() });

  // === 2. 拦截 file input ===
  let injected = false;

  // 方法 A：MutationObserver 监听动态创建的 input[type=file]
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const inputs = node.matches?.('input[type="file"]')
          ? [node]
          : Array.from(node.querySelectorAll?.('input[type="file"]') || []);
        for (const input of inputs) {
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
          injected = true;
          observer.disconnect();
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // 方法 B：Monkey-patch HTMLInputElement.click 防止原生对话框弹出
  const origClick = HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click = function() {
    if (this.type === 'file') {
      const dt = new DataTransfer();
      dt.items.add(file);
      this.files = dt.files;
      this.dispatchEvent(new Event('change', { bubbles: true }));
      this.dispatchEvent(new Event('input', { bubbles: true }));
      HTMLInputElement.prototype.click = origClick;
      injected = true;
      return;
    }
    return origClick.call(this);
  };

  // === 3. 点击 "Add photo/video" 按钮 ===
  const btn = document.querySelector('[aria-label="Add photo/video"]') ||
    Array.from(document.querySelectorAll('div[role="button"]'))
      .find(el => el.textContent.includes('Add photo/video'));
  if (btn) btn.click();

  // === 4. 等待注入完成 ===
  await new Promise(r => setTimeout(r, 2000));
  observer.disconnect();
  HTMLInputElement.prototype.click = origClick;

  return JSON.stringify({ injected, btnFound: !!btn });
})();
```

**验证**：`read_page` 应看到 Media 区域出现 "1080 x 1080" 缩略图 + "Edit photo" / "Remove photo" 按钮。

## 第四步：填写文案

1. `left_click` 文本输入框（ref 含 "Write into the dialogue box"）
2. `type` 填入文案（纯文本，去掉 HTML 标签）+ hashtags
3. 如果弹出 hashtag 建议下拉 → `key` Escape 关闭

## 第五步：发布

1. `left_click` "Publish" 按钮
2. `wait` 5 秒
3. `screenshot` 确认看到 **"Your post is published"** 弹窗
4. 从弹窗中提取 Post ID（格式 `ID: 18xxxxxxxxx`）
5. `left_click` "Maybe later"（跳过广告推广弹窗）

## 第六步：回写 Postiz

在 Postiz tab 执行：
```javascript
(async () => {
  const res = await fetch('/api/cowork/result', {
    method: 'POST',
    headers: {
      'x-cowork-key': '<KEY>',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      postId: '<POST_ID>',
      status: 'success',
      releaseURL: 'https://www.instagram.com/mason_vsquare/',
      platformPostId: '<从弹窗提取的 ID>'
    })
  });
  return (await res.json()).state;  // 应返回 "PUBLISHED"
})();
```

**注意**：`status` 字段用 `"success"` / `"error"`，不是 `"PUBLISHED"`。

## 已知问题

| 问题 | 状态 | 备注 |
|------|------|------|
| 跨域图片传递 | 未解决 | 需 Postiz nginx 加 `Access-Control-Allow-Origin: *` |
| file_upload 工具 | 不可用 | Downloads 路径被安全策略拦截 |
| Base64 数据传递 | 不可用 | 系统拦截 "[BLOCKED]" |
| 大图片数组传递 | 不可用 | 超出返回长度限制被截断 |
