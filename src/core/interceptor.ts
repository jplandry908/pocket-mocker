import { requestLogs } from "./log-store";

export interface MockRule {
  id: string;
  url: string;
  method: string;
  response: any;
  enabled: boolean;
  delay: number;
  status: number;
  headers: Record<string, string>
}

// 当前规则列表
let activeRules: MockRule[] = []

// 提供给外部更新规则的方法
export function updateRules(rules: MockRule[]) {
  activeRules = rules
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function patchFetch() {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const startTime = performance.now(); // 开始计时
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
    const method = (init?.method || 'GET').toUpperCase();

    // 查找匹配且开启的规则
    const matchedRule = activeRules.find(r => {
      if (!r.enabled || r.method !== method) return false;

      // 改进匹配逻辑：支持精确匹配和包含匹配
      const isExactMatch = url === r.url || url.endsWith(r.url);
      const isIncludeMatch = url.includes(r.url);

      return isExactMatch || isIncludeMatch;
    });

    if (matchedRule) {
      // === 关键逻辑：如果有延迟，先等待 ===
      if (matchedRule.delay > 0) {
        console.log(`⏱️ [PocketMock] 延迟 ${matchedRule.delay}ms`);
        await sleep(matchedRule.delay);
      }

      const duration = Math.round(performance.now() - startTime);
      requestLogs.add({
        method,
        url,
        status: matchedRule.status,
        timestamp: Date.now(),
        duration,
        isMock: true
      });

      return new Response(JSON.stringify(matchedRule.response), {
        status: matchedRule.status,
        headers: {
          'Content-Type': 'application/json',
          ...matchedRule.headers
        }
      });
    }

    return originalFetch(input, init);
  };
}

/**
 * 核心：拦截 XMLHttpRequest (新增)
 * 使用继承的方式来扩展原生 XHR 类
 */

function patchXHR() {
  const OriginalXHR = window.XMLHttpRequest;

  class PocketXHR extends OriginalXHR {
    private _url: string = ''
    private _method: string = 'GET'
    private _startTime: number = 0; // 新增

    // 1. 劫持 open 方法：仅仅是为了获取 URL 和 Method
    open(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null): void {
      this._url = url.toString();
      this._method = method.toUpperCase();
      this._startTime = performance.now(); // 开始计时
      // 调用原生 open 初始化状态
      super.open(method, url, async, username, password);
    }

    // 2. 劫持 send 方法：决定是发真请求，还是返回假数据
    send(body?: Document | XMLHttpRequestBodyInit | null): void {
      const matchedRule = activeRules.find(r =>
        r.enabled && this._url.includes(r.url) && r.method === this._method
      );

      if (matchedRule) {
        // 模拟响应过程
        const mockResponse = async () => {
          if (matchedRule.delay > 0) await sleep(matchedRule.delay);

          // === 关键黑魔法：覆写只读属性 ===
          // 浏览器原本不允许直接给 this.responseText 赋值，必须用 defineProperty
          Object.defineProperty(this, 'status', { value: matchedRule.status });
          Object.defineProperty(this, 'statusText', { value: matchedRule.status === 200 ? 'OK' : 'Error' });
          Object.defineProperty(this, 'readyState', { value: 4 }); // DONE
          Object.defineProperty(this, 'response', { value: JSON.stringify(matchedRule.response) });
          Object.defineProperty(this, 'responseText', { value: JSON.stringify(matchedRule.response) });
          // 这一步是为了兼容 axios，axios 会自动 parse JSON
          Object.defineProperty(this, 'responseURL', { value: this._url });

          // 手动触发事件，欺骗业务代码说"请求完成了"
          // dispatchEvent 会自动触发对应的回调函数，不需要手动调用
          this.dispatchEvent(new Event('readystatechange'));
          this.dispatchEvent(new Event('load'));

          // 记录日志
          const duration = Math.round(performance.now() - this._startTime);
          requestLogs.add({
            method: this._method,
            url: this._url,
            status: matchedRule.status,
            timestamp: Date.now(),
            duration,
            isMock: true
          });

          const headerString = Object.entries({
            'content-type': 'application/json',
            ...matchedRule.headers
          }).map(([k, v]) => `${k}: ${v}`).join('\r\n');

          this.getAllResponseHeaders = () => headerString;
          this.getResponseHeader = (name: string) => matchedRule.headers[name.toLowerCase()] || null;
        };

        mockResponse();
        return; // ⛔️ 阻止原生 send 发送请求
      }

      // 没命中规则，透传给原生 XHR
      super.send(body);
    }
  }
  // 替换全局对象
  window.XMLHttpRequest = PocketXHR;
}

export function initInterceptor() {
  console.log('%c PocketMock 已启动 (Fetch + XHR) ', 'background: #222; color: #bada55');
  patchFetch();
  patchXHR();
}