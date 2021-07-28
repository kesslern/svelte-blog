class Logger {
  newlineNeeded = false
  successNeeded = false

  stdout(msg: string) {
    Deno.stdout.writeSync(new TextEncoder().encode(msg))
  }

  start(msg: string) {
    if (this.newlineNeeded) {
      this.stdout('\n')
    }
    this.newlineNeeded = true
    this.stdout(`ℹ ${msg}... `)
  }

  success<T>(msg?: string, ret?: T): T | undefined {
    this.newlineNeeded = false
    if (msg) {
      this.stdout(`✅ ${msg}\n`)
    } else {
      this.stdout('✅ done\n')
    }
    return ret
  }

  error(msg: string) {
    if (this.newlineNeeded) {
      this.newlineNeeded = false
      this.stdout('\n')
    }

    console.log(`🚫 Error`)
    if (msg) {
      console.log(msg)
    }
  }

  async run<T>(msg: string, fn: () => Promise<T>): Promise<T> {

    this.start(msg)
    try {
      const result = await fn()
      if (this.newlineNeeded) {
        this.success()
      }
      return result
    } catch (e) {
      this.error(e)
      Deno.exit(1)
    }
  }
}

export default new Logger()
