import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const schedule = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/schedule' }),
  schema: z.object({
    title: z.string(),
    recurrence: z.enum(['once', 'yearly', 'lunar-yearly']).default('once'),
    date: z.union([z.string(), z.date()]).optional(),
    lunarMonth: z.coerce.number().int().min(1).max(13).optional(),
    lunarDay: z.coerce.number().int().min(1).max(30).optional(),
    note: z.string().optional(),
  }),
});

export const collections = { schedule };