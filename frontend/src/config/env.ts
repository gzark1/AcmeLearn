import { z } from 'zod'

/**
 * Environment variable schema with validation
 * All required env vars must be defined to start the app
 */
const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:8000'),
})

/**
 * Validates and exports environment variables
 * Throws at startup if validation fails
 */
function validateEnv() {
  const parsed = envSchema.safeParse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
  })

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

export const env = validateEnv()
