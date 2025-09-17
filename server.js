const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000
const CLIENT_DIR = path.join(__dirname, 'client')

const server = http.createServer((req, res) => {
  let filePath = path.join(CLIENT_DIR, req.url === '/' ? 'index.html' : req.url)

  const ext = path.extname(filePath).toLowerCase()
  
  const contentTypeMap = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
  }

  const contentType = contentTypeMap[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, content) => {
    if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('404 - Not Found')
    } else {
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(content);
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})