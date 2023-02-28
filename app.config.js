import 'dotenv/config'

export default {
  expo: {
    name: 'MrChoffer',
    slug: 'mr-chofer',
    version: '1.2.0',
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
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      runtimeVersion: {
        policy: 'appVersion'
      }
    },
    notification: {
      androidMode: 'collapse'
    },
    android: {
      runtimeVersion: '1.0.0',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.mrchofer.mrchofer',
      googleServicesFile: './google-services.json'
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
      },
      sentry: {
        dsn: process.env.SENTRY_DSN
      }
    },
    owner: 'cantte',
    plugins: [
      'sentry-expo',
      [
        'expo-notifications',
        {
          sounds: ['./assets/sounds/notification.wav']
        }
      ]
    ],
    hooks: {
      postPublish: [
        {
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN
          }
        }
      ]
    }
  }
}
