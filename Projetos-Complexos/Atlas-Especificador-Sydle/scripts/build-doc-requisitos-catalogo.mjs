#!/usr/bin/env node
/**
 * Wrapper — documentação gerada por scripts/build_doc_requisitos_catalogo.py
 * (linguagem de negócio · backoffice + portais · Discovery 08/07/2026)
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const py = path.join(__dirname, 'build_doc_requisitos_catalogo.py')
const r = spawnSync('python', [py], { stdio: 'inherit', shell: true })
process.exit(r.status ?? 1)
