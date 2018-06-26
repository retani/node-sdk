import { MethodHttpRequest } from './request'

export type GetResult = Promise<any>

export type MethodHttpGet = (
  method: string,
  query?: { readonly [parameter: string]: string },
) => GetResult

export default async function get(
  request: MethodHttpRequest,
  method: string,
  query: { readonly [parameter: string]: string },
): GetResult {
  return request('get', method, { query })
}
