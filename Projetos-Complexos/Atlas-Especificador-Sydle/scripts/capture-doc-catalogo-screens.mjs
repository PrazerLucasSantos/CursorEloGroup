#!/usr/bin/env node
/**
 * Captura telas reais dos portais (Parceiro + Cliente) para a documentação.
 * Uso: node scripts/capture-doc-catalogo-screens.mjs
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'exports/doc-catalogo-imgs')
const PORT = 5179

fs.mkdirSync(outDir, { recursive: true })

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url)
      if (r.ok || r.status === 404) return
    } catch {
      /* retry */
    }
    await wait(500)
  }
  throw new Error('Vite não subiu a tempo')
}

async function shot(page, file, fullPage = false) {
  const dest = path.join(outDir, file)
  await page.screenshot({ path: dest, fullPage })
  console.log('OK', file)
}

async function main() {
  const vite = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--port', String(PORT), '--strictPort'],
    { cwd: root, stdio: 'ignore', shell: true },
  )

  try {
    await waitForServer(`http://127.0.0.1:${PORT}/portal-parceiro.html`)
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width: 1360, height: 820 } })

    // Portal Parceiro
    await page.goto(`http://127.0.0.1:${PORT}/portal-parceiro.html`, { waitUntil: 'networkidle' })
    await wait(600)
    await shot(page, 'proto-portal-parceiro-home.png')

    await page.getByRole('button', { name: 'Meus catálogos' }).click()
    await wait(400)
    await shot(page, 'proto-portal-parceiro-lista.png')

    const openBtn = page.getByRole('button', { name: 'Abrir' }).first()
    if (await openBtn.count()) {
      await openBtn.click()
      await wait(500)
      await shot(page, 'proto-portal-parceiro-detalhe.png', true)
    }

    await page.getByRole('button', { name: 'Enviados / ajustes' }).click()
    await wait(400)
    await shot(page, 'proto-portal-parceiro-fila.png')

    // Portal Cliente — catálogo
    await page.goto(`http://127.0.0.1:${PORT}/portal-cliente.html`, { waitUntil: 'networkidle' })
    await wait(800)
    // try open catalogo via menu Serviços
    const servicos = page.getByRole('button', { name: /Serviços/i }).first()
    if (await servicos.count()) {
      await servicos.click()
      await wait(300)
      const cat = page.getByRole('button', { name: /Catálogo MTI/i }).first()
      if (await cat.count()) {
        await cat.click()
        await wait(600)
      }
    }
    // fallback: click nav if visible
    const catDirect = page.locator('text=Catálogo MTI').first()
    if (await catDirect.count()) {
      await catDirect.click().catch(() => {})
      await wait(500)
    }
    await shot(page, 'proto-portal-cliente-catalogo.png', true)

    // Cotação / contratos if reachable
    const cot = page.getByRole('button', { name: /Nova cotação/i }).first()
    if (await cot.count()) {
      await cot.click()
      await wait(500)
      await shot(page, 'proto-portal-cliente-cotacao.png', true)
    }

    await browser.close()
  } finally {
    vite.kill('SIGTERM')
    try {
      vite.kill('SIGKILL')
    } catch {
      /* ignore */
    }
  }

  // Rename PDF embeds to friendly names (copy)
  const map = [
    ['pdf-p80-img0.png', 'proto-backoffice-parceria.png'],
    ['pdf-p81-img0.png', 'proto-backoffice-solucao-1.png'],
    ['pdf-p81-img1.png', 'proto-backoffice-solucao-2.png'],
    ['pdf-p84-img0.png', 'proto-backoffice-catalogo-1.png'],
    ['pdf-p84-img1.png', 'proto-backoffice-catalogo-2.png'],
    ['pdf-p84-img2.png', 'proto-backoffice-catalogo-3.png'],
    ['pdf-p85-img0.png', 'proto-backoffice-catalogo-4.png'],
    ['pdf-p85-img1.png', 'proto-backoffice-catalogo-5.png'],
    ['pdf-p85-img2.png', 'proto-backoffice-catalogo-6.png'],
  ]
  for (const [src, dest] of map) {
    const a = path.join(outDir, src)
    const b = path.join(outDir, dest)
    if (fs.existsSync(a)) fs.copyFileSync(a, b)
  }
  console.log('Friendly names ready in', outDir)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
