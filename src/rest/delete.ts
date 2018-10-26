import { MethodHttpRequest } from './request'

export type DeleteResult = Promise<any>

export type MethodHttpDelete = (
  method: string,
  body?: { readonly [key: string]: any },
) => DeleteResult

export default async function del(
  request: MethodHttpRequest,
  method: string,
  body: { readonly [key: string]: any },
): DeleteResult {
  return request('delete', method, { body })
}
