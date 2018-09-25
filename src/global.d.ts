interface IndexSignature {
  readonly [key: string]: any
}

type List<T> = ReadonlyArray<T>

declare module '*.json' {
  const value: any
  export const version: string
  export default value
}
