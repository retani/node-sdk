/*
  Small collection of functional-programming-esque utility functions.
  E.g. ES2017+ "Rambda" lite.
*/

export type List<T> = ReadonlyArray<T>

// Or: http://ramdajs.com/docs/#partial
// tslint:disable readonly-array
export const partial = (
  fn: (...args: any[]) => any | Promise<any>,
  ...partialArgs: any[]
) => (...args: any[]) => fn(...partialArgs, ...args)
// tslint:enable

// Or: http://ramdajs.com/docs/#times
export function times<T>(
  fn: (item: number, index: number) => T,
  n: number,
): List<T> {
  return [...new Array(n)].map(fn)
}

// Or: http://ramdajs.com/docs/#until
export async function until<A, B>(
  predicate: (value: B, iteration: number) => boolean | Promise<boolean>,
  transformer: (value: A | B | undefined, iteration: number) => B | Promise<B>,
  initialValue?: A | B,
  iterationCount = 0,
): Promise<B> {
  const transformed = await transformer(initialValue, iterationCount)

  return (await predicate(transformed, iterationCount))
    ? transformed
    : until(predicate, transformer, transformed, iterationCount + 1)
}

/**
 * Abstracts the expression-statement involved with the clearInterval()
 * call so that it can be used elsewhere more "functionally"
 */
export function fnClearInterval(intervalId: NodeJS.Timeout): true {
  // tslint:disable-next-line no-expression-statement
  clearInterval(intervalId)

  return true
}
