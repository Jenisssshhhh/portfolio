// src/sanityClient.ts
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: true, // `false` if you want fresh data, `true` for faster cached data
  token: process.env.SANITY_API_TOKEN // Add read-only token for security
})

export default client