import { defineCollection } from 'astro:content';
import { rssSchema } from '@astrojs/rss';

const projects = defineCollection({
  schema: rssSchema,
});

export const collections = { projects };