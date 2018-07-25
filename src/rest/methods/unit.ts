import { InterfaceAllthingsRestClient } from '../types'

export enum EnumUnitType {
  rented = 'rented',
  owned = 'owned',
}

export interface IUnit {
  readonly externalId: string | null
  readonly id: string
  readonly name: string
  readonly stats: {
    readonly tenantCount: number | null
    readonly invitationCount: number | null
  }
  readonly type: EnumUnitType
}

export type PartialUnit = Partial<IUnit>

export type UnitResult = Promise<IUnit>

/*
  Create new unit
*/

export type MethodCreateUnit = (
  groupId: string,
  data: PartialUnit & {
    readonly name: string
    readonly type: EnumUnitType
  },
) => UnitResult

export async function createUnit(
  client: InterfaceAllthingsRestClient,
  groupId: string,
  data: PartialUnit & {
    readonly name: string
    readonly type: EnumUnitType
  },
): UnitResult {
  return client.post(`/v1/groups/${groupId}/units`, data)
}

/*
  Get a unit by it's ID
*/

export type MethodGetUnitById = (id: string) => UnitResult

export async function getUnitById(
  client: InterfaceAllthingsRestClient,
  unitId: string,
): UnitResult {
  return client.get(`/v1/units/${unitId}`)
}

/*
  Update a unit by it's ID
*/

export type MethodUpdateUnitById = (
  unitId: string,
  data: PartialUnit,
) => UnitResult

export async function updateUnitById(
  client: InterfaceAllthingsRestClient,
  unitId: string,
  data: PartialUnit,
): UnitResult {
  return client.patch(`/v1/units/${unitId}`, data)
}
