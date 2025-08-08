# 🌐 域名配置指南

## 当前状态
✅ **GitHub Pages 已部署**: https://kangvcar.github.io/ReplyGenius/  
⏳ **自定义域名待配置**: https://replygenius.app

## 配置 replygenius.app 域名

### 步骤1: 购买域名
如果还没有购买 `replygenius.app` 域名，推荐以下注册商：

- **Cloudflare Registrar** - 价格透明，无隐藏费用
- **Namecheap** - 性价比高，易于管理
- **GoDaddy** - 知名度高，功能全面

### 步骤2: 配置 DNS 记录

在域名提供商的 DNS 管理界面添加以下记录：

#### A 记录（根域名）
```
名称/主机: @ (或留空)
类型: A
值: 185.199.108.153

名称/主机: @ (或留空)  
类型: A
值: 185.199.109.153

名称/主机: @ (或留空)
类型: A  
值: 185.199.110.153

名称/主机: @ (或留空)
类型: A
值: 185.199.111.153
```

#### CNAME 记录（www子域名）
```
名称/主机: www
类型: CNAME
值: kangvcar.github.io
```

### 步骤3: 验证配置

配置完成后：

1. **DNS 传播**: 等待 1-48 小时让 DNS 记录全球传播
2. **验证工具**: 使用 [DNS Checker](https://dnschecker.org/) 检查记录是否生效
3. **GitHub Pages**: 在 GitHub 仓库设置中确认自定义域名状态

### 步骤4: 启用 HTTPS

域名生效后：
1. 在 GitHub Pages 设置中勾选 "Enforce HTTPS"
2. GitHub 会自动配置 SSL 证书（通常需要几小时）

## 临时解决方案

在自定义域名配置完成前，您可以：

1. **使用 GitHub Pages URL**: https://kangvcar.github.io/ReplyGenius/
2. **更新 Chrome 应用商店**: 使用当前可用的 URL
3. **社交媒体分享**: 使用 GitHub Pages 链接

## 验证清单

域名配置完成后，请检查：

- [ ] https://replygenius.app 可以访问
- [ ] https://www.replygenius.app 重定向到主域名
- [ ] https://replygenius.app/privacy 隐私政策页面可访问
- [ ] HTTPS 证书正常（绿色锁图标）
- [ ] 移动设备访问正常

## 常见问题

### Q: DNS 记录添加后多久生效？
**A**: 通常 1-4 小时，最多可能需要 48 小时完全传播。

### Q: GitHub Pages 显示 "Domain's DNS record could not be retrieved"
**A**: 等待 DNS 传播完成，或检查 A 记录配置是否正确。

### Q: 网站显示 404 错误
**A**: 确认 CNAME 文件内容正确，且 GitHub Pages 设置为 `/docs` 文件夹。

### Q: HTTPS 证书问题
**A**: GitHub 自动配置需要时间，可能需要等待 24 小时。

## 成本估算

- **域名注册**: $10-15/年 (.app 域名)  
- **GitHub Pages**: 免费
- **SSL 证书**: 免费（GitHub 自动配置）

---

配置完成后，您的网站将在 `https://replygenius.app` 正式上线！