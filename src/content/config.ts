import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    h1: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date(),
    announcement: z.string().optional(),
    image: z.string().optional(),
    aiGenerated: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    permalink: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    h1: z.string().optional(),
    description: z.string().optional(),
    // Optional page hero: small label + large headline (one string per line, **word** highlighted)
    eyebrow: z.string().optional(),
    headline: z.array(z.string()).optional(),
    permalink: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, pages };
