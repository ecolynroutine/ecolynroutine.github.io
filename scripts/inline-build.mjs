import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(projectDir, 'dist')
const indexPath = resolve(distDir, 'index.html')

let html = await readFile(indexPath, 'utf8')

const readDistAsset = async (assetUrl) => {
  const relativePath = assetUrl.replace(/^\.?\//, '')
  return readFile(resolve(distDir, relativePath), 'utf8')
}

const configPattern = /<script\s+src=["']\.\/config\.js["']><\/script>/
if (!configPattern.test(html)) {
  throw new Error('Balise config.js introuvable dans dist/index.html')
}

const config = (await readDistAsset('./config.js')).replace(/<\/script/gi, '<\\/script')
html = html.replace(configPattern, () => `<script>\n${config}\n</script>`)

const stylesheetPattern = /<link\s+rel=["']stylesheet["'][^>]*\shref=["']([^"']+)["'][^>]*>/
const stylesheetMatch = html.match(stylesheetPattern)
if (!stylesheetMatch) {
  throw new Error('Feuille de style introuvable dans dist/index.html')
}

let css = await readDistAsset(stylesheetMatch[1])
css = css.replace(/url\((['"]?)\.\//g, (_match, quote) => `url(${quote}./assets/`)
html = html.replace(stylesheetPattern, () => `<style>\n${css}\n</style>`)

const modulePattern = /<script\s+type=["']module["'][^>]*\ssrc=["']([^"']+)["'][^>]*><\/script>/
const moduleMatch = html.match(modulePattern)
if (!moduleMatch) {
  throw new Error('Bundle JavaScript introuvable dans dist/index.html')
}

const javascript = (await readDistAsset(moduleMatch[1])).replace(/<\/script/gi, '<\\/script')
html = html.replace(modulePattern, '')
html = html.replace('</body>', () => `<script>\n${javascript}\n</script>\n  </body>`)

await writeFile(indexPath, html, 'utf8')
