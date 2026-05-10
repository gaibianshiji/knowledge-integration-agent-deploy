# 学科知识整合智能体

AI全栈极速黑客松参赛作品 - 用AI帮教师把7本教材变成不到30%的精华版本

## 功能特性

- **多格式教材加载**：支持PDF、Markdown、TXT格式，自动解析章节结构
- **知识图谱构建**：使用LLM提取知识点和关系，D3.js力导向图可视化
- **跨教材整合**：语义对齐 + LLM双重验证，自动去重提纯，压缩至30%
- **RAG精准问答**：基于FAISS向量检索，每个回答都附带原文来源引用
- **多轮对话**：支持教师通过对话调整整合方案

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | FastAPI (Python) |
| 前端 | React + D3.js |
| LLM | DeepSeek API |
| Embedding | BGE-small-zh |
| 向量库 | FAISS |
| 文件解析 | PyMuPDF |
| 部署 | Cloudflare Pages + Railway |

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- DeepSeek API Key

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/knowledge-integration-agent.git
cd knowledge-integration-agent
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 DeepSeek API Key
```

### 3. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 4. 安装前端依赖

```bash
cd frontend
npm install
```

### 5. 启动后端服务

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 6. 启动前端服务

```bash
cd frontend
npm run dev
```

### 7. 访问应用

打开浏览器访问 http://localhost:3000

## 使用指南

### 上传教材
1. 点击左侧"教材管理"区域的上传框
2. 选择PDF/MD/TXT格式的教材文件
3. 等待文件解析完成

### 构建知识图谱
1. 上传教材后，点击"全部构建"按钮
2. 系统会自动调用LLM提取知识点和关系
3. 中央区域会显示知识图谱可视化

### 跨教材整合
1. 构建至少2本教材的知识图谱后
2. 点击右侧"整合"标签页的"执行跨教材整合"按钮
3. 系统会自动识别重复知识点并执行整合

### RAG问答
1. 点击"构建向量索引"按钮
2. 在右侧"RAG问答"标签页输入问题
3. 系统会返回带引用来源的回答

### 对话调整
1. 在右侧"对话"标签页输入消息
2. 可以询问整合决策的原因
3. 可以要求调整整合方案

## 项目结构

```
knowledge-integration-agent/
├── backend/
│   ├── app/
│   │   ├── routers/          # API路由
│   │   ├── services/         # 业务逻辑
│   │   ├── models/           # 数据模型
│   │   └── utils/            # 工具函数
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React组件
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── 需求分析.md
│   ├── 系统设计.md
│   └── Agent架构说明.md
├── report/
│   └── 整合报告.md
├── .env.example
├── .gitignore
└── README.md
```

## API文档

启动后端服务后，访问 http://localhost:8000/docs 查看Swagger API文档

## 部署

### 方案一：Cloudflare Pages + Railway（推荐）

#### 1. 部署后端到 Railway

1. 访问 [railway.app](https://railway.app) 并登录
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的仓库，设置 Root Directory 为 `backend`
4. 添加环境变量：
   - `DEEPSEEK_API_KEY`: 你的DeepSeek API Key
5. Railway会自动检测 `requirements.txt` 并部署
6. 部署完成后，获取后端URL（如 `https://xxx.up.railway.app`）

#### 2. 部署前端到 Cloudflare Pages

1. 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 进入 "Workers & Pages" → "Create application" → "Pages"
3. 连接GitHub仓库
4. 设置：
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
5. 添加环境变量：
   - `VITE_API_BASE`: 你的Railway后端URL + `/api`（如 `https://xxx.up.railway.app/api`）
6. 部署完成后获取前端URL

#### 3. 更新 _redirects 文件

编辑 `frontend/public/_redirects`，将 `your-railway-backend` 替换为你的Railway后端URL：
```
/api/*  https://your-actual-railway-url.up.railway.app/api/:splat  200
```

### 方案二：魔搭创空间（免费）

1. 访问 [modelscope.cn](https://modelscope.cn) 创建创空间
2. 选择 Gradio/Streamlit 框架
3. 上传代码并配置环境变量
4. 适合不需要前后端分离的场景

### 方案三：本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
echo DEEPSEEK_API_KEY=your_key > .env
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## 许可证

MIT License
