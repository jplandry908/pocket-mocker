# 部署设置指南

## 必需的 GitHub Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets：

### 1. NPM_TOKEN
- **用途**: 用于发布包到 NPM
- **获取方式**:
  1. 登录 [npmjs.com](https://www.npmjs.com)
  2. 进入 Account Settings → Access Tokens
  3. 点击 "Generate New Token"
  4. 选择 "Automation" 类型
  5. 复制生成的 token
- **设置**: 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加 `NPM_TOKEN`

## 工作流程说明

### 1. Release Notes 自动生成 (release.yml)
- **触发条件**: 推送以 `v` 开头的 tag (如 `v1.2.0`)
- **功能**:
  - 自动获取上一个版本以来的所有提交
  - 按类别整理提交内容 (Features, Bug Fixes, Changes, Other)
  - 生成格式化的 Release Notes
  - 创建 GitHub Release

### 2. NPM 自动发布 (npm-publish.yml)
- **触发条件**: GitHub Release 被发布时
- **功能**:
  - 运行测试和类型检查
  - 构建项目
  - **自动重试机制**: 最多重试 3 次，指数退避
  - **验证机制**: 确保包成功发布到 NPM
  - **错误恢复**: 失败时生成回滚计划

## 使用方法

### 发布新版本：

1. **更新版本号**:
   ```bash
   npm version patch  # 或 minor, major
   ```

2. **推送 tag**:
   ```bash
   git push --tags
   ```

3. **自动化流程**:
   - 推送 tag 后，自动触发 Release Notes 生成
   - Release 创建后，自动触发 NPM 发布

### 故障恢复：

如果发布失败，工作流会：
1. 自动生成 `rollback_info.md` 文件
2. 提供详细的回滚步骤
3. 包含所有必要的信息用于手动恢复

## 权限要求

确保 GitHub Actions 有以下权限：
- `contents: write` (用于创建 Release)
- NPM 发布权限 (通过 NPM_TOKEN)

## 监控建议

1. 关注 GitHub Actions 运行状态
2. 检查 NPM 包是否成功发布
3. 验证 Release Notes 是否正确生成
4. 定期检查 NPM_TOKEN 有效性