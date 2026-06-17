const { spawn } = require('node:child_process')

const isWindows = process.platform === 'win32'

const processes = []
let shuttingDown = false

function buildCommand(args) {
  if (!isWindows) {
    return {
      command: 'npm',
      args,
    }
  }

  return {
    command: 'cmd.exe',
    args: [
      '/d',
      '/s',
      '/c',
      ['npm', ...args].join(' '),
    ],
  }
}

function start(name, args) {
  const command = buildCommand(args)
  const child = spawn(command.command, command.args, {
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
