# 💡 PocketMock Insights & Design Philosophy

> "Software design is an iterative process of trade-offs and evolution."
>
> 本文档记录了 PocketMock 开发过程中的核心思考、技术决策背后的权衡，以及我们对未来的愿景。这不仅是技术文档，更是项目的“灵魂”。

## 1. 缘起：为了更纯粹的开发体验

在前端开发中，Mock 是一个绕不开的环节。但现有的工具往往走向了两个极端：
- **重型平台 (YApi/Postman)**：功能强大，但需要切换上下文，配置繁琐，且很难与本地代码紧密结合。
- **代码级库 (Mock.js/MSW)**：侵入性强，修改 Mock 数据需要改代码、保存、热重载，反馈链路长。

**PocketMock 的初心**：
我们想要一个**直接生活在浏览器里**的工具。
- **所见即所得**：像 Chrome DevTools 一样，点开就能改，改完立即生效。
- **零侵入**：不污染项目依赖，不修改业务代码。
- **随手可得 (Pocket)**：它就像口袋里的小工具，轻量、便携，却能解决大问题。

## 2. 核心哲学 (Core Philosophy)

### 2.1 零侵入与隔离 (Zero Intrusion & Isolation)
这是我们的底线。为了实现这一点，我们采用了 **Shadow DOM** 技术。
- **挑战**：Shadow DOM 导致很多第三方库（如早期的编辑器组件）样式失效、事件冒泡异常。
- **对策**：我们为此定制了样式注入逻辑，并选择了对 Shadow DOM 支持良好的 **CodeMirror 6**，手动处理了 `root` 和事件委托。这确保了 PocketMock 的 UI 绝不会被宿主页面的 CSS 污染，反之亦然。

### 2.2 双模持久化：平衡个人与团队 (Dual-Mode Persistence)
如何既让个人开发者“零配置”上手，又能满足团队协作的需求？我们设计了**渐进式架构**：
- **Local Mode (默认)**：基于 `localStorage`。无需任何后端支持，打开即用，刷新不丢。适合 Demo、原型验证和个人项目。
- **Server Mode (进阶)**：基于 `Vite Plugin`。通过插件打通浏览器与文件系统。当检测到插件时，自动升级为“服务器模式”，将规则保存为文件 (`pocket-mock.json` / `.ts`)，从而实现 Git 共享。

### 2.3 配置即代码 (Configuration as Code)
我们在 v1.x 后期做出了一个重要决定：从纯静态配置转向动态逻辑。
- **起因**：静态 JSON 无法模拟复杂的业务逻辑（如“如果是 VIP 用户返回 A，否则返回 B”）。
- **方案**：**动态响应 (Dynamic Response)**。我们允许用户编写 JavaScript 函数。
- **黑科技**：为了在 UI (localStorage) 中保存这些函数，我们实现了一套 **String Hydration** 机制——将函数序列化为字符串存储，运行时动态还原（Hydrate）为可执行代码。这让浏览器端的 Mock 拥有了接近服务器端的能力。

## 3. 关键技术演进 (Evolution)

### 编辑器的救赎：从 Textarea 到 CodeMirror 6
最初，为了追求极简，我们使用了 `<textarea>`。但很快发现：
- JSON 格式错误频发，用户体验极差。
- 无法编写复杂的动态响应函数。

我们决定引入 **CodeMirror 6**。这是一个艰难但正确的决定：
- **困难**：Shadow DOM 下的样式失效、Focus 问题、包体积控制。
- **成果**：现在我们拥有了一个支持 **JS 语法高亮**、**自动格式化**、**智能提示** 的专业级编辑器。配合我们设计的 **自适应主题** 和 **Toast** 系统，交互体验达到了 IDE 级别。

### 数据流的思考
我们采用了 Svelte 的 Store 模式，但做了一个特殊的 **Debounce Save**（防抖保存）策略。
- 用户在编辑器中的每一次按键都会更新内存 Store（实现实时预览）。
- 但只有停止输入 500ms 后，才会触发持久化（写入 localStorage 或文件）。
这既保证了响应速度，又避免了频繁的 IO 开销。

## 4. 未来展望：TypeScript First

