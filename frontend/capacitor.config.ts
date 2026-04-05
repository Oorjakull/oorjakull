import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.oorjakull.app',
  appName: 'OorjaKull',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    adjustResize: true,
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
      logLevel: 1,
    },
  },
}

export default config
