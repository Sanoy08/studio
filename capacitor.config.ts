import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bumbas.kitchen',
  appName: 'Bumbas Kitchen',
  webDir: 'out',
  server: {
    // Tomar live website er link
    url: 'https://bumbaskitchen.app', 
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;