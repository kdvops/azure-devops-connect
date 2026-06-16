import { mkdir, copyFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDirectory = path.resolve(path.dirname(currentFilePath), "..");
const sourceDirectory = path.join(rootDirectory, "static", "app", "src");
const distributionDirectory = path.join(rootDirectory, "static", "app", "dist");
const assetsDirectory = path.join(distributionDirectory, "assets");

await rm(distributionDirectory, { recursive: true, force: true });
await mkdir(assetsDirectory, { recursive: true });

await build({
  entryPoints: [path.join(sourceDirectory, "main.tsx")],
  bundle: true,
  outfile: path.join(assetsDirectory, "app.js"),
  format: "esm",
  jsx: "automatic",
  sourcemap: true,
  target: ["es2022"]
});

await copyFile(path.join(sourceDirectory, "index.html"), path.join(distributionDirectory, "index.html"));
await copyFile(path.join(sourceDirectory, "styles.css"), path.join(assetsDirectory, "styles.css"));
