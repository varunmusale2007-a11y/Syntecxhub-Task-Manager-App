/**
 * TaskFlow Zero-NPM Local Web Server
 * ----------------------------------
 * Runs TaskFlow without using npm, vite, or any external package dependencies.
 * Uses only standard Node.js built-in modules ('http', 'fs', 'path', 'url').
 *
 * Usage:
 *   node server.js
 *   or double-click 'start.bat'
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

// Determine root directory to serve
// If standalone.html exists, serve root directory; fallback to dist if preferred
const ROOT_DIR = __dirname

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
}

const server = http.createServer((req, res) => {
  // Normalize URL
  const reqUrl = new URL(req.url, `http://${req.headers.host}`)
  let pathname = decodeURIComponent(reqUrl.pathname)

  // Default routes
  if (pathname === '/' || pathname === '') {
    // Prefer standalone.html or index.html
    pathname = fs.existsSync(path.join(ROOT_DIR, 'standalone.html'))
      ? '/standalone.html'
      : '/index.html'
  }

  // Prevent directory traversal
  const safePath = path.normalize(path.join(ROOT_DIR, pathname))
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('403 Forbidden')
    return
  }

  // Check if file exists
  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: check dist directory if path starts with /dist or assets
      const distFallback = path.join(ROOT_DIR, 'dist', pathname)
      if (fs.existsSync(distFallback) && fs.statSync(distFallback).isFile()) {
        serveFile(distFallback, res)
        return
      }

      // Single Page Application fallback: serve standalone.html or dist/index.html
      const fallbackFile = fs.existsSync(path.join(ROOT_DIR, 'standalone.html'))
        ? path.join(ROOT_DIR, 'standalone.html')
        : path.join(ROOT_DIR, 'dist', 'index.html')

      if (fs.existsSync(fallbackFile)) {
        serveFile(fallbackFile, res)
        return
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end(`404 Not Found: ${pathname}`)
      return
    }

    serveFile(safePath, res)
  })
})

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('500 Internal Server Error')
      return
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    })
    res.end(content)
  })
}

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`
  console.log('\n======================================================')
  console.log('   TaskFlow — Smart Task Manager (Zero-NPM Server)   ')
  console.log('======================================================')
  console.log(`\n✓ Server running successfully at: ${url}`)
  console.log('✓ Press Ctrl+C anytime to stop\n')

  // Automatically open browser on Windows
  if (process.platform === 'win32') {
    exec(`start ${url}`)
  } else if (process.platform === 'darwin') {
    exec(`open ${url}`)
  } else {
    exec(`xdg-open ${url}`)
  }
})

