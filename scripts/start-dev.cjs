const { spawn } = require('node:child_process')

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'

const processes = []
let shuttingDown = false

function start(name, args) {
  const child = spawn(npmCommand, args, {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  })

  processes.push(child)

  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      shuttingDown = true
      stopAll(child)
      process.exitCode = code ?? (signal ? 1 : 0)
    }
  })

  child.on('error', (error) => {
    console.error(`[${name}] ${error.message}`)
    if (!shuttingDown) {
      shuttingDown = true
      stopAll(child)
      process.exitCode = 1
    }
  })
}

function stopAll(except) {
  processes.forEach((child) => {
    if (child === except || child.killed) {
      return
    }

    child.kill()
  })
}

process.on('SIGINT', () => {
  shuttingDown = true
  stopAll()
  process.exit()
})

process.on('SIGTERM', () => {
  shuttingDown = true
  stopAll()
  process.exit()
})

start('vite', ['run', 'dev'])
start('electron', ['run', 'electron'])
