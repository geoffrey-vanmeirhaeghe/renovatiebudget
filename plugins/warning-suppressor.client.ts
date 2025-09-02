// Plugin to suppress common development warnings that don't affect functionality

export default defineNuxtPlugin(() => {
  if (process.dev) {
    // Override all console methods to intercept warnings
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
      '\\[11:', // Timestamp patterns
      'WARN  \'manifest-route-rule\' middleware already exists'
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

    // Override console methods
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

    // Keep error logging intact but filter known harmless ones
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      if (!shouldSuppress(message)) {
        originalMethods.error.apply(console, args)
      }
    }

    // Also intercept process stderr for build-time warnings
    if (typeof process !== 'undefined' && process.stderr && process.stderr.write) {
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