import { defineCollection } from 'astro:content';
import { rssSchema } from '@astrojs/rss';
import { Image } from 'astro:assets';

const blog = defineCollection({
  schema: rssSchema,
});

export const collections = { blog };