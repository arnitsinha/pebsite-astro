import { defineCollection, z } from "astro:content";

// `rssSchema` marks every field optional, which left `title`/`pubDate`
// possibly-undefined at every call site. The posts always carry these, so
// require them here and let the RSS feed read them safely.
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string().optional(),
  }),
});

export const collections = { blog };
