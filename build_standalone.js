import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const assetsDir = path.join(distDir, 'assets')

// Find the latest css and js in dist/assets
const files = fs.readdirSync(assetsDir)
const cssFile = files.find(f => f.endsWith('.css'))
const jsFile = files.find(f => f.endsWith('.js'))

if (!cssFile || !jsFile) {
  console.error('Could not find CSS or JS bundle in dist/assets')
  process.exit(1)
}

const css = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8')
const js = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8')

let faviconDataUri = 'favicon.svg'
try {
  const svg = fs.readFileSync(path.resolve('public/favicon.svg'), 'utf8')
  faviconDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
} catch (e) {
  console.warn('Could not read favicon:', e.message)
}

const standaloneHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TaskFlow — Smart Task Manager | Syntecxhub Internship</title>
    <meta name="description" content="A modern, responsive Task Management dashboard with local persistence, analytics, filtering, and priority tracking. Built with React for Syntecxhub Internship." />
    <meta name="theme-color" content="#4f46e5" />
    <link rel="icon" type="image/svg+xml" href="${faviconDataUri}" />
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet" />
    <style>
/* TaskFlow Pre-compiled Production Stylesheet */
${css}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
/* TaskFlow Standalone Production Application Bundle */
${js}
    </script>
  </body>
</html>
`

fs.writeFileSync('standalone.html', standaloneHtml, 'utf8')
console.log(`Successfully generated standalone.html (${(standaloneHtml.length / 1024).toFixed(1)} KB)`)

