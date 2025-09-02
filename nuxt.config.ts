// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  pages: true,
  modules: [
    ["@tresjs/nuxt", {
      devtools: false,
      glsl: false,
      priority: 2
    }],
    ["@nuxtjs/tailwindcss", {
      priority: 3
    }]
  ],

  // Suppress development warnings
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'warn',

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      priority: 1
    }
  ],
  
  // Auto imports
  imports: {
    autoImport: true
  },

  // Suppress specific warnings
  nitro: {
    experimental: {
      wasm: true
    }
  },


  // Build configuration to reduce warnings
  build: {
    transpile: ['@tresjs/cientos']
  },

  // Hooks to suppress warnings
  hooks: {
    'build:before': () => {
      // Suppress component override warnings during build
      const originalWarn = console.warn
      const originalLog = console.log
      const originalInfo = console.info
      
      const suppressPatterns = [
        'Overriding Html component',
        'manifest-route-rule',
        'middleware already exists',
        'You can specify a priority option',
        'You can set override: true to replace it',
        'repeated',
        'times'
      ]
      
      const shouldSuppress = (msg: any) => {
        const message = typeof msg === 'string' ? msg : String(msg)
        return suppressPatterns.some(pattern => message.includes(pattern))
      }
      
      console.warn = (...args: any[]) => {
        if (!args.some(shouldSuppress)) {
          originalWarn.apply(console, args)
        }
      }
      
      console.log = (...args: any[]) => {
        if (!args.some(shouldSuppress)) {
          originalLog.apply(console, args)
        }
      }
      
      console.info = (...args: any[]) => {
        if (!args.some(shouldSuppress)) {
          originalInfo.apply(console, args)
        }
      }
    }
  },

  // Runtime configuration for Strapi integration
  runtimeConfig: {
    public: {
      strapiBaseUrl: process.env.STRAPI_BASE_URL || 'http://localhost:1337',
      strapi: {
        baseURL: process.env.STRAPI_BASE_URL || 'http://localhost:1337'
      }
    }
  },

  // CSS configuration
  css: ['~/assets/css/main.css'],

  // App configuration
  app: {
    head: {
      title: 'Renovatie Budget - Belgian Renovation Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Belgian renovation platform for homeowners and contractors' }
      ]
    }
  }
})
