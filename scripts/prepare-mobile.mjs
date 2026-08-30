// Post-build step for the Capacitor/Android bundle.
//
// 1. Copies the SPA shell to dist/client/index.html so the Android WebView can
//    boot any route (TanStack Router handles routing client-side).
// 2. Downloads every CDN-hosted asset pointer (src/**/*.asset.json) into the
//    bundle at its exact URL path, so images work offline inside the app.
import { readdir, readFile, writeFile, mkdir, copyFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "dist", "client");
const assetHost =
  process.env["MOBILE_ASSET_HOST"] ??
  process.env["LOVABLE_PREVIEW_HOST"] ??
  "id-preview--22606186-e09d-4a8f-b0e9-b33be520f49c.lovable.app";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith(".asset.json")) out.push(full);
  }
  return out;
}

async function main() {
  await stat(outDir).catch(() => {
    throw new Error("dist/client not found — run the mobile build first.");
  });

  await copyFile(join(outDir, "_shell.html"), join(outDir, "index.html"));
  console.log("[mobile] wrote dist/client/index.html");

  for (const file of await walk(join(root, "src"))) {
    const pointer = JSON.parse(await readFile(file, "utf8"));
    if (!pointer.url?.startsWith("/")) continue;
    const target = join(outDir, pointer.url);
    await mkdir(dirname(target), { recursive: true });
    const res = await fetch(`https://${assetHost}${pointer.url}`);
    if (!res.ok) throw new Error(`Failed to download ${pointer.url}: ${res.status}`);
    await writeFile(target, Buffer.from(await res.arrayBuffer()));
    console.log(`[mobile] bundled ${pointer.original_filename} (${pointer.size} bytes)`);
  }
}

await main();
