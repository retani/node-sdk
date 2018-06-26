import { MethodHttpRequest } from './request'

export type DeleteResult = Promise<any>

export type MethodHttpDelete = (method: string) => DeleteResult

export default async function del(
  request: MethodHttpRequest,
  method: string,
): DeleteResult {
  return request('delete', method)
}
