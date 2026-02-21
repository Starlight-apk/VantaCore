# VantaCore

<div align="center">

![VantaCore Logo](public/favicon.svg)

## VantaCore - 现代服务器管理面板

**轻量 · 强大 · 通用**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20ARM64%20%7C%20Termux-orange.svg)]()

</div>

---

## ✨ 特性

- 🎨 **拟态设计** - 精美的 Neumorphism UI 设计，流畅的动画效果
- 📱 **全平台支持** - 支持 Linux、ARM64、Termux 等各种环境
- 🚀 **轻量高效** - 无需 Docker 即可运行，资源占用极低
- 📦 **应用商店** - 一键部署常用应用（Nginx、MySQL、Redis 等）
- 🐳 **Docker 管理** - 可选的 Docker 容器管理功能
- 📊 **实时监控** - CPU、内存、磁盘、网络实时监测
- 📁 **文件管理** - 强大的在线文件管理器
- 💻 **Web 终端** - 浏览器中直接执行命令
- 🔐 **安全可靠** - JWT 认证，密码加密存储

---

## 🖼️ 界面预览

### 系统概览
实时监控服务器各项指标，可视化图表展示

### 应用商店
一键部署 20+ 种常用应用

### 文件管理
直观的文件浏览和管理功能

### Docker 管理
完整的容器生命周期管理

---

## 🚀 快速开始

### 系统要求

- Node.js >= 18.0.0
- Yarn >= 1.22.0（推荐使用项目指定的版本）
- Linux / macOS / Windows (WSL)
- 支持 ARM64、x64 架构
- Termux (Android)

### 一键安装

#### Linux / ARM64

```bash
curl -fsSL https://raw.githubusercontent.com/Starlight-apk/VantaCore/main/scripts/install-linux.sh | bash
```

#### Termux

```bash
curl -fsSL https://raw.githubusercontent.com/Starlight-apk/VantaCore/main/scripts/install-termux.sh | bash
```

### 手动安装

```bash
# 克隆项目
git clone https://github.com/Starlight-apk/VantaCore.git
cd VantaCore

# 启用 Corepack（自动使用正确的 Yarn 版本）
corepack enable

# 安装依赖
yarn install

# 构建
yarn build

# 启动
yarn start
```

### 开发模式

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

### 注意事项

> **Termux 用户**：项目已配置为使用 Yarn 1.x 版本，确保全局 Yarn 版本 >= 1.22.0。
> 如果遇到版本问题，请运行：
> ```bash
> corepack enable
> corepack prepare yarn@1.22.22 --activate
> ```

---

## 📋 默认配置

| 配置项 | 默认值 |
|--------|--------|
| 端口 | 8080 |
| 用户名 | admin |
| 密码 | admin123 |
| 主题 | 深色 |
| 语言 | 简体中文 |

**访问地址**: http://localhost:8080

---

## 🛠️ 技术栈

### 后端
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: LowDB (JSON)
- **WebSocket**: Socket.IO
- **Docker**: Dockerode

### 前端
- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: React Query
- **Routing**: React Router v7

---

## 📁 项目结构

```
VantaCore/
├── src/
│   ├── client/              # 前端代码
│   │   ├── components/      # React 组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── stores/          # 状态管理
│   │   ├── styles/          # 样式文件
│   │   └── utils/           # 工具函数
│   ├── server/              # 后端代码
│   │   ├── api/             # API 接口
│   │   ├── routes/          # 路由定义
│   │   ├── services/        # 业务服务
│   │   ├── middleware/      # 中间件
│   │   └── db/              # 数据库
│   └── shared/              # 共享代码
├── public/                  # 静态资源
├── scripts/                 # 安装脚本
├── data/                    # 数据目录
├── dist/                    # 构建输出
└── package.json
```

---

## 🔌 API 接口

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户

### 系统
- `GET /api/system/info` - 系统信息
- `GET /api/system/metrics` - 实时指标
- `GET /api/system/processes` - 进程列表
- `GET /api/system/services` - 服务列表

### 应用商店
- `GET /api/appstore/list` - 应用列表
- `GET /api/appstore/installed` - 已安装应用
- `POST /api/appstore/install` - 安装应用
- `POST /api/appstore/uninstall/:id` - 卸载应用

### Docker (可选)
- `GET /api/docker/info` - Docker 信息
- `GET /api/docker/containers` - 容器列表
- `POST /api/docker/containers` - 创建容器
- `POST /api/docker/containers/:id/start` - 启动容器
- `POST /api/docker/containers/:id/stop` - 停止容器

### 文件
- `GET /api/files/list` - 文件列表
- `GET /api/files/read` - 读取文件
- `POST /api/files/write` - 写入文件
- `DELETE /api/files/delete` - 删除文件

---

## ⚙️ 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | 8080 |
| `NODE_ENV` | 运行环境 | development |
| `JWT_SECRET` | JWT 密钥 | (自动生成) |
| `DOCKER_ENABLED` | 启用 Docker | false |
| `FILE_BASE_DIR` | 文件管理根目录 | / |

---

## 🔒 安全建议

1. **修改默认密码** - 首次登录后立即修改
2. **设置 JWT 密钥** - 生产环境使用强随机密钥
3. **启用 HTTPS** - 使用反向代理配置 SSL
4. **限制访问 IP** - 配置防火墙规则
5. **定期更新** - 保持最新版本

---

## 📱 支持的平台

| 平台 | 架构 | 状态 |
|------|------|------|
| Linux x64 | x86_64 | ✅ 完全支持 |
| Linux ARM64 | aarch64 | ✅ 完全支持 |
| Linux ARM | armv7l | ✅ 完全支持 |
| Termux | ARM/ARM64 | ✅ 完全支持 |
| macOS | x64/ARM | ✅ 完全支持 |
| Windows WSL | x64/ARM | ✅ 完全支持 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢以下开源项目：

- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)
- [Socket.IO](https://socket.io/)

---

## 📞 联系方式

- 官网：https://vantacore.dev
- 文档：https://docs.vantacore.dev
- 邮箱：support@vantacore.dev

---

<div align="center">

**VantaCore** - 让服务器管理更简单

Made with ❤️ by VantaCore Team

</div>
