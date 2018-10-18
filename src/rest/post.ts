import { MethodHttpRequest } from './request'

export type PostResult = Promise<any>

interface IFromDataType {
  readonly [key: string]: any
}

export type MethodHttpPost = (
  method: string,
  body?:
    | { readonly [key: string]: any }
    | { readonly ['formData']: IFromDataType },
) => PostResult

export default async function post(
  request: MethodHttpRequest,
  method: string,
  body: { readonly [key: string]: any },
): PostResult {
  return request('post', method, { body })
}
