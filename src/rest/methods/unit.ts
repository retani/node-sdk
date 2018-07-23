import { MethodHttpGet } from '../get'
import { MethodHttpPatch } from '../patch'
import { MethodHttpPost } from '../post'

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
  post: MethodHttpPost,
  groupId: string,
  data: PartialUnit & {
    readonly name: string
    readonly type: EnumUnitType
  },
): UnitResult {
  return post(`/v1/groups/${groupId}/units`, data)
}

/*
  Get a unit by it's ID
*/

export type MethodGetUnitById = (id: string) => UnitResult

export async function getUnitById(
  get: MethodHttpGet,
  unitId: string,
): UnitResult {
  return get(`/v1/units/${unitId}`)
}

/*
  Update a unit by it's ID
*/

export type MethodUpdateUnitById = (
  unitId: string,
  data: PartialUnit,
) => UnitResult

export async function updateUnitById(
  patch: MethodHttpPatch,
  unitId: string,
  data: PartialUnit,
): UnitResult {
  return patch(`/v1/units/${unitId}`, data)
}
