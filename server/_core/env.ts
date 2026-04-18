export const ENV = {
  appId: process.env.VITE_APP_ID ?? "manus-storage",
  cookieSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "local-owner",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Simple hardcoded login credentials (set in Manus env)
  appUsername: process.env.APP_USERNAME ?? "admin",
  appPassword: process.env.APP_PASSWORD ?? "admin",
};

