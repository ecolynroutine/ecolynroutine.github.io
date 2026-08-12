import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = resolve(projectDir, 'dist', 'config.js')
let source = await readFile(configPath, 'utf8')
const localEnv = loadEnv('production', projectDir, 'VITE_')

const value = (key) => process.env[key] || localEnv[key] || ''

const replacements = {
  __VITE_SUPABASE_URL__: value('VITE_SUPABASE_URL'),
  __VITE_SUPABASE_ANON_KEY__: value('VITE_SUPABASE_ANON_KEY'),
  __VITE_LEAD_ENDPOINT__: value('VITE_LEAD_ENDPOINT'),
  __VITE_SITE_URL__: value('VITE_SITE_URL'),
}

for (const [token, value] of Object.entries(replacements)) {
  source = source.replaceAll(`"${token}"`, JSON.stringify(value))
}

await writeFile(configPath, source, 'utf8')

const siteConfig = JSON.parse(await readFile(resolve(projectDir, 'site-config.json'), 'utf8'))
await writeFile(
  resolve(projectDir, 'dist', 'site-config.js'),
  `window.ECOLYN_SITE_CONFIG=${JSON.stringify(siteConfig)};\n`,
  'utf8',
)

const hostingDir = resolve(projectDir, 'dist', '.openai')
await mkdir(hostingDir, { recursive: true })
await copyFile(resolve(projectDir, '.openai', 'hosting.json'), resolve(hostingDir, 'hosting.json'))
