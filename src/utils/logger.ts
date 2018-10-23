const SUBSCRIPTIONS =
  (process.env.DEBUG &&
    process.env.DEBUG.split(',').map(item => item.trim())) ||
  []

export type LogType = 'log' | 'info' | 'warn' | 'error'

export interface ILogger {
  // tslint:disable-next-line readonly-array readonly-keyword
  readonly [key: string]: (...logs: any[]) => boolean
}

export default function makeLogger(name: string): ILogger {
  return ['log', 'info', 'warn', 'error'].reduce(
    (logger: object, type: 'log' | 'info' | 'warn' | 'error') => ({
      ...logger,
      [type]: function log(
        ...logs: any[] // tslint:disable-line readonly-array
      ): true {
        if (
          SUBSCRIPTIONS.includes('*') ||
          SUBSCRIPTIONS.includes(name) ||
          SUBSCRIPTIONS.includes(name.toLocaleLowerCase())
        ) {
          // tslint:disable-next-line no-console no-expression-statement
          console[type](`${name}:`, ...logs)
        }

        return true
      },
    }),
    {},
  )
}
