import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).filter((x) => x.startsWith("--")).map((x) => {
    const [k, ...v] = x.slice(2).split("=");
    return [k, v.join("=").replace(/^"|"$/g, "")];
  }),
);

if (!args.name) {
  console.error('Usage: npm run new-app -- --name="My App" --slug="my-app" --description="What it does" [--destination="../my-app"]');
  process.exit(1);
}

const root = process.cwd();
const template = path.join(root, "apps", "starter-web");
const slug = args.slug || args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const description = args.description || `${args.name} product.`;
const dataset = `${slug.replace(/-/g, "_")}_events`;
const destination = path.resolve(root, args.destination || path.join("generated", slug));

if (!fs.existsSync(template)) throw new Error(`Starter template missing: ${template}`);
if (fs.existsSync(destination)) throw new Error(`Destination already exists: ${destination}`);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.cpSync(template, destination, { recursive: true });

// Copy the minimum governance/security files needed by a standalone generated app.
const copyFiles = [
  "AGENTS.md", "SECURITY.md", "COSTS.md", "LAUNCH_CHECKLIST.md", "RELEASE_CHECKLIST.md",
  "PRODUCT_SPEC_TEMPLATE.md", "VISION_GOVERNANCE.md", "DISASTER_RECOVERY.md", "ENVIRONMENTS.md",
  "ESSENTIAL_EXTERNAL_TOOLS.md", "GLOBAL_FIRST.md"
];
for (const rel of copyFiles) {
  const src = path.join(root, rel);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(destination, rel));
}
for (const rel of ["design", "integrations", "skills/vision"]) {
  const src = path.join(root, rel);
  const dst = path.join(destination, rel);
  if (fs.existsSync(src)) fs.cpSync(src, dst, { recursive: true });
}
fs.mkdirSync(path.join(destination, "scripts"), { recursive: true });
for (const script of ["security-check.sh"]) {
  const src = path.join(root, "scripts", script);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(destination, "scripts", script));
}

function mutate(rel, fn) {
  const p = path.join(destination, rel);
  const current = fs.readFileSync(p, "utf8");
  fs.writeFileSync(p, fn(current));
}
mutate("product.config.ts", (s) => s
  .replace(/name: "[^"]*"/, `name: ${JSON.stringify(args.name)}`)
  .replace(/slug: "[^"]*"/, `slug: ${JSON.stringify(slug)}`)
  .replace(/description: "[^"]*"/, `description: ${JSON.stringify(description)}`));
mutate("wrangler.jsonc", (s) => s
  .replace(/"name": "[^"]*"/, `"name": ${JSON.stringify(slug)}`)
  .replace(/"APP_NAME": "[^"]*"/, `"APP_NAME": ${JSON.stringify(args.name)}`)
  .replace(/"database_name": "[^"]*"/, `"database_name": ${JSON.stringify(`${slug}-db`)}`)
  .replace(/"bucket_name": "[^"]*"/, `"bucket_name": ${JSON.stringify(`${slug}-files`)}`)
  .replace(/"dataset": "[^"]*"/, `"dataset": ${JSON.stringify(dataset)}`));
mutate("index.html", (s) => s
  .replace(/<title>[^<]*<\/title>/, `<title>${args.name}</title>`)
  .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content=${JSON.stringify(description)} />`)
  .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content=${JSON.stringify(args.name)} />`)
  .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content=${JSON.stringify(description)} />`));

const pkgPath = path.join(destination, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.name = slug;
pkg.scripts.security = "bash scripts/security-check.sh";
pkg.scripts.deploy = "npm run build && wrangler deploy";
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);


// Product exports do not carry factory-only Turborepo instructions or the optional Growth Engine code.
const agentsPath = path.join(destination, "AGENTS.md");
if (fs.existsSync(agentsPath)) {
  let agents = fs.readFileSync(agentsPath, "utf8");
  agents = agents.replace(/## Growth Engine rules[\s\S]*?(?=## Loading-state discipline)/, `## Growth Engine rules\n\nThe Growth Engine is optional and is not included in this standalone export. Add it from the App Factory only when autonomous promotion is a real product/company requirement, then follow its own README and release checklist.\n\n`);
  agents = agents.replace(/\n## Turborepo boundary[\s\S]*$/, "\n");
  agents = agents.replace("This repository is the App Factory. The standalone product template lives in `apps/starter-web/`; exported products place that same runtime at their repository root. Keep both forms simple.", "This repository is a standalone product exported from App Factory. Keep it simple.");
  agents = agents.replace(/`apps\/starter-web\/src\/` in the factory; `src\/` after export/g, "`src/`");
  agents = agents.replace(/`apps\/starter-web\/worker\/` in the factory; `worker\/` after export/g, "`worker/`");
  agents = agents.replace(/In the factory template use `apps\/starter-web\/worker\/services\/email\.ts`; after export use `worker\/services\/email\.ts`;/g, "Use `worker/services/email.ts`;");
  agents = agents.replace(/\(factory: `apps\/starter-web\/product\.config\.ts`; exported app: `product\.config\.ts`\)/g, "(`product.config.ts`)");
  fs.writeFileSync(agentsPath, agents);
}

fs.writeFileSync(path.join(destination, "README_GENERATED.md"), `# ${args.name}\n\nGenerated from App Factory.\n\n${description}\n\nGlobal-first by default. Read GLOBAL_FIRST.md; only add regional positioning when the product spec explicitly requires it.\n\n## First run\n\n1. npm install\n2. npm run check\n3. Create Cloudflare resources and secrets.\n4. npm run db:migrate:local\n5. npm run dev\n6. Follow LAUNCH_CHECKLIST.md before production.\n`);

console.log(`Created standalone app: ${destination}`);
console.log(`Next: cd ${destination} && npm install && npm run check`);
