import 'dotenv/config'

export default {
  expo: {
    name: 'MrChoffer',
    slug: 'mr-chofer',
    version: '1.0.2',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.mrchofer.mrchofer'
    },
    web: {
      favicon: './assets/images/favicon.png'
    },
    extra: {
      eas: {
        projectId: '3a993f1e-cdb7-47d1-80d9-fc623bc77d08'
      },
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY
      },
      legal: {
        terms: process.env.TERMS_AND_CONDITIONS_URL,
        vehicleLeasing: process.env.VEHICLE_LEASING_CONTRACT_URL
      }
    },
    owner: 'cantte'
  }
}
