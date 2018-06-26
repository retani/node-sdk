import { MethodHttpGet } from '../get'
import { MethodHttpPatch } from '../patch'
import { MethodHttpPost } from '../post'

export interface IGroup {
  readonly address: Partial<{
    readonly city: string | null
    readonly country: string | null // @TODO EnumCountryCode?,
    readonly houseNumber: string | null
    readonly latitude: number | null
    readonly longitude: number | null
    readonly postalCode: string | null
    readonly street: string | null
    readonly type: string | null
  }>
  readonly description: string | null
  readonly externalId: string | null
  readonly id: string
  readonly propertyManagerId: string
  readonly name: string
  readonly stats: {
    readonly tenantCount: number | null
    readonly invitationCount: number | null
    readonly occupancy: number | null
    readonly unitCount: number | null
    readonly inhabitedUnits: number | null
  }
}

export type PartialGroup = Partial<IGroup>

export type GroupResult = Promise<IGroup>

/*
  Create new group
  https://api-doc.allthings.me/#!/Groups/post_properties_propertyID_groups
*/

export type MethodCreateGroup = (
  propertyId: string,
  data: PartialGroup & {
    readonly name: string
    readonly propertyManagerId: string
  },
) => GroupResult

export async function createGroup(
  post: MethodHttpPost,
  propertyId: string,
  data: PartialGroup & {
    readonly name: string
    readonly propertyManagerId: string
  },
): GroupResult {
  const { propertyManagerId, ...rest } = data
  return post(`/properties/${propertyId}/groups`, {
    ...rest,
    propertyManagerID: propertyManagerId,
  })
}

/*
  Get a group by it's ID
  https://api-doc.allthings.me/#!/Groups/get_groups_groupID
*/

export type MethodGetGroupById = (id: string) => GroupResult

export async function getGroupById(
  get: MethodHttpGet,
  groupId: string,
): GroupResult {
  const { propertyManagerID: propertyManagerId, ...result } = await get(
    `/groups/${groupId}`,
  )
  return { ...result, propertyManagerId }
}

/*
  Update a group by it's ID
  https://api-doc.allthings.me/#!/Groups/patch_groups_groupID
*/

export type MethodUpdateGroupById = (
  groupId: string,
  data: PartialGroup,
) => GroupResult

export async function updateGroupById(
  patch: MethodHttpPatch,
  groupId: string,
  data: PartialGroup,
): GroupResult {
  return patch(`/groups/${groupId}`, data)
}
