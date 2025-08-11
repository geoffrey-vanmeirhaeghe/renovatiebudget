// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@tresjs/nuxt"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Runtime configuration for Strapi integration
  runtimeConfig: {
    public: {
      strapi: {
        baseURL: process.env.STRAPI_BASE_URL || 'http://localhost:1337'
      }
    }
  }
})
