const { exit } = require('process')

class Logger {
  newlineNeeded = false
  successNeeded = false

  start(msg) {
    if (this.newlineNeeded) {
      process.stdout.write('\n')
    }
    this.newlineNeeded = true
    process.stdout.write(`ℹ ${msg}... `)
  }

  success(msg) {
    this.newlineNeeded = false
    if (msg) {
      process.stdout.write(`✅ ${msg}\n`)
    } else {
      process.stdout.write('✅ done\n')
    }
  }

  error(msg) {
    if (this.newlineNeeded) {
      this.newlineNeeded = false
      process.stdout.write('\n')
    }

    console.log(`🚫 Error`)
    if (msg) {
      console.log(msg)
    }
    exit(1)
  }

  async run(msg, fn) {
    var result = null

    this.start(msg)
    try {
      result = await fn()

      if (this.newlineNeeded) {
        this.success()
      }
    } catch (e) {
      this.error(e)
    }
    return result
  }
}

module.exports = Logger
