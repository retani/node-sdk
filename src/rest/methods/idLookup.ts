import { MethodHttpPost } from '../post'
import { EnumResource } from '../types'

export type CreateIdLookupResult = Promise<{
  readonly [externalId: string]: string | null
}>

export type MethodCreateIdLookup = (
  appId: string,
  resource: EnumResource,
  ids: string | ReadonlyArray<string>,
) => CreateIdLookupResult

// https://api-doc.allthings.me/#!/Id45Lookup/post_id_lookup_appID_resource
export async function createIdLookup(
  post: MethodHttpPost,
  appId: string,
  resource: EnumResource,
  ids: string | ReadonlyArray<string>,
): CreateIdLookupResult {
  return post(`/v1/id-lookup/${appId}/${resource}`, {
    externalIds: typeof ids === 'string' ? [ids] : ids,
  })
}
