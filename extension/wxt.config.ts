import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'HourBloc Timer',
    description: 'Start and stop HourBloc time tracking without leaving your current tab.',
    permissions: ['storage', 'identity', 'alarms', 'notifications'],
    host_permissions: [
      'https://iuicavihhcfzimquamwc.supabase.co/*',
      'http://localhost:8000/*',
    ],
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
});
