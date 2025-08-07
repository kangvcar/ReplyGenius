# ReplyGenius - Twitter AI Assistant Chrome Extension

🤖 **天才级回复，零努力** - Your Personal Reply Genius

ReplyGenius是一个强大的Chrome浏览器扩展，为Twitter用户提供AI驱动的智能回复生成功能。通过与Twitter界面的无缝集成，帮助用户快速生成高质量、符合上下文的推文回复，让每一条回复都充满智慧与个性。

## ✨ 核心特性

### 🎨 现代化配置界面
- **shadcn/ui设计风格**：清洁、现代的用户界面
- **欢迎引导页面**：友好的首次使用体验
- **实时配置测试**：一键验证API连接状态
- **智能配置管理**：自动保存和同步设置

### 🤖 智能AI集成
- **多模型支持**：GPT-3.5/4、Claude-3等主流模型
- **自定义模型**：支持用户输入任意兼容模型
- **OpenAI兼容API**：支持各种第三方API服务
- **连接状态监控**：实时显示API连接状态

### 🐦 Twitter深度集成
- **一键智能回复**：在每条推文下方添加🤖按钮
- **原生UI风格**：完美融入Twitter界面设计
- **主题自适应**：支持Twitter的所有主题模式
- **动效反馈**：优雅的加载动画和进度指示

### 🧠 天才级回复生成
- **212种人性化短语**：丰富的表达方式库
- **情境智能匹配**：根据推文内容选择合适表达
- **8种回复风格**：从幽默到专业，满足不同场景
- **多语言支持**：7种语言的本地化回复
- **字数智能控制**：2-35字精准控制，符合Twitter习惯

### 🎯 用户体验优化
- **自动发布功能**：一键完成从生成到发布
- **手动审核模式**：关闭自动发布，仅填入内容
- **圆形进度动画**：视觉反馈更直观
- **实时状态提示**：详细的操作状态通知

## 🚀 快速开始

### 安装步骤

1. **下载扩展**
   ```bash
   git clone https://github.com/yourusername/ReplyGenius.git
   cd ReplyGenius
   ```

2. **Chrome安装**
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择ReplyGenius文件夹

3. **首次配置**
   - 点击浏览器工具栏中的🤖图标
   - 按照欢迎页面指引完成配置
   - 测试API连接确保正常工作

### 配置指南

#### AI服务配置
```
Base URL: https://api.openai.com/v1  (或其他兼容服务)
API Key: sk-your-api-key-here
AI模型: 选择或自定义模型名称
```

#### 回复偏好设置
- **回复风格**：选择符合你个性的默认风格
- **语言设置**：设置回复使用的语言
- **自动发布**：开启后一键完成回复，关闭后仅填入内容
- **自定义风格**：创建专属的个性化回复风格

## 🎭 回复风格详解

| 风格 | 特点 | 适用场景 |
|-----|------|----------|
| 😄 **幽默风格** | 轻松有趣，用幽默化解严肃话题 | 日常互动、轻松话题 |
| ✨ **正面积极** | 传递正能量，鼓励和支持他人 | 励志内容、需要支持的场合 |
| 🎯 **专业严肃** | 理性客观，专业的分析观点 | 商务讨论、专业话题 |
| 🤗 **友好亲切** | 温暖友好，像朋友间的对话 | 社交互动、温馨话题 |
| ❓ **提问互动** | 通过提问促进讨论和思考 | 需要互动、引发讨论 |
| 👍 **赞同支持** | 表达认同，给予鼓励 | 表示赞同、支持观点 |
| 🔍 **理性分析** | 深入分析，逻辑思考 | 复杂问题、需要分析 |
| ⚡ **简洁直接** | 直击要害，言简意赅 | 需要快速回应、明确表态 |

## 🌍 多语言支持

- 🇨🇳 中文简体
- 🇹🇼 中文繁体  
- 🇺🇸 English
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇪🇸 Español
- 🇫🇷 Français

## 🛠️ 技术架构

```
ReplyGenius/
├── manifest.json          # Chrome Extension配置
├── popup.html             # 配置面板界面
├── popup.js               # 配置逻辑和交互
├── popup.css              # shadcn/ui样式
├── content.js             # Twitter页面集成
├── background.js          # 后台服务Worker
├── test-animation.html    # 动画效果预览
├── icons/                 # 扩展图标资源
└── CLAUDE.md              # 项目需求文档
```