虽然目前我们兼容 JSON 配置，但未来的趋势必然是 **`.ts` 配置文件**。
- **原因**：开发者需要类型安全 (Type Safety) 和智能补全 (IntelliSense)。
- **计划**：引入 `defineConfig`，让 Mock 规则的编写像写 Vite 配置一样流畅。这不仅仅是格式的改变，更是开发体验的质变。

---

## 5. 人与 AI 的协作：一场发现之旅 (Human-AI Collaboration: A Journey of Discovery)

PocketMock 的演进不仅仅是代码的增长，更是一场人与 AI 深度协作的探索。在这个过程中，人类的直觉、经验与 AI 的逻辑、执行力相互碰撞与融合，共同塑造了产品。

### 5.1 明确需求与细致打磨：从粗糙到优雅的 UI
- **痛点识别**：初期，提示信息使用浏览器原生的 `alert()` 阻塞了用户体验。人类提出了“更优雅”的诉求。
- **方案设计**：AI 建议并实现了基于 Svelte Store 的 `Toast` 通知系统，提供非阻塞、主题自适应的提示。
- **风格微调**：初期 `Toast` 的颜色风格与主题不符，人类提出“还不够优雅”。AI 迅速理解并采纳了“左侧色条”的设计，实现了优雅且主题自适应的通知，完美融入 UI。

### 5.2 挑战复杂性：CodeMirror 的重重考验
- **引入决策**：从简单的 `<textarea>` 升级到专业级编辑器 CodeMirror 6，是提升用户体验的关键一步。
- **Shadow DOM 兼容**：PocketMock 运行在 Shadow DOM 环境下，这是 CodeMirror 遇到的最大挑战。
    - **诊断**：编辑器初始化失败、高度为零、无法输入等问题接踵而至。
    - **迭代**：AI 逐步排查了依赖冲突、CSS 样式隔离 (`:global()`)、Shadow DOM `root` 配置等关键点。
    - **关键时刻**：当 `onMount` 无法触发时，AI 采取了“逐层隔离”的调试策略，最终定位到 CodeMirror 模块导入与 Vite 构建的深层兼容性问题，并切换到子包导入方式。
    - **初始化时序**：在 Shadow DOM 中，`onMount` 触发时 DOM 元素尺寸可能尚未稳定，导致 CodeMirror 初始化失败。人类明确指出“不要切回 `onMount`”，AI 最终采用了基于 `tick()` 和 `initialized` 状态的异步初始化策略，确保了 CodeMirror 在 DOM 稳定后才被初始化。这深刻体现了在复杂前端环境下，对生命周期和渲染时序的精确把握至关重要。

### 5.3 动态响应的 Bug 狩猎
- **核心功能**：实现 `(req) => {...}` 形式的动态响应是 PocketMock 的亮点。
- **隐蔽 Bug**：
    - **Query 参数类型**：`req.query.id === 1` 返回 `guest` 的问题，暴露出 JavaScript 中字符串与数字比较的经典陷阱。人类快速定位并指出问题，AI 提供了修改建议。
    - **Invalid URL 错误**：相对 URL 在 `new URL()` 构造函数中报错。AI 精准定位并使用 `window.location.origin` 补全了 Base URL。
    - **XHR `undefined` 数据**：动态响应返回 `undefined`。经过多轮日志排查，AI 最终发现是 `patchXHR` 和 `patchFetch` 中对 `resolvedResponse` 的错误引用（使用了 `rule.response` 而非 `resolvedResponse`），导致 Hydration 后的函数未能执行。

### 5.4 协作的基石：信任与规范
- **指令的遵守**：人类反复强调“不要擅自 `commit`”，AI 在多次失误后，深刻反思并强化了对指令的遵守，这对于建立长期、高效的协作至关重要。
- **哲学探讨**：关于 `.ts` 配置文件利弊的讨论，AI 能够深入分析技术趋势、社区标准和开发体验的本质，为项目决策提供清晰的思路。

---

这场人与 AI 的协作之旅，证明了通过持续的反馈、迭代和共同解决问题，我们能够构建出比单一智能体更强大的、更具洞察力的软件。PocketMock 正是这种协作精神的结晶。

**PocketMock 是我们对“理想开发工具”的一次实践。它不完美，但它在不断进化。**
