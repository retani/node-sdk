import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { partial } from '../utils/functional'
import httpDelete from './delete'
import httpGet from './get'
import { createAgent, createAgentPermissions } from './methods/agent'
import { createApp } from './methods/app'
import { createGroup, getGroupById, updateGroupById } from './methods/group'
import { createIdLookup } from './methods/idLookup'
import {
  createProperty,
  getPropertyById,
  updatePropertyById,
} from './methods/property'
import { createRegistrationCode } from './methods/registrationCode'
import {
  createUnit,
  EnumUnitType,
  getUnitById,
  updateUnitById,
} from './methods/unit'
import {
  createUser,
  createUserPermission,
  deleteUserPermission,
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  getCurrentUser,
  getUserById,
  getUserPermissions,
  getUsers,
  updateUserById,
  userGetUtilisationPeriod,
} from './methods/user'
import {
  createUtilisationPeriod,
  getUtilisationPeriodById,
  updateUtilisationPeriodById,
  utilisationPeriodCheckInUser,
} from './methods/utilisationPeriod'
import httpPatch from './patch'
import httpPost from './post'
import httpRequest from './request'
import {
  InterfaceAllthingsRestClient,
  InterfaceAllthingsRestClientOptions,
} from './types'

const API_METHODS: ReadonlyArray<any> = [
  // Agent
  createAgent,
  createAgentPermissions,

  // App
  createApp,

  // ID Lookup
  createIdLookup,

  // Group
  createGroup,
  getGroupById,
  updateGroupById,

  // Property
  createProperty,
  getPropertyById,
  updatePropertyById,

  // Registration Code
  createRegistrationCode,

  // Unit
  createUnit,
  getUnitById,
  updateUnitById,

  // User
  createUser,
  createUserPermission,
  deleteUserPermission,
  getCurrentUser,
  getUserById,
  getUserPermissions,
  getUsers,
  updateUserById,
  userGetUtilisationPeriod,

  // Utilisation Periods
  utilisationPeriodCheckInUser,
  createUtilisationPeriod,
  getUtilisationPeriodById,
  updateUtilisationPeriodById,
]

export { EnumUnitType, EnumUserPermissionObjectType, EnumUserPermissionRole }

/*
  The API wrapper
  Creates a new token via an OAuth Password Grant, then
  partially applies the api url, access token, get/post methods to
  api method function wrappers.
*/
export default function restClient(
  userOptions: Partial<
    InterfaceAllthingsRestClientOptions
  > = DEFAULT_API_WRAPPER_OPTIONS,
): InterfaceAllthingsRestClient {
  const options: InterfaceAllthingsRestClientOptions = {
    ...DEFAULT_API_WRAPPER_OPTIONS,
    ...userOptions,
  }

  if (typeof options.apiUrl === 'undefined') {
    throw new Error('API URL is undefined.')
  }

  if (typeof options.oauthUrl === 'undefined') {
    throw new Error('OAuth2 URL is undefined.')
  }

  if (!options.clientId && !options.accessToken) {
    throw new Error('Missing required "clientId" or "accessToken" parameter .')
  }

  const request = partial(httpRequest, options)

  // partially apply the request method to the get/post
  // http request method functions
  const del = partial(httpDelete, request)
  const get = partial(httpGet, request)
  const post = partial(httpPost, request)
  const patch = partial(httpPatch, request)

  const client: InterfaceAllthingsRestClient = API_METHODS.reduce(
    (methods, method) => ({
      ...methods,
      // tslint:disable-next-line readonly-array
      [method.name]: (...args: any[]) => method(client, ...args),
    }),
    { delete: del, get, options, patch, post },
  )

  return client
}
