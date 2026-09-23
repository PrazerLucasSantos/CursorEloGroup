#!/usr/bin/env node
import fs from 'node:fs'

const t = fs.readFileSync(process.argv[2], 'utf8')
const contents = [...t.matchAll(/>([^<]{2,300})</g)]
  .map((m) => m[1].replace(/\s+/g, ' ').trim())
  .filter((x) => x && !x.startsWith('http') && x !== 'SQUARE' && x !== 'true')
const uniq = [...new Set(contents)]
console.log('unique', uniq.length)
uniq.forEach((c) => console.log(c))
