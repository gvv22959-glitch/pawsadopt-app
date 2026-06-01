# 🐾 PawsAdopt - 宠物领养应用

一站式宠物领养平台，连接救助站与领养人，让流浪动物找到温暖的家。

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🏠 首页浏览 | 宠物卡片网格、分类筛选、搜索热词推荐 |
| 📤 放养区 | 用户自主发布送养信息，上传照片，标记已领养 |
| 💬 站内消息 | 领养人与发布者实时聊天，支持聊天记录持久化 |
| 🤖 AI 领养顾问 | 基于 Google Gemini，回答领养相关问题 |
| 📋 领养申请 | 在线提交申请，追踪审核进度 |
| 🔐 认证系统 | Supabase Auth 注册/登录，RLS 数据安全 |

## 🛠 技术栈

- **前端**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Motion
- **后端**: Express 4 (Port 4000)
- **数据库**: Supabase (PostgreSQL + Auth + RLS + Storage)
- **AI**: Google Gemini API
- **部署**: Vercel

## 🚀 本地运行

### 环境要求
- Node.js 18+

### 1. 解压后安装依赖
```bash
cd -app-main
npm install
```

### 2. 配置环境变量
项目根目录的 `.env` 文件已包含演示用 Supabase 和 Gemini 密钥，无需额外配置。

### 3. 一键启动（前后端同时运行）
```bash
npm run dev:all
```

- 前端：http://localhost:3000
- 后端：http://localhost:4000

## 📁 项目结构

```
-app-main/
├── src/                    # 前端源码
│   ├── screens/            # 页面组件
│   │   ├── HomeScreen      # 首页
│   │   ├── ListingScreen   # 放养区（核心）
│   │   ├── AuthScreen      # 登录注册
│   │   └── ...
│   ├── api.ts              # API 层
│   ├── App.tsx             # 主入口 & 路由
│   ├── types.ts            # TypeScript 类型
│   └── lib/                # 工具 & Supabase 客户端
├── server/
│   └── index.ts            # Express 后端
├── supabase/
│   └── migrations/         # 数据库迁移脚本
├── .env                    # 环境变量
└── package.json
```

## 🌐 在线演示

https://pawsadopt-app-git-main-gvv22959-glitchs-projects.vercel.app

## 📄 许可

Apache-2.0
