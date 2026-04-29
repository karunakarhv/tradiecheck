import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'au.com.tradiecheck.app',
  appName: 'TradieCheck',
  webDir: 'dist',
  plugins: {
    Camera: {},
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#050505',
  },
  android: {
    backgroundColor: '#050505',
  },
};

export default config;
