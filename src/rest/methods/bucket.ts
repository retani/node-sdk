import { InterfaceAllthingsRestClient } from '../types'

export type BucketResult = Promise<IBucket>

export interface IBucket {
  readonly id: string
  readonly channels: ReadonlyArray<string>
  readonly files: ReadonlyArray<string>
  readonly name: string
}

export type MethodBucketGet = (bucketId: string) => BucketResult

export async function bucketGet(
  client: InterfaceAllthingsRestClient,
  bucketId: string,
): BucketResult {
  return client.get(`/v1/buckets/${bucketId}`)
}

export type MethodBucketCreate = (
  channels: ReadonlyArray<string>,
  name: string,
) => BucketResult
export async function bucketCreate(
  client: InterfaceAllthingsRestClient,
  channels: ReadonlyArray<string>,
  name: string,
): BucketResult {
  return client.post('/v1/buckets', {
    channels,
    name,
  })
}

export type MethodBucketAddFile = (bucketId: string, fileId: string) => string
export async function bucketAddFile(
  client: InterfaceAllthingsRestClient,
  bucketId: string,
  fileId: string,
): BucketResult {
  return client.post(`/v1/buckets/${bucketId}/files`, {
    id: fileId,
  })
}

export type MethodBucketDeleteFile = (
  bucketId: string,
  fileId: string,
) => Promise<string>
export async function bucketDeleteFile(
  client: InterfaceAllthingsRestClient,
  bucketId: string,
  fileId: string,
): BucketResult {
  return client.delete(`/v1/buckets/${bucketId}/files/${fileId}`)
}

export type MethodBucketDeleteFilesInPath = (
  bucketId: string,
  path: string,
) => Promise<string>
export async function bucketDeleteFilesInPath(
  client: InterfaceAllthingsRestClient,
  bucketId: string,
  path: string,
): BucketResult {
  return client.delete(`/v1/buckets/${bucketId}/files`, {
    folder: path,
  })
}
