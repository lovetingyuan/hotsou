const os = require('os')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function getBestIP() {
  const interfaces = os.networkInterfaces()
  const candidates = []

  for (const name of Object.keys(interfaces)) {
    // 过滤掉虚拟网卡名 (针对 Windows 和 Linux/macOS)
    const isVirtual = /virtual|vbox|veth|docker|wsl|lo|utun|bridge/i.test(name)

    for (const iface of interfaces[name]) {
      if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
        candidates.push({
          address: iface.address,
          isVirtual: isVirtual,
          name: name,
        })
      }
    }
  }

  // 排序逻辑：
  // 1. 非虚拟网卡优先
  // 2. 以 192.168 开头的通常是物理局域网，优先级最高
  candidates.sort((a, b) => {
    if (a.isVirtual !== b.isVirtual) {
      return a.isVirtual ? 1 : -1
    }
    if (a.address.startsWith('192.168')) {
      return -1
    }
    if (b.address.startsWith('192.168')) {
      return 1
    }
    return 0
  })

  return candidates.length > 0 ? candidates[0].address : '127.0.0.1'
}

// 1. Set EXPO_PUBLIC_IPV4 in .env.local
const ip = getBestIP()
// eslint-disable-next-line no-undef
const envLocalPath = path.resolve(__dirname, '../.env.local')

let content = ''
if (fs.existsSync(envLocalPath)) {
  content = fs.readFileSync(envLocalPath, 'utf8')
}

const lines = content.split('\n')
const newLines = lines.filter(line => line.trim() !== '' && !line.startsWith('EXPO_PUBLIC_IPV4='))
newLines.push(`EXPO_PUBLIC_IPV4=${ip}`)

fs.writeFileSync(envLocalPath, newLines.join('\n').trim() + '\n')

// 2. Run adb devices -l
try {
  execSync('adb devices -l', { stdio: 'inherit' })
} catch (error) {
  // Silent fail or minimal warning
}
