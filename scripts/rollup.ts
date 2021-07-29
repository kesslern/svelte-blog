import require from "./require.ts";
const { rollup } = require("rollup");
const svelte = require("rollup-plugin-svelte");
const css = require("rollup-plugin-css-only");

async function run(componentName: string) {
  const bundle = await rollup({
    input: `src/${componentName}.svelte`,
    plugins: [
      svelte({
        compilerOptions: {
          generate: "ssr",
        },
      }),
      css({ output: "ssr.css" }),
    ],
  });

  // Write the bundle to disk
  await bundle.write({
    format: "esm",
    dir: "build",
    name: componentName,
  });

  const componentPath = `build/${componentName}.js`;
  const componentSource = new TextDecoder().decode(
    Deno.readFileSync(componentPath),
  );
  Deno.writeTextFileSync(
    componentPath,
    componentSource.replace(
      /^(.*)$/m,
      'import require from "../scripts/require.ts"\nconst { create_ssr_component, each, add_attribute } = require("svelte/internal");',
    ),
  );
  console.log(`${componentName} bundle is written to ${componentPath}`);
  const component = await import("../" + componentPath);
  return component.default;
}

export default run;
