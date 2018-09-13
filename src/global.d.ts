interface IndexSignature {
  readonly [key: string]: any
}

type List<T> = ReadonlyArray<T>

// Extend the NodeJS global object.
declare namespace NodeJS {
  export interface Global {
    window: any
  }
}
