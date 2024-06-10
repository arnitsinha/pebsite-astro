import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";
import robotsTxt from "astro-robots-txt";
import UnoCSS from "@unocss/astro";
import icon from "astro-icon";
import partytown from '@astrojs/partytown';
import solidJs from "@astrojs/solid-js";
import nodeAdapter from '@astrojs/node';

import { remarkReadingTime } from "./src/lib/ remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://arnitsinha.com",
  mode: "production",
  integrations: [
    sitemap(),
    robotsTxt({
      sitemap: [
        "https://arnitsinha.com/sitemap-index.xml",
        "https://arnitsinha.com/sitemap-0.xml",
      ],
    }),
    solidJs(),
    UnoCSS({ injectReset: true }),
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    })
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  adapter: nodeAdapter(),
  output: 'server',
  site: 'https://arnitsinha.com',
});
