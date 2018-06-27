import { MethodHttpDelete } from './delete'
import { MethodHttpGet } from './get'
import {
  MethodCreateAgent,
  MethodCreateAgentPermissions,
} from './methods/agent'
import { MethodCreateApp } from './methods/app'
import {
  MethodCreateGroup,
  MethodGetGroupById,
  MethodUpdateGroupById,
} from './methods/group'
import { MethodCreateIdLookup } from './methods/idLookup'
import {
  MethodCreateProperty,
  MethodGetPropertyById,
  MethodUpdatePropertyById,
} from './methods/property'
import { MethodCreateRegistrationCode } from './methods/registrationCode'
import {
  MethodCreateUnit,
  MethodGetUnitById,
  MethodUpdateUnitById,
} from './methods/unit'
import {
  MethodCreateUser,
  MethodCreateUserPermission,
  MethodDeleteUserPermission,
  MethodGetCurrentUser,
  MethodGetUserById,
  MethodGetUserPermissions,
  MethodGetUsers,
  MethodUpdateUserById,
} from './methods/user'
import {
  MethodCreateUtilisationPeriod,
  MethodGetUtilisationPeriodById,
  MethodUpdateUtilisationPeriodById,
} from './methods/utilisationPeriod'
import { MethodHttpPatch } from './patch'
import { MethodHttpPost } from './post'

// Describes the possible resources which exist in the API
export enum EnumResource {
  property = 'property',
  group = 'group',
  unit = 'unit',
  utilisationPeriod = 'utilisationPeriod',
  user = 'user',
}

export enum EnumLocale {
  de_DE = 'de_DE',
  it_IT = 'it_IT',
  fr_FR = 'fr_FR',
  pt_PT = 'pt_PT',
  en_US = 'en_US',
}

// Describes the options with which to construct a new API wrapper instance
export interface InterfaceAllthingsRestClientOptions {
  readonly accessToken?: string
  readonly clientId?: string
  readonly clientSecret?: string
  readonly concurrency?: number //@TODO
  readonly password?: string
  readonly username?: string
}

// Describes the REST API wrapper's resulting interface
export interface InterfaceAllthingsRestClient {
  readonly delete: MethodHttpDelete
  readonly get: MethodHttpGet
  readonly post: MethodHttpPost
  readonly patch: MethodHttpPatch

  // Agent

  /**
   * Create a new agent. This is a convenience function around
   * creating a user and adding that user to a property-manager's team
   */
  readonly createAgent: MethodCreateAgent

  /**
   * Create agent permissions. This is a convenience function around
   * creating two user permission's: one "admin" and the other "pinboard"
   */
  readonly createAgentPermissions: MethodCreateAgentPermissions

  // App

  /**
   * Create a new App.
   */
  readonly createApp: MethodCreateApp

  // ID Lookup

  /**
   * Map one or more externalId's to API ObjectId's within the scope of a specified App
   */
  readonly createIdLookup: MethodCreateIdLookup

  // Group

  /**
   * Create a new group within a property
   */
  readonly createGroup: MethodCreateGroup

  /**
   * Get a group by it's ID
   */
  readonly getGroupById: MethodGetGroupById

  /**
   * Update a group by it's ID
   */
  readonly updateGroupById: MethodUpdateGroupById

  // Property

  /**
   * Create a new property
   */
  readonly createProperty: MethodCreateProperty

  /**
   * Get a property by it's ID
   */
  readonly getPropertyById: MethodGetPropertyById

  /**
   * Update a property by it's ID
   */
  readonly updatePropertyById: MethodUpdatePropertyById

  // Registration Code

  /**
   * Create a new registration code
   */
  readonly createRegistrationCode: MethodCreateRegistrationCode

  // Unit

  /**
   * Create a unit within a group
   */
  readonly createUnit: MethodCreateUnit

  /**
   * Get a unit by it's ID
   */
  readonly getUnitById: MethodGetUnitById

  /**
   * Update a unit by it's ID
   */
  readonly updateUnitById: MethodUpdateUnitById

  // User

  /**
   * Create a new User.
   */
  readonly createUser: MethodCreateUser

  /**
   * Give a user a permission/role on an given object of specified type
   */
  readonly createUserPermission: MethodCreateUserPermission

  /**
   * Delete a user a permission/role on an given object of specified type
   */
  readonly deleteUserPermission: MethodDeleteUserPermission

  /**
   * Get a list of users
   */
  readonly getUsers: MethodGetUsers

  /**
   * Get the current user from active session
   */
  readonly getCurrentUser: MethodGetCurrentUser

  /**
   * Get a user by their ID
   */
  readonly getUserById: MethodGetUserById

  /**
   * Get a list of user's permissions
   */
  readonly getUserPermissions: MethodGetUserPermissions

  /**
   * Update a user by their ID
   */
  readonly updateUserById: MethodUpdateUserById

  // Utilisation Period

  /**
   * Create a new utilisation period within a Unit
   */
  readonly createUtilisationPeriod: MethodCreateUtilisationPeriod

  /**
   * Get a utilisation period by it's ID
   */
  readonly getUtilisationPeriodById: MethodGetUtilisationPeriodById

  /**
   * Update a utilisation period by it's ID
   */
  readonly updateUtilisationPeriodById: MethodUpdateUtilisationPeriodById
}
