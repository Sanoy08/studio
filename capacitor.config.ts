import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bumbas.kitchen',
  appName: 'Bumbas Kitchen',
  webDir: 'out', 
  server: {
    // আপনার লাইভ ওয়েবসাইটের লিংক (দয়া করে চেক করুন শেষে '/' আছে কিনা, থাকলে মুছে দিন)
    url: 'https://bumbaskitchen.app', 
    
    // ★★★ এই অংশটি অ্যাপের ভেতরে ওয়েবসাইট লোড করতে সাহায্য করবে ★★★
    allowNavigation: [
      'bumbaskitchen.app',
      '*.bumbaskitchen.app',
      'accounts.google.com' // যদি Google Login ব্যবহার করেন
    ],
    
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