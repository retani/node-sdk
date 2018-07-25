import { MethodHttpGet } from '../get'
import { MethodHttpPatch } from '../patch'
import { MethodHttpPost } from '../post'
import { InterfaceAllthingsRestClient } from '../types'

export interface IUtilisationPeriod {
  readonly _embedded: { readonly invitations: ReadonlyArray<any> }
  readonly endDate: string | null
  readonly externalId: string | null
  readonly id: string
  readonly name: string
  readonly startDate: string
  readonly stats: {
    readonly tenantCount: number | null
    readonly invitationCount: number | null
  }
  readonly tenantIds: ReadonlyArray<string>
  readonly userCount: number | null
}

export type PartialUtilisationPeriod = Partial<IUtilisationPeriod>

export type UtilisationPeriodResult = Promise<IUtilisationPeriod>

/*
  Create new Utilisation Period
*/

export type MethodCreateUtilisationPeriod = (
  unitId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
  },
) => UtilisationPeriodResult

export async function createUtilisationPeriod(
  post: MethodHttpPost,
  unitId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
  },
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, ...result } = await post(
    `/v1/units/${unitId}/utilisation-periods`,
    data,
  )
  return { ...result, tenantIds }
}

/*
  Get a Utilisation Period by its ID
*/

export type MethodGetUtilisationPeriodById = (
  id: string,
) => UtilisationPeriodResult

export async function getUtilisationPeriodById(
  get: MethodHttpGet,
  utilisationPeriodId: string,
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, ...result } = await get(
    `/v1/utilisation-periods/${utilisationPeriodId}`,
  )
  return { ...result, tenantIds }
}

/*
  Update a unit by its ID
*/

export type MethodUpdateUtilisationPeriodById = (
  unitId: string,
  data: PartialUtilisationPeriod,
) => UtilisationPeriodResult

export async function updateUtilisationPeriodById(
  patch: MethodHttpPatch,
  utilisationPeriodId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
  },
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, ...result } = await patch(
    `/v1/utilisation-periods/${utilisationPeriodId}`,
    data,
  )
  return { ...result, tenantIds }
}

export async function createNewTenantCheckIn(
  client: InterfaceAllthingsRestClient,
  utilisationPeriodId: string,
  data: PartialUtilisationPeriod & {
    readonly email: string
  },
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, ...result } = await client.post(
    `/v1/utilisation-periods/${utilisationPeriodId}/users`,
    data,
  )
  return { ...result, tenantIds }
}
