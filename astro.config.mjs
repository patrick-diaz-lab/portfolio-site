// Astro, fully static (D7). Output goes to dist/, which wrangler.jsonc serves as static assets.
import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  output: "static",
  // MDX for part pages (content/parts/**, PLAN 1.2).
  integrations: [mdx()],
  // No sharp: images pass through unchanged (sharp's install script stays blocked).
  image: { service: passthroughImageService() },
  // No dev toolbar or telemetry-style extras in builds.
  devToolbar: { enabled: false },
});
