import { readFileSync, writeFileSync } from 'fs'

const path = 'exports/requisitos-atlas-fase2-final.md'
let content = readFileSync(path, 'utf8')
content = content.replace(
  /^(classe (?:1[3-9]|[23][0-9]|3[0-3]): Portal[^\n]*\n)necessidade:[^\n]*\n/gm,
  '$1',
)
writeFileSync(path, content)
console.log('Removed necessidade from portal table classes')
