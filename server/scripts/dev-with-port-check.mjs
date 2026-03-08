import net from 'node:net'
import { spawn } from 'node:child_process'

const HOST = '127.0.0.1'
const PORT = 8787

function ensurePortAvailable(host, port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once('error', (error) => {
      if (error && error.code === 'EADDRINUSE') {
        reject(
          new Error(`Port ${port} is already in use. Please free it before running server:dev.`),
        )
        return
      }

      reject(error)
    })

    server.once('listening', () => {
      server.close((closeError) => {
        if (closeError) {
          reject(closeError)
          return
        }

        resolve()
      })
    })

    server.listen(port, host)
  })
}

async function main() {
  try {
    await ensurePortAvailable(HOST, PORT)
  } catch (error) {
    console.error('[server:dev] Failed to start.')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }

  const child = spawn('npx', ['wrangler', 'dev'], {
    stdio: 'inherit',
    shell: true,
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 0)
  })
}

main().catch((error) => {
  console.error('[server:dev] Unexpected failure.')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
