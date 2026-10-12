// Captures the README screenshots from the running app.
// Usage: npm run dev -- --port 4183 --strictPort   (in another terminal)
//        node scripts/capture-screenshots.mjs [baseURL]
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.argv[2] || 'http://127.0.0.1:4183';
const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ executablePath: existsSync(localChrome) ? localChrome : undefined });
const out = 'docs/screenshots';
mkdirSync(out, { recursive: true });

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(base);
await page.waitForTimeout(1200);
for (const [key, name] of [['1', 'inspector'], ['2', 'skin-painter'], ['3', 'importer'], ['4', 'exporters']]) {
  await page.keyboard.press(key);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('saved', name);
}
await browser.close();