### 核心技术栈
- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (无框架依赖)
- **shadcn/ui设计系统**
- **Draft.js兼容** (Twitter编辑器)
- **OpenAI兼容API**

## 🎯 使用方法

1. **访问Twitter/X** - 打开 twitter.com 或 x.com
2. **找到🤖按钮** - 在任意推文下方操作区域
3. **点击生成回复** - AI自动分析推文内容
4. **查看动画效果** - 圆形进度条显示生成进度
5. **自动发布/手动审核** - 根据设置自动发布或填入内容

### 操作示例
```
推文: "今天加班到很晚，好累啊😴"
ReplyGenius回复: "辛苦啦，注意身体，早点休息哦💪"
```

## 📊 功能亮点

### 🚀 性能优化
- **智能缓存**：减少重复API调用
- **异步处理**：不阻塞页面操作
- **内存管理**：自动清理资源
- **错误恢复**：智能重试机制

### 🔒 隐私安全
- **本地存储**：API密钥仅存储在本地
- **加密传输**：所有API请求使用HTTPS
- **零数据收集**：不收集任何用户数据
- **权限最小化**：仅申请必要权限

### 🎨 用户体验
- **响应式设计**：适配各种屏幕尺寸
- **无缝集成**：完美融入Twitter界面
- **实时反馈**：详细的状态提示
- **优雅降级**：网络异常时的友好提示

## 🔧 高级配置

### 自定义风格创建
```javascript
// 示例：创建"技术极客"风格
{
  name: "技术极客",
  description: "用技术视角分析问题，偶尔使用技术术语，理性客观",
  personality: "技术导向的分析师",
  requirements: [
    "从技术角度分析问题",
    "适当使用技术术语",
    "保持理性和客观性"
  ]
}
```

### API服务配置
```json
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-your-key-here",
  "model": "gpt-4",
  "maxTokens": 280,
  "temperature": 0.8
}
```

## 🚨 注意事项

### ⚠️ 使用须知
1. **API费用**：使用第三方AI服务可能产生费用
2. **频率限制**：遵守API服务商的调用限制
3. **内容审核**：AI生成内容仅供参考，请审核后发布
4. **账号安全**：合理使用，避免被Twitter限制

### 🛡️ 隐私保护
- **数据处理**：所有数据本地处理，不上传服务器
- **API调用**：仅发送推文文本用于生成回复
- **权限控制**：仅在Twitter页面激活
- **信息安全**：API密钥加密存储

## 📈 更新日志

### v1.0.0 (Latest)
- ✅ 首次正式发布
- ✅ 完整Twitter集成功能
- ✅ 8种智能回复风格
- ✅ 212种人性化短语库
- ✅ 圆形进度动画效果
- ✅ 自动/手动发布选择
- ✅ 多语言本地化支持
- ✅ shadcn/ui现代化界面
- ✅ 自定义模型支持

### 🔮 即将推出
- 🔄 回复历史记录
- 📊 使用统计分析
- 🎨 更多个性化选项
- 🌐 更多语言支持
- ⚡ 性能优化升级

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献
1. **Fork 项目**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 贡献方式
- 🐛 **Bug报告**：发现问题请提交Issue
- 💡 **功能建议**：有好想法请分享
- 📝 **文档改进**：帮助完善文档
- 🔧 **代码贡献**：提交代码改进
- 🌍 **翻译工作**：帮助添加更多语言

## 📄 开源许可

本项目采用 **MIT License** 开源许可证。

```
Copyright (c) 2024 ReplyGenius

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

### 技术支持
- **shadcn/ui** - 现代化UI设计系统
- **Chrome Extension APIs** - 浏览器扩展能力
- **OpenAI API** - 强大的AI能力支持

### 社区贡献
- 感谢所有测试用户的宝贵反馈
- 感谢开源社区的技术支持
- 感谢设计社区的灵感启发

## 📞 联系我们

- **GitHub Issues**: [提交问题](https://github.com/yourusername/ReplyGenius/issues)
- **项目主页**: [ReplyGenius](https://github.com/yourusername/ReplyGenius)
- **技术交流**: 欢迎在Issues中讨论技术问题

---

### 🌟 如果这个项目对你有帮助，请给我们一个Star! ⭐

**让Twitter互动更智能，让每条回复都充满智慧** ✨

---

*Built with ❤️ by ReplyGenius Team*