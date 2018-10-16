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
  data: {
    readonly channels: ReadonlyArray<string>
    readonly name: string
  },
) => BucketResult

export async function bucketCreate(
  client: InterfaceAllthingsRestClient,
  data: {
    readonly channels: ReadonlyArray<string>
    readonly name: string
  },
): BucketResult {
  return client.post('/v1/buckets', {
    channels: data.channels,
    name: data.name,
  })
}

export type MethodBucketAddFile = (
  bucketId: string,
  fileId: string,
) => Promise<string>
export async function bucketAddFile(
  client: InterfaceAllthingsRestClient,
  bucketId: string,
  fileId: string,
): Promise<string> {
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
  data: { readonly path: string },
) => Promise<string>
export async function bucketDeleteFilesInPath(
  client: InterfaceAllthingsRestClient,
  bucketId: string,
  data: { readonly path: string },
): BucketResult {
  return client.delete(`/v1/buckets/${bucketId}/files`, {
    folder: data.path,
  })
}
