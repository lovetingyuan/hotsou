const os = require('os')

const networkInterfaces = os.networkInterfaces()
const addresses = []

for (const name of Object.keys(networkInterfaces)) {
  for (const iface of networkInterfaces[name] || []) {
    if (iface.family === 'IPv4' && !iface.internal) {
      addresses.push(iface.address)
    }
  }
}

console.log('\n========================================')
console.log('Server accessible at:')
addresses.forEach((addr) => {
  console.log(`  http://${addr}:8787`)
})
console.log('  http://localhost:8787')
console.log('========================================\n')
