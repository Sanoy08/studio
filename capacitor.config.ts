import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'www.bumbaskitchen.app',
  appName: "Bumba's Kitchen",
  webDir: 'out', // এটি জাস্ট প্লেসহোল্ডার
  server: {
    // ★★★ আপনার কেনা ডোমেইন এখানে দিন ★★★
    url: 'https://bumbaskitchen.app', 
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;