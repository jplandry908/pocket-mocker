# 🛠️ PocketMock

> **所见即所得的浏览器端可视化 HTTP 调试台。**
> 一款轻量级、可视化的浏览器内 HTTP Mock 工具，专为现代前端开发而设计。

[![npm 版本](https://badge.fury.io/js/pocket-mock.svg)](https://badge.fury.io/js/pocket-mock)
[![开源协议: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  

[English](README.md) | **中文**

**PocketMock** 是一款零侵入的前端 Mock 工具。与 Postman 或传统的 `mock.js` 不同，它直接**嵌入在你的页面中**，让你在开发时可以实时拦截 `fetch` 和 `XMLHttpRequest`，动态修改响应数据、模拟网络延迟和异常状态码。

*(此处建议放一张 GIF 动图，展示打开浮窗、修改 JSON、点击测试按钮的全过程)*

## ✨ 核心特性

- **⚡️ 双核拦截引擎**：原生支持 `fetch` 和 `XMLHttpRequest` (Ajax)，无缝兼容 Axios 等第三方库
- **🎨 智能控制台**：内置 **CodeMirror 6** 编辑器（支持 JS 语法高亮），自适应 **深色/浅色主题**，提供优雅的 **Toast** 通知
- **🧠 动态响应**：支持编写 JavaScript 函数，根据请求参数 (Query/Body) 动态生成响应数据，处理复杂逻辑
- **🌐 功能全面的网络面板**：实时记录所有网络请求（Mocked 或真实请求），支持 **搜索与筛选**、**详情查看** (请求/响应体)、**单条日志删除**，以及 **“一键 Mock”** 功能（将真实请求转化为 Mock 规则）。
- **🛡️ Shadow DOM 隔离**：UI 样式完全隔离，绝不污染你的业务页面 CSS，也不受外部影响
- **🐢 网络环境模拟**：一键模拟接口 **延迟 (Latency)**、**404/500 报错**，轻松测试骨架屏和错误边界
- **📂 双模持久化**：
  - **本地模式**：默认使用 LocalStorage，刷新不丢失
  - **服务器模式**：配合 Vite 插件，自动将规则同步保存到本地文件，实现**团队共享**

## 📦 安装
```bash
npm install pocket-mock --save-dev
# 或者
yarn add pocket-mock -D
# 或者
pnpm add pocket-mock -D
```

## 🚀 快速开始

### 方式一：零配置使用（本地模式）

适合个人开发或快速尝试。直接在项目的入口文件（如 `src/main.ts` 或 `src/index.js`）中引入并启动：

```javascript
import { start } from 'pocket-mock';

// 仅在开发环境下启动
if (process.env.NODE_ENV === 'development') {
  start();
}
```

启动项目后，页面右下角会出现 **PocketMock** 浮窗，即可开始 Mock 之旅！

### 方式二：团队协作模式（Vite 插件）🔥 推荐

适合生产级项目。通过 Vite 插件打通文件系统，将 Mock 规则保存为配置文件并提交到 Git 仓库。

**1. 配置 `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import pocketMockPlugin from 'pocket-mock/vite-plugin';

export default defineConfig({
  plugins: [
    pocketMockPlugin()
  ]
});
```

**2. 启动项目**

运行 `npm run dev`。PocketMock 会自动检测到插件环境，并切换到 **服务器模式**。

## 🛠️ 进阶功能

### 动态响应 (Dynamic Response)

不再局限于静态 JSON！你可以编写 JavaScript 函数来根据请求动态生成响应。

```javascript
// 在 Dashboard 编辑器或配置文件中：
(req) => {
  // 获取 Query 参数 (如 /api/user?id=1)
  if (req.query.id === '1') {
    return { id: 1, name: 'Admin', role: 'admin' };
  }
  
  // 获取 JSON Body
  if (req.body && req.body.type === 'guest') {
    return { id: 2, name: 'Guest', role: 'guest' };
  }

  // 返回自定义状态码和 Header
  return {
    status: 404,
    headers: { 'X-Error': 'User not found' },
    body: { error: 'User not found' }
  };
}
```

### 规则字段详解

```typescript
interface MockRule {
  id: string;           // 唯一标识符
  method: string;       // HTTP 方法：GET, POST...
  url: string;          // URL 匹配模式
  response: any | ((req) => any); // 静态数据 或 动态函数
  enabled: boolean;     // 启用/禁用
  delay: number;        // 网络延迟 (ms)
  status: number;       // HTTP 状态码
  headers: Record<string, string>;
}
```

### 功能全面的网络面板

内置的网络面板将实时记录所有网络请求（包括 Mocked 和真实请求），提供强大的调试能力：

-   **所有请求**：查看应用程序发出的每一个 `fetch` 和 `XMLHttpRequest` 请求。
-   **搜索与筛选**：通过 URL 或方法快速查找请求，并按类型（Mocked/真实）进行筛选。
-   **详情查看**：点击任意日志条目，即可展开并查看完整的响应体（Response Body）。
-   **“一键 Mock”功能**：点击按钮即可将任何真实网络请求转换为一条新的 Mock 规则，自动预填充 URL、方法和响应体。
-   **单条日志删除**：删除单个日志条目，保持列表清晰。
-   **清空所有日志**：立即清空所有日志历史记录。

### 智能降级策略

PocketMock 采用渐进式架构：

1. **启动时**：尝试连接开发服务器接口
2. **服务器模式**：如果连接成功，启用**文件读写**功能
3. **本地模式**：如果连接失败（未配置插件或非 Vite 环境），自动降级为 **LocalStorage** 存储

这意味着它可以在 Webpack、RSPack 甚至纯 HTML 项目中正常工作。

## 💡 技术原理

- **Monkey Patching**：通过重写 `window.fetch` 和继承 `XMLHttpRequest` 原型链实现拦截
- **Shadow DOM**：使用 Web Components 技术将调试台 UI 封装在 Shadow Root 中，实现样式完全沙箱化
- **Vite Library Mode**：使用 Vite 库模式打包，结合 `css: 'injected'` 策略，将所有 CSS 内联至 JS 中，实现 npm 包的**单文件引入**体验

## 🎯 使用场景

- **API 开发**：在后端 API 完成前模拟响应数据
- **错误测试**：模拟网络故障、超时和服务器错误
- **性能测试**：通过人工延迟测试加载状态和骨架屏
- **离线开发**：无需后端依赖即可独立开发
- **团队协作**：在开发团队间共享 Mock 配置

## 🔧 高级配置

### 自定义集成

```javascript
import { start } from 'pocket-mock';

start({
  enable: true // 可选的显式启用标志
});
```

### TypeScript 支持

完整的 TypeScript 支持：

```typescript
import { start, MockRule } from 'pocket-mock';

// 类型自动可用
const rule: MockRule = {
  id: 'custom-rule',
  method: 'GET',
  url: '/api/users',
  response: { users: [] },
  enabled: true,
  delay: 1000,
  status: 200,
  headers: { 'X-Custom': 'value' }
};
```

## 🤝 贡献

本地开发环境搭建：

```bash
git clone https://github.com/your-username/pocket-mock.git
cd pocket-mock
npm install

# 启动开发服务器
npm run dev

# 构建发布包
npm run build

# 运行测试
npm test
```

## 📄 开源协议

MIT © [Your Name](https://github.com/your-username)

## 🙏 致谢

- 使用 [Svelte](https://svelte.dev/) 构建响应式 UI
- 由 [Vite](https://vitejs.dev/) 提供快速开发和构建支持
- 灵感来源于现代 Web 开发对更好调试工具的需求

---

**享受 Mock 的乐趣！🚀**