#!/data/data/com.termux/files/usr/bin/bash

# VantaCore Termux 专用安装脚本
# 针对 Termux 环境优化

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

echo ""
echo "========================================"
echo "    VantaCore for Termux"
echo "    安装脚本 v1.0.0"
echo "========================================"
echo ""

# 检查是否在 Termux 中运行
if [ -z "$PREFIX" ]; then
    log_error "此脚本只能在 Termux 环境中运行"
    exit 1
fi

log_info "检测到 Termux 环境"
log_info "架构：$(uname -m)"
log_info "Android API: $(getprop ro.build.version.sdk)"

# 更新包
log_info "更新 Termux 包..."
pkg update -y

# 安装 Node.js
log_info "安装 Node.js..."
pkg install nodejs -y

# 安装构建工具
log_info "安装构建工具..."
pkg install python make clang libcrypt libffi openssl -y

# 安装 Yarn
log_info "安装 Yarn..."
pkg install yarn -y

# 设置 npm 镜像（加速下载）
log_info "配置 npm 镜像..."
npm config set registry https://registry.npmmirror.com

# 克隆项目
log_info "克隆 VantaCore 项目..."
cd ~
git clone https://github.com/Starlight-apk/VantaCore.git
cd VantaCore

# 安装项目依赖
log_info "安装 VantaCore 依赖..."
yarn install

# 构建
log_info "构建 VantaCore..."
yarn build

# 创建启动脚本
log_info "创建启动脚本..."
cat > ~/vantacore-start.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd $HOME/VantaCore
export NODE_ENV=production
export PORT=8080
node dist/server/index.js
EOF

chmod +x ~/vantacore-start.sh

echo ""
echo "========================================"
echo "       安装完成!"
echo "========================================"
echo ""
echo "启动命令:"
echo "  ~/vantacore-start.sh"
echo "  或 cd 到项目目录后运行：yarn start"
echo ""
echo "访问地址：http://localhost:8080"
echo "默认用户名：admin"
echo "默认密码：admin123"
echo ""
echo "========================================"
