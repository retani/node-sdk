import { generate as generateId } from 'shortid'
import { EnumLocale, InterfaceAllthingsRestClient } from '../types'
import {
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  EnumUserType,
  IUserPermission,
  PartialUser,
  UserResult,
} from './user'

export type AgentPermissionsResult = Promise<ReadonlyArray<IUserPermission>>

/*
  Create new agent
*/

export type MethodCreateAgent = (
  appId: string,
  propertyManagerId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
) => UserResult

export async function createAgent(
  client: InterfaceAllthingsRestClient,
  appId: string,
  propertyManagerId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
): UserResult {
  const user = await client.createUser(appId, username, generateId(), {
    ...data,
    type: EnumUserType.customer,
  })
  const manager = await client.post(
    `/v1/property-managers/${propertyManagerId}/users`,
    {
      userID: user.id,
    },
  )

  // trigger sending of invitation emails to agents, then return data
  return (
    !(await client.post(`/v1/users/${user.id}/invitations`)) && {
      ...user,
      ...manager,
    }
  )
}

/*
  Create agent permissions.
  This is a convenience wrapper around createUserPermission.
*/
/**
 * Returns a datastore-specific object of redis clients.
 */
export type MethodCreateAgentPermissions = (
  agentId: string,
  objectId: string,
  objectType: EnumUserPermissionObjectType,
) => AgentPermissionsResult

/**
 * Returns a datastore-specific object of redis clients.
 */
export async function createAgentPermissions(
  client: InterfaceAllthingsRestClient,
  agentId: string,
  objectId: string,
  objectType: EnumUserPermissionObjectType,
): AgentPermissionsResult {
  return Promise.all([
    client.createUserPermission(agentId, {
      objectId,
      objectType,
      restrictions: [],
      role: EnumUserPermissionRole.admin,
    }),
    client.createUserPermission(agentId, {
      objectId,
      objectType,
      restrictions: [],
      role: EnumUserPermissionRole.pinboard,
    }),
  ])
}
