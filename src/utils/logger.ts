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
    (logger, type: 'log' | 'info' | 'warn' | 'error') => ({
      ...logger,
      [type]: function log(
        ...logs: any[] // tslint:disable-line readonly-array
      ): boolean {
        if (
          SUBSCRIPTIONS.includes('*') ||
          SUBSCRIPTIONS.includes(name) ||
          SUBSCRIPTIONS.includes(name.toLocaleLowerCase())
        ) {
          return !!console[type](`${name}:`, ...logs)
        }

        return true
      },
    }),
    {},
  )
}
