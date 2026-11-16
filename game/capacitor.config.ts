import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tn.benmacha.readysteadybang',
  appName: 'Ready Steady Bang',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#f5f5f5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#f5f5f5'
    }
  },
  ios: {
    contentInset: 'always',
    minVersion: '14.0'
  },
  android: {
    allowMixedContent: true,
    minSdkVersion: 23
  }
};

export default config;
