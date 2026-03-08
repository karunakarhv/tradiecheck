// Feature flags — controlled via Vite environment variables.
// Set in .env for local dev, or in Vercel project settings for production.

export const FLAGS = {
  // Show the /api-config route and its nav link.
  // Set VITE_ENABLE_API_CONFIG=true to enable.
  API_CONFIG: import.meta.env.VITE_ENABLE_API_CONFIG === 'true',
}
