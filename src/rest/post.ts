import { MethodHttpRequest } from './request'

export type PostResult = Promise<any>

export type MethodHttpPost = (
  method: string,
  body?: { readonly [key: string]: any },
  headers?: { readonly [key: string]: string },
) => PostResult

export default async function post(
  request: MethodHttpRequest,
  method: string,
  body: { readonly [key: string]: any },
  headers: { readonly [key: string]: string },
): PostResult {
  return request('post', method, { body, headers })
}
