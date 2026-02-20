#!/bin/bash

# VantaCore 安装脚本 - 支持 Termux/ARM64/Linux
# 适用于各种设备的通用安装脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测系统架构
detect_arch() {
    ARCH=$(uname -m)
    case $ARCH in
        x86_64|amd64)
            ARCH="x64"
            ;;
        aarch64|arm64)
            ARCH="arm64"
            ;;
        armv7l|armhf)
            ARCH="arm"
            ;;
        *)
            log_error "不支持的架构：$ARCH"
            exit 1
            ;;
    esac
    log_info "检测到架构：$ARCH"
}

# 检测操作系统
detect_os() {
    if [ -f "/data/data/com.termux/files/home/.termux/termux.properties" ] || [ "$TERMUX_VERSION" ] || [ -n "$PREFIX" ]; then
        OS="termux"
        log_info "检测到 Termux 环境"
    elif [ -f "/etc/alpine-release" ]; then
        OS="alpine"
        log_info "检测到 Alpine Linux"
    elif [ -f "/etc/debian_version" ]; then
        OS="debian"
        log_info "检测到 Debian 系系统"
    elif [ -f "/etc/redhat-release" ]; then
        OS="redhat"
        log_info "检测到 RedHat 系系统"
    elif [ -f "/etc/arch-release" ]; then
        OS="arch"
        log_info "检测到 Arch Linux"
    else
        OS="unknown"
        log_warning "无法识别操作系统，尝试使用通用安装方法"
    fi
}

# 检查 Node.js
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_success "Node.js 已安装：$NODE_VERSION"
        
        # 检查版本是否 >= 18
        NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            log_warning "Node.js 版本过低，需要 >= 18.0.0"
            return 1
        fi
        return 0
    else
        log_warning "Node.js 未安装"
        return 1
    fi
}

# 安装 Node.js
install_nodejs() {
    log_info "正在安装 Node.js..."
    
    case $OS in
        termux)
            pkg update -y
            pkg install nodejs -y
            ;;
        alpine)
            apk add nodejs npm
            ;;
        debian|ubuntu)
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
            ;;
        redhat|centos|fedora)
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            yum install -y nodejs
            ;;
        arch)
            pacman -S nodejs npm
            ;;
        *)
            log_error "无法自动安装 Node.js，请手动安装"
            exit 1
            ;;
    esac
    
    log_success "Node.js 安装完成"
}

# 检查 Yarn
check_yarn() {
    if command -v yarn &> /dev/null; then
        YARN_VERSION=$(yarn -v)
        log_success "Yarn 已安装：$YARN_VERSION"
        return 0
    else
        log_warning "Yarn 未安装"
        return 1
    fi
}

# 安装 Yarn
install_yarn() {
    log_info "正在安装 Yarn..."
    
    if command -v npm &> /dev/null; then
        npm install -g yarn
        log_success "Yarn 安装完成"
    else
        log_error "npm 不可用，无法安装 Yarn"
        exit 1
    fi
}

# 安装系统依赖
install_dependencies() {
    log_info "正在安装系统依赖..."
    
    case $OS in
        termux)
            pkg install python make g++ -y
            ;;
        alpine)
            apk add python3 make g++ git
            ;;
        debian|ubuntu)
            apt-get install -y python3 make g++ git build-essential
            ;;
        redhat|centos|fedora)
            yum install -y python3 make gcc-c++ git
            ;;
        arch)
            pacman -S python make gcc git base-devel
            ;;
    esac
    
    log_success "系统依赖安装完成"
}

# 安装 VantaCore
install_vantacore() {
    log_info "正在安装 VantaCore..."
    
    # 安装依赖
    yarn install --frozen-lockfile 2>/dev/null || yarn install
    
    # 构建项目
    log_info "正在构建项目..."
    yarn build
    
    log_success "VantaCore 安装完成"
}

# 创建 systemd 服务文件（如果支持）
create_systemd_service() {
    if [ "$OS" != "termux" ] && [ -d "/etc/systemd/system" ]; then
        log_info "正在创建 systemd 服务..."
        
        cat > /etc/systemd/system/vantacore.service << EOF
[Unit]
Description=VantaCore Server Management Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$(pwd)
ExecStart=$(which node) dist/server/index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF
        
        systemctl daemon-reload
        log_success "systemd 服务创建完成"
        log_info "运行以下命令启用服务:"
        echo "  systemctl enable vantacore"
        echo "  systemctl start vantacore"
    fi
}

# 显示使用说明
show_usage() {
    echo ""
    echo "========================================"
    echo "       VantaCore 安装完成!"
    echo "========================================"
    echo ""
    echo "启动命令:"
    echo "  yarn start              # 生产环境启动"
    echo "  yarn dev                # 开发模式启动"
    echo ""
    echo "默认访问地址:"
    echo "  http://localhost:8080"
    echo ""
    echo "默认登录凭据:"
    echo "  用户名：admin"
    echo "  密码：admin123"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "    VantaCore 服务器管理面板"
    echo "    安装脚本 v1.0.0"
    echo "========================================"
    echo ""
    
    # 检测和准备
    detect_arch
    detect_os
    
    # 安装依赖
    if ! check_nodejs; then
        install_nodejs
    fi
    
    if ! check_yarn; then
        install_yarn
    fi
    
    install_dependencies
    
    # 安装 VantaCore
    install_vantacore
    
    # 创建服务
    create_systemd_service
    
    # 显示使用说明
    show_usage
}

# 运行主函数
main "$@"
