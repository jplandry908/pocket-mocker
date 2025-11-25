import Dashboard from './lib/dashboard.svelte'
import { initInterceptor } from './core/interceptor'
import { mount } from 'svelte'
import { initStore } from './core/store';

// 1. Initialize interceptor core
initInterceptor();
initStore();
// 2. Mount Svelte application to document.body
const app = mount(Dashboard, {
  target: document.body,
});

export default app;

// ... Test button logic remains unchanged ...