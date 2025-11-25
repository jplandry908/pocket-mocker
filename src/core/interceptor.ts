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

// Current rule list
let activeRules: MockRule[] = []

// Method for external updates to rules
export function updateRules(rules: MockRule[]) {
  activeRules = rules
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function patchFetch() {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const startTime = performance.now(); // Start timing
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
    const method = (init?.method || 'GET').toUpperCase();

    // Find matching and enabled rules
    const matchedRule = activeRules.find(r => {
      if (!r.enabled || r.method !== method) return false;

      // Improved matching logic: supports exact matching and inclusion matching
      const isExactMatch = url === r.url || url.endsWith(r.url);
      const isIncludeMatch = url.includes(r.url);

      return isExactMatch || isIncludeMatch;
    });

    if (matchedRule) {
      // === Key logic: wait for delay if set ===
      if (matchedRule.delay > 0) {
        console.log(`⏱️ [PocketMock] Delay ${matchedRule.delay}ms`);
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
 * Core: Intercept XMLHttpRequest (new addition)
 * Use inheritance to extend the native XHR class
 */

function patchXHR() {
  const OriginalXHR = window.XMLHttpRequest;

  class PocketXHR extends OriginalXHR {
    private _url: string = ''
    private _method: string = 'GET'
    private _startTime: number = 0; // New addition

    // 1. Hijack open method: just to get URL and Method
    open(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null): void {
      this._url = url.toString();
      this._method = method.toUpperCase();
      this._startTime = performance.now(); // Start timing
      // Call native open to initialize state
      super.open(method, url, async, username, password);
    }

    // 2. Hijack send method: decide whether to send real request or return fake data
    send(body?: Document | XMLHttpRequestBodyInit | null): void {
      const matchedRule = activeRules.find(r =>
        r.enabled && this._url.includes(r.url) && r.method === this._method
      );

      if (matchedRule) {
        // Simulate response process
        const mockResponse = async () => {
          if (matchedRule.delay > 0) await sleep(matchedRule.delay);

          // === Key dark magic: override read-only properties ===
          // Browser normally doesn't allow direct assignment to this.responseText, must use defineProperty
          Object.defineProperty(this, 'status', { value: matchedRule.status });
          Object.defineProperty(this, 'statusText', { value: matchedRule.status === 200 ? 'OK' : 'Error' });
          Object.defineProperty(this, 'readyState', { value: 4 }); // DONE
          Object.defineProperty(this, 'response', { value: JSON.stringify(matchedRule.response) });
          Object.defineProperty(this, 'responseText', { value: JSON.stringify(matchedRule.response) });
          // This step is for axios compatibility, axios will automatically parse JSON
          Object.defineProperty(this, 'responseURL', { value: this._url });

          // Manually trigger events to deceive business code that "request is complete"
          // dispatchEvent will automatically trigger corresponding callback functions, no manual call needed
          this.dispatchEvent(new Event('readystatechange'));
          this.dispatchEvent(new Event('load'));

          // Log recording
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
        return; // ⛔️ Prevent native send from sending request
      }

      // No rule matched, pass through to native XHR
      super.send(body);
    }
  }
  // Replace global object
  window.XMLHttpRequest = PocketXHR;
}

export function initInterceptor() {
  console.log('%c PocketMock started (Fetch + XHR) ', 'background: #222; color: #bada55');
  patchFetch();
  patchXHR();
}