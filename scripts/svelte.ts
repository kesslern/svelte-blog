import log from "./logger.ts";
import rollup from "./rollup.ts";

const { Index, Post } = await log.run(
  "Building svelte components",
  async () => ({
    Index: await rollup("Index"),
    Post: await rollup("Post"),
  }),
);

export { Index, Post };
