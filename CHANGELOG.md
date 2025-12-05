# Changelog

## v1.0.2 - 2025-12-05

### New Features

- **Tab-Based Request Details**: Network logs now feature a tabbed interface for better organization:
  - **Headers Tab**: View request headers in a formatted JSON view
  - **Payload Tab**: Inspect request body/payload data
  - **Response Tab**: View response body (default tab for quick access)

### Improvements

- **Enhanced Request Logging**:
  - Added full request headers capture and display
  - Added request payload logging for both fetch and XHR requests
  - Formatted JSON output for better readability

### Technical Changes

- **Code Structure**:
  - Added `formatHeaders` utility function for consistent header formatting
  - Updated `LogEntry` interface to include `requestPayload` and `requestHeaders` fields
  - Enhanced interceptor to capture and format request data

## v1.0.1 - 2025-12-04

### Improvements

- **Build Configuration**: Optimized build process for better performance

## v1.0.0 - 2025-12-01

### Initial Release

**PocketMock** v1.0.0 is officially released! This is a lightweight, zero-intrusion, visualization-first frontend mock tool designed to revolutionize your development workflow.

### Key Features

- **Dual-Core Interception Engine**: Natively supports both `fetch` and `XMLHttpRequest` (Ajax), ensuring seamless compatibility with libraries like Axios.
- **Smart Dashboard**: A built-in visual control panel injected into your page. It features a CodeMirror 6 editor, dark/light theme support, and intuitive rule management.
- **Intelligent Mock Data Generation**: Built-in "Smart Mock" generator allows you to create realistic data effortlessly using placeholders like `@guid`, `@cname`, `@image`, `@email`, and `@date`. Supports complex nested structures and array generation (`key|count`).
- **One-Click Import**:
  - **Postman Collection v2.1**: Import your existing Postman collections directly.
  - **OpenAPI 3.0 (Swagger)**: Import API specifications.
  - **Smart Inference**: Automatically generates mock data based on field names and types during import (e.g., `avatar` field gets an image URL).
- **Dynamic Response**: Write JavaScript functions to dynamically generate responses based on request Query, Body, or Headers, enabling simulation of complex business logic.
- **Full-Featured Network Panel**:
  - Real-time logging of all requests (Mocked & Real).
  - Detailed inspection of request/response bodies.
  - **"One-Click Mock"**: Instantly convert a real network request into a mock rule.
  - Powerful search and filtering capabilities.
- **Dual-Mode Persistence**:
  - **Local Mode**: Zero-config, data saved in LocalStorage.
  - **Server Mode**: Paired with the Vite plugin, mock rules are automatically synced to a local file (`pocket-mock.json`), enabling team collaboration and version control.
- **Shadow DOM Isolation**: The entire UI is encapsulated within Shadow DOM, ensuring zero style conflicts with your application.