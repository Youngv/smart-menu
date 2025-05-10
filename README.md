# 今天吃什么

一个简单而实用的菜单生成器应用，帮助你解决"今天吃什么"的日常困扰。基于 Ruby Roda 的后端 API 和响应式前端界面，支持离线使用的 PWA 功能。

## 技术栈

- **后端**：Ruby + Roda + Sequel + SQLite3
- **前端**：HTML5 + CSS3 + JavaScript
- **部署**：Puma 服务器

## 特性

- 随机生成每日菜单
- 自定义菜品分类（荤菜、素菜、汤类）
- 锁定喜欢的菜品（下次生成时保留）
- 管理菜品（添加、编辑、删除）
- 导入/导出菜单数据
- 支持离线使用的 PWA 功能
- 响应式设计，适配各种设备

## 安装与设置

### 安装依赖

```bash
bundle install
```

### 设置数据库

```bash
bundle exec rake setup
```

此命令将创建 SQLite 数据库并导入初始菜品数据。

## 运行应用

启动服务器：

```bash
bundle exec rake server
```

服务器启动在 http://localhost:3000

## API 端点

### 获取所有菜品

```
GET /api/dishes
```

返回所有菜品，按类型（肉类、素菜、汤）分组。

### 获取单个菜品

```
GET /api/dishes/:id
```

根据 ID 获取单个菜品的详细信息。

### 创建新菜品

```
POST /api/dishes
```

请求体：
```json
{
  "name": "菜品名称",
  "description": "菜品描述",
  "type": "meat|vegetarian|soup"
}
```

### 更新菜品

```
PUT /api/dishes/:id
```

请求体：
```json
{
  "name": "更新的菜品名称",
  "description": "更新的菜品描述",
  "type": "meat|vegetarian|soup"
}
```

### 删除菜品

```
DELETE /api/dishes/:id
```

## 项目结构

```
/
├── app.rb              # 应用入口点
├── Gemfile             # Ruby依赖
├── Rakefile            # 任务定义
├── public/             # 前端静态文件
│   ├── index.html      # 前端主页面
│   ├── script.js       # 前端脚本
│   ├── dishes.json     # 初始菜品数据
│   ├── manifest.json   # PWA配置
│   └── sw.js           # Service Worker
├── icons/              # 应用图标
├── api/                # 后端API组件
│   ├── config/         # 配置文件
│   ├── models/         # 数据模型
│   ├── routes/         # API路由
│   └── db/             # 数据库文件
``` 

## Docker 部署

```bash
docker rm -f smart-menu
docker build -t smart-menu .
docker run -d --rm -p 8080:80 --name smart-menu smart-menu
```
