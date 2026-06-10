/**
 * ทดสอบว่า Node.js + Passenger บน Plesk ทำงานได้หรือไม่
 * ตั้ง Startup file เป็น ping.cjs ชั่วคราว → Restart → เปิดเว็บ
 * ถ้าเห็น "Node.js on Plesk works" = host ใช้ได้ ปัญหาอยู่ที่ Nuxt
 */
const http = require('node:http')

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end(`Node.js on Plesk works!\nNode ${process.version}\ncwd: ${process.cwd()}\nPORT: ${process.env.PORT || '(not set)'}`)
})

const port = Number(process.env.PORT) || 3000
server.listen(port, () => {
  console.log(`[ping] listening on port ${port}`)
})
