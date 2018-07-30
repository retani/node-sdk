import { InterfaceAllthingsRestClient } from '../types'

export interface IUtilisationPeriod {
  readonly _embedded: {
    readonly invitations: ReadonlyArray<any>
    readonly [key: string]: any
  }
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
export type UtilisationPeriodResults = Promise<
  ReadonlyArray<IUtilisationPeriod>
>

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
  client: InterfaceAllthingsRestClient,
  unitId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
  },
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, ...result } = await client.post(
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
  client: InterfaceAllthingsRestClient,
  utilisationPeriodId: string,
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, ...result } = await client.get(
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
  client: InterfaceAllthingsRestClient,
  utilisationPeriodId: string,
  data: PartialUtilisationPeriod & {
    readonly startDate: string
  },
): UtilisationPeriodResult {
  const { tenantIDs: tenantIds, ...result } = await client.patch(
    `/v1/utilisation-periods/${utilisationPeriodId}`,
    data,
  )
  return { ...result, tenantIds }
}

export type MethodUtilisationPeriodCheckInUser = (
  utilisationPeriodId: string,
  data: { readonly email: string },
) => UtilisationPeriodResult

export async function utilisationPeriodCheckInUser(
  client: InterfaceAllthingsRestClient,
  utilisationPeriodId: string,
  data: {
    readonly email: string
  },
): UtilisationPeriodResult {
  return (
    (await client.post(`/v1/utilisation-periods/${utilisationPeriodId}/users`, {
      email: data.email,
    })) && client.getUtilisationPeriodById(utilisationPeriodId)
  )
}
