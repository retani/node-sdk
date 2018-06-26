import { MethodHttpGet } from '../get'
import { MethodHttpPatch } from '../patch'
import { MethodHttpPost } from '../post'

export interface IProperty {
  readonly externalId: string
  readonly id: string
  readonly label: string
  readonly name: string
  readonly timezone: string
}

export type PartialProperty = Partial<IProperty>

export type PropertyResult = Promise<IProperty>

/*
  Create new property
  https://api-doc.allthings.me/#!/Property/post_apps_appID_properties
*/

export type MethodCreateProperty = (
  appId: string,
  data: PartialProperty & { readonly name: string; readonly timezone: string },
) => PropertyResult

export async function createProperty(
  post: MethodHttpPost,
  appId: string,
  data: PartialProperty & { readonly name: string; readonly timezone: string },
): PropertyResult {
  return post(`/apps/${appId}/properties`, data)
}

/*
  Get a property by it's ID
  https://api-doc.allthings.me/#!/Property/get_properties_propertyID
*/

export type MethodGetPropertyById = (propertyId: string) => PropertyResult

export async function getPropertyById(
  get: MethodHttpGet,
  propertyId: string,
): PropertyResult {
  return get(`/properties/${propertyId}`)
}

/*
  Update a property by it's ID
  https://api-doc.allthings.me/#!/Property/patch_properties_propertyID
*/

export type MethodUpdatePropertyById = (
  propertyId: string,
  data: PartialProperty,
) => PropertyResult

export async function updatePropertyById(
  patch: MethodHttpPatch,
  propertyId: string,
  data: PartialProperty,
): PropertyResult {
  return patch(`/properties/${propertyId}`, data)
}
