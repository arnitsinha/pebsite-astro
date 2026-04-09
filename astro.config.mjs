import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";
import robotsTxt from "astro-robots-txt";
import UnoCSS from "@unocss/astro";
import icon from "astro-icon";
import partytown from '@astrojs/partytown';
import solidJs from "@astrojs/solid-js";

import { remarkReadingTime } from "./src/lib/ remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://arnitport.netlify.app",
  mode: "production",
  integrations: [
    sitemap(),
    robotsTxt({
      sitemap: [
        "https://arnitport.netlify.app/sitemap-index.xml",
        "https://arnitport.netlify.app/sitemap-0.xml",
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
  adapter: netlify(),
  output: 'server',
});
