# Password Master - 智能密码生成器 🔐

一个现代化、安全的在线密码生成工具，帮助您创建强密码并提供密码安全性检测功能。

## ✨ 特性

### 🔒 核心功能
- **智能密码生成** - 支持自定义长度（4-128位）和字符类型
- **实时强度检测** - 详细的密码安全性分析和改进建议
- **批量生成** - 一次生成多个密码（1-100个）
- **安全优先** - 使用Web Crypto API，本地生成，不存储密码

### 🎨 用户体验
- **响应式设计** - 完美适配桌面端和移动端
- **深色/浅色主题** - 护眼模式切换
- **多语言支持** - 中文/英文界面
- **键盘快捷键** - 提高使用效率

### 🛠️ 高级功能
- **历史记录** - 本地存储生成历史（可导出）
- **字符过滤** - 排除易混淆和有歧义字符
- **一键复制** - 快速复制到剪贴板
- **数据导出** - 支持CSV格式导出

## 🚀 快速开始

### 在线使用
直接访问网站即可使用，无需安装任何软件。

### 本地部署
1. 克隆仓库：
```bash
git clone https://github.com/your-username/password-master.git
cd password-master
```

2. 使用本地服务器运行：
```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx serve .

# 或直接在浏览器中打开 index.html
```

3. 访问 `http://localhost:8000`

## 📖 使用说明

### 基础使用
1. **选择密码长度** - 使用滑块或输入框设置密码长度
2. **选择字符类型** - 勾选需要的字符类型（大写、小写、数字、符号）
3. **点击生成** - 生成安全密码
4. **查看分析** - 查看密码强度和安全建议
5. **复制密码** - 一键复制到剪贴板

### 高级功能
- **批量生成** - 在批量生成区域设置数量，点击"批量生成"
- **历史记录** - 点击历史图标查看之前生成的密码
- **主题切换** - 点击月亮/太阳图标切换主题
- **语言切换** - 点击地球图标切换语言

### 键盘快捷键
- `Ctrl/Cmd + G` - 生成密码
- `Ctrl/Cmd + C` - 复制密码（密码框聚焦时）
- `Ctrl/Cmd + H` - 显示历史记录
- `Escape` - 关闭模态框

## 🔒 安全特性

- **本地生成** - 所有密码在您的浏览器本地生成
- **无数据传输** - 不会向服务器发送任何密码数据
- **加密随机** - 使用Web Crypto API生成加密安全的随机数
- **无存储** - 服务器端不存储任何用户数据
- **开源透明** - 代码完全开源，可审查安全性

## 🛡️ 密码安全建议

1. **长度优先** - 使用至少12位以上的密码
2. **字符多样** - 包含大小写字母、数字和特殊符号
3. **避免规律** - 不使用连续字符或重复模式
4. **定期更换** - 定期更新重要账户密码
5. **唯一性** - 每个账户使用不同的密码
6. **密码管理器** - 使用可信的密码管理器存储密码

## 🎯 技术栈

- **前端** - HTML5, CSS3, JavaScript (ES6+)
- **样式** - CSS Grid, Flexbox, CSS Variables
- **安全** - Web Crypto API
- **存储** - localStorage (仅本地)
- **兼容性** - 现代浏览器 (Chrome, Firefox, Safari, Edge)

## 📱 浏览器支持

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 11+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 这个仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Font Awesome](https://fontawesome.com/) - 图标库
- [Google Fonts](https://fonts.google.com/) - 字体服务
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - 加密功能

## 📞 联系

如果您有任何问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/your-username/password-master/issues)
- 发送邮件到 your-email@example.com

---

**⚠️ 安全提醒**: 请妥善保管您的密码，不要在不安全的环境中生成或使用密码。