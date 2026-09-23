import fs from 'node:fs'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'

const pdfName = 'Mais Feiras - TAP +Feiras 2025 v.3 - adição ITE ass RV GEN 1.pdf'
const pdfPath = path.join(process.cwd(), pdfName)
const buf = fs.readFileSync(pdfPath)
const parser = new PDFParse({ data: buf })
const result = await parser.getText()
process.stdout.write(result.text)
await parser.destroy()
