// Astro content collections (PLAN 1.2). Schemas come from src/content/schemas.ts, the same
// module `pnpm check` uses (scripts/check-content.ts), so build and check can't disagree.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { knowledgeSchema, partSchema } from "./content/schemas.ts";

const parts = defineCollection({
  loader: glob({ base: "./content/parts", pattern: "**/*.mdx" }),
  schema: partSchema,
});

const knowledge = defineCollection({
  loader: glob({ base: "./content/knowledge", pattern: "**/*.md" }),
  schema: knowledgeSchema,
});

export const collections = { parts, knowledge };
