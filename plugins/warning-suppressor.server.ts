// Server-side plugin to suppress common development warnings

export default defineNuxtPlugin(() => {
  if (process.dev) {
    // Store original console methods
    const originalMethods = {
      warn: console.warn,
      info: console.info,
      log: console.log,
      error: console.error
    }

    // Comprehensive suppression patterns
    const suppressPatterns = [
      'Overriding Html component',
      'manifest-route-rule',
      'already exists',
      'You can specify a priority option',
      'middleware already exists',
      'You can set override: true to replace it',
      'WARN  Overriding',
      'repeated',
      'times',
      '\\[\\d{2}:\\d{2}:\\d{2}\\]', // Timestamp patterns
      'WARN  \'manifest-route-rule\' middleware already exists',
      'Html component\\. You can specify a priority option'
    ]

    const shouldSuppress = (message: string): boolean => {
      return suppressPatterns.some(pattern => {
        try {
          return message.includes(pattern) || new RegExp(pattern).test(message)
        } catch {
          return message.includes(pattern)
        }
      })
    }

    // Override all console methods
    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      if (!shouldSuppress(message)) {
        originalMethods.warn.apply(console, args)
      }
    }

    console.info = (...args: any[]) => {
      const message = args.join(' ')
      if (!shouldSuppress(message)) {
        originalMethods.info.apply(console, args)
      }
    }

    console.log = (...args: any[]) => {
      const message = args.join(' ')
      if (!shouldSuppress(message)) {
        originalMethods.log.apply(console, args)
      }
    }

    console.error = (...args: any[]) => {
      const message = args.join(' ')
      if (!shouldSuppress(message)) {
        originalMethods.error.apply(console, args)
      }
    }

    // Intercept process stdout/stderr for build warnings
    if (process.stdout && process.stdout.write) {
      const originalStdoutWrite = process.stdout.write.bind(process.stdout)
      process.stdout.write = (chunk: any) => {
        const message = chunk.toString()
        if (!shouldSuppress(message)) {
          return originalStdoutWrite(chunk)
        }
        return true
      }
    }

    if (process.stderr && process.stderr.write) {
      const originalStderrWrite = process.stderr.write.bind(process.stderr)
      process.stderr.write = (chunk: any) => {
        const message = chunk.toString()
        if (!shouldSuppress(message)) {
          return originalStderrWrite(chunk)
        }
        return true
      }
    }
  }
})