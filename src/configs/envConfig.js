import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

export const env = createEnv({
  server: {
    DB_TYPE: z.string(),
    DB_HOST: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_PORT: z.string().default('5432'),
    DB_SSL: z.string().default('true'),
  },
  runtimeEnv: process.env,
});
