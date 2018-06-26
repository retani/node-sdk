export default function sleep(miliseconds: number): Promise<boolean> {
  return new Promise(resolve => setTimeout(() => resolve(true), miliseconds))
}
