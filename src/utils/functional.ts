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

// Or: http://ramdajs.com/docs/#splitEvery
export function splitEvery<T>(every: number, list: List<T>): List<List<T>> {
  return times(
    (_: any, count: number) => list.slice(count * every, count * every + every),
    Math.ceil(list.length / every),
  )
}

export function flatten<T>(
  arrayOfArrays: ReadonlyArray<ReadonlyArray<T>>,
): ReadonlyArray<T> {
  return arrayOfArrays.reduce((flatArray, currentArray) => [
    ...flatArray,
    ...currentArray,
  ])
}

// Or: http://ramdajs.com/docs/#until
export async function until<A, B>(
  predicate: (value: B, iteration: number) => boolean | Promise<boolean>,
  transformer: (value: A | B | undefined, iteration: number) => B | Promise<B>,
  initialValue?: A | B,
  iterationCount: number = 0,
): Promise<B> {
  const transformed = await transformer(initialValue, iterationCount)

  return (await predicate(transformed, iterationCount))
    ? transformed
    : until(predicate, transformer, transformed, iterationCount + 1)
}

export async function asyncReduce<I, O>(
  iterable: List<I>,
  reducer: (
    previousValue: O,
    currentValue: I,
    currentIndex: number,
    iterable: List<I>,
  ) => Promise<O>,
  initialValue: O,
): Promise<O> {
  return iterable.reduce(async (accumulatorPromise, value, index, array) => {
    const accumulator = await accumulatorPromise
    return reducer(accumulator, value, index, array)
  }, Promise.resolve(initialValue))
}

export async function asyncMap<ItemIn, ItemOut>(
  iterable: List<ItemIn>,
  mapper: (
    currentItem: ItemIn,
    currentIndex: number,
    iterable: List<ItemIn>,
  ) => Promise<ItemOut>,
): Promise<List<ItemOut>> {
  return asyncReduce(
    iterable,
    async (result, item, index) => [
      ...result,
      await mapper(item, index, iterable),
    ],
    [] as List<ItemOut>,
  )
}

export async function asyncParallelMap<ItemIn, ItemOut>(
  concurrency: number,
  iterable: List<ItemIn>,
  mapper: (
    currentItem: ItemIn,
    currentIndex: number,
    iterable: List<ItemIn>,
  ) => Promise<ItemOut>,
): Promise<List<ItemOut>> {
  const batches = splitEvery(Math.ceil(iterable.length / concurrency), iterable)

  return flatten(
    await Promise.all(batches.map(batch => asyncMap(batch, mapper))),
  )
}

export async function asyncSeries<FinalResult>(
  tasks: List<() => any>,
  callback?: (results: any) => FinalResult | Promise<FinalResult>,
): Promise<ReadonlyArray<any> | FinalResult> {
  const results = await asyncMap(tasks, task => Promise.resolve(task()))

  if (typeof callback === 'function') {
    return callback(results)
  }

  return results
}
