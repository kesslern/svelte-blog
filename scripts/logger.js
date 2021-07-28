class Logger {
  newlineNeeded = false
  successNeeded = false

  stdout(msg) {
    Deno.stdout.writeSync(new TextEncoder().encode(msg))
  }

  start(msg) {
    if (this.newlineNeeded) {
      this.stdout('\n')
    }
    this.newlineNeeded = true
    this.stdout(`ℹ ${msg}... `)
  }

  success(msg, ret) {
    this.newlineNeeded = false
    if (msg) {
      this.stdout(`✅ ${msg}\n`)
    } else {
      this.stdout('✅ done\n')
    }
    return ret
  }

  error(msg) {
    if (this.newlineNeeded) {
      this.newlineNeeded = false
      this.stdout('\n')
    }

    console.log(`🚫 Error`)
    if (msg) {
      console.log(msg)
    }
    Deno.exit(1)
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

export default new Logger()
