import { defineConfig } from 'drizzle-kit';

const pathToSchema =
  process.env.NODE_ENV === 'production'
    ? './dist/db/schema.ts'
    : './src/db/schema.ts';

export default defineConfig({
  out: './drizzle',
  schema: pathToSchema,
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
