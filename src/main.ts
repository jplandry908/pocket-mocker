import Dashboard from './lib/dashboard.svelte'
import { initInterceptor } from './core/interceptor'
import { mount } from 'svelte'

// 1. 启动拦截核心
initInterceptor();

// 2. 挂载 Svelte 应用到 document.body
const app = mount(Dashboard, {
  target: document.body,
});

export default app;

// ... 下面的测试按钮逻辑保持不变 ...

async function runTests() {
  console.group('🚀 开始 PocketMock 全功能测试');
  const targetUrl = '/api/login';

  // 1. 测试 Fetch + 延迟 + 状态码 + Body
  console.log('Test 1: 发起 Fetch 请求 (预期耗时 > 2s)...');
  const startTime = Date.now();

  try {
    const res = await fetch(targetUrl, { method: 'POST' }); // 注意这里用了 POST
    const endTime = Date.now();
    const duration = endTime - startTime;

    // 验证延迟
    if (duration > 1900) {
      console.log(`✅ [延迟] 测试通过! 耗时: ${duration}ms`);
    } else {
      console.warn(`❌ [延迟] 似乎太快了? 耗时: ${duration}ms`);
    }

    // 验证状态码 (我们设置了 403)
    if (res.status === 403) {
      console.log(`✅ [状态码] 测试通过! Got 403`);
    } else {
      console.error(`❌ [状态码] 失败! 预期 403, 实际 ${res.status}`);
    }

    // 验证 Headers
    const authHeader = res.headers.get('x-auth-level');
    if (authHeader === 'admin') {
      console.log(`✅ [Headers] 测试通过! Got x-auth-level: admin`);
    } else {
      console.error(`❌ [Headers] 失败! 没拿到自定义 Header`);
    }

    // 验证 Body
    // 注意：即使是 403，通常也会返回 JSON 错误信息，fetch 不会因为 403 抛错（axios会）
    const data = await res.json();
    if (data.token === 'abcdef-123456') {
      console.log(`✅ [Body] 测试通过! Got correct JSON`);
    } else {
      console.error(`❌ [Body] 失败! 数据不对`, data);
    }

  } catch (err) {
    console.error('❌ Fetch 请求本身出错了', err);
  }

  console.log('-----------------------------------');

  // 2. 测试 XHR (Ajax) 兼容性
  console.log('Test 2: 发起 XHR 请求 (测试兼容性)...');

  const xhr = new XMLHttpRequest();
  xhr.open('POST', targetUrl);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 403 && xhr.responseText.includes('abcdef-123456')) {
        console.log(`✅ [XHR] 测试通过! 完美拦截 Ajax`);
      } else {
        console.error(`❌ [XHR] 失败! Status: ${xhr.status}, Body: ${xhr.responseText}`);
      }

      // 验证 XHR Headers
      const headerVal = xhr.getResponseHeader('x-auth-level');
      if (headerVal === 'admin') {
        console.log(`✅ [XHR Headers] 测试通过!`);
      }
      console.groupEnd();
    }
  };
  xhr.send();
}

runTests();