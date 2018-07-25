import { EnumLocale, InterfaceAllthingsRestClient } from '../types'

export enum EnumGender {
  female = 'female',
  male = 'male',
}

export enum EnumUserType {
  allthingsUser = 'allthings_user',
  allthingsContent = 'allthings_content',
  customer = 'customer',
  demoContent = 'demo_content',
  demoPublic = 'demo_public',
  partner = 'partner',
}

export interface IUser {
  readonly createdAt: string
  readonly deletionRequestedAt: string | null
  readonly description: string
  readonly email: string
  readonly emailValidated: boolean
  readonly externalId: string | null
  readonly gender: EnumGender
  readonly id: string
  readonly lastLogin: string | null
  readonly locale: EnumLocale
  readonly passwordChanged: boolean
  readonly phoneNumber: string | null
  readonly profileImage: string | null
  readonly properties: ReadonlyArray<string> | null
  readonly publicProfile: boolean
  readonly receiveAdminNotifications: boolean
  readonly roles: ReadonlyArray<string>
  readonly tenantIds: ReadonlyArray<string>
  readonly type: EnumUserType | null
  readonly username: string
}

export type PartialUser = Partial<IUser>

export type UserResult = Promise<IUser>
export type UserResultList = Promise<{
  readonly _embedded: { readonly items: ReadonlyArray<IUser> }
  readonly total: number
}>

export enum EnumUserPermissionRole {
  admin = 'admin',
  pinboard = 'community-article-admin',
}

export enum EnumUserPermissionObjectType {
  app = 'App',
  group = 'Group',
  property = 'Property',
  unit = 'Unit',
}

export interface IUserPermission {
  readonly id: string
  readonly label: string
  readonly restricted: boolean
  readonly restrictions: ReadonlyArray<object>
  readonly role: string
  readonly objectId: string
  readonly objectType: EnumUserPermissionObjectType
}

export type PartialUserPermission = Partial<IUserPermission>

export type UserPermissionResult = Promise<IUserPermission>

/*
  Create new user
*/

export type MethodCreateUser = (
  appId: string,
  username: string,
  plainPassword: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
) => UserResult

export async function createUser(
  client: InterfaceAllthingsRestClient,
  appId: string,
  username: string,
  plainPassword: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
): UserResult {
  return client.post(`/v1/users`, {
    ...data,
    creationContext: appId,
    plainPassword,
    username,
  })
}

/*
  Get a list of users
*/

export type MethodGetUsers = (page?: number, limit?: number) => UserResultList

export async function getUsers(
  client: InterfaceAllthingsRestClient,
  page: number = 1,
  limit: number = -1,
): UserResultList {
  return client.get(`/v1/users?page=${page}&limit=${limit}`)
}

/*
  Get the current user from active session
*/

export type MethodGetCurrentUser = () => UserResult

export async function getCurrentUser(
  client: InterfaceAllthingsRestClient,
): UserResult {
  return client.get(`/v1/me`)
}

/*
  Get a user by their ID
*/

export type MethodGetUserById = (id: string) => UserResult

export async function getUserById(
  client: InterfaceAllthingsRestClient,
  userId: string,
): UserResult {
  return client.get(`/v1/users/${userId}`)
}

/*
  Update a user by their ID
*/

export type MethodUpdateUserById = (
  userId: string,
  data: PartialUser,
) => UserResult

export async function updateUserById(
  client: InterfaceAllthingsRestClient,
  userId: string,
  data: PartialUser,
): UserResult {
  return client.patch(`/v1/users/${userId}`, data)
}

/*
  Create a new permission for a user
*/

export type MethodCreateUserPermission = (
  userId: string,
  permission: PartialUserPermission & {
    readonly objectId: string
    readonly objectType: EnumUserPermissionObjectType
    readonly restrictions: ReadonlyArray<object>
    readonly role: EnumUserPermissionRole
  },
) => UserPermissionResult

export async function createUserPermission(
  client: InterfaceAllthingsRestClient,
  userId: string,
  data: PartialUserPermission & {
    readonly objectId: string
    readonly objectType: EnumUserPermissionObjectType
    readonly restrictions: ReadonlyArray<object>
    readonly role: EnumUserPermissionRole
  },
): UserPermissionResult {
  const { objectId: objectID, ...rest } = data
  const { objectID: resultObjectId, ...result } = await client.post(
    `/v1/users/${userId}/permissions`,
    { ...rest, objectID },
  )
  return {
    ...result,
    objectId: resultObjectId,
  }
}

/*
  Get a list of a user's permissions
*/

export type MethodGetUserPermissions = (
  userId: string,
) => Promise<ReadonlyArray<IUserPermission>>

export async function getUserPermissions(
  client: InterfaceAllthingsRestClient,
  userId: string,
): Promise<ReadonlyArray<IUserPermission>> {
  const {
    _embedded: { items: permissions },
  } = await client.get(`/v1/users/${userId}/permissions?limit=-1`)

  return permissions.map(({ objectID: objectId, ...result }: any) => ({
    ...result,
    objectId,
  }))
}

/*
  Delete a user permission by Id
*/

export type MethodDeleteUserPermission = (
  permissionId: string,
) => Promise<boolean>

export async function deleteUserPermission(
  client: InterfaceAllthingsRestClient,
  permissionId: string,
): Promise<boolean> {
  return !(await client.delete(`/v1/permissions/${permissionId}`))
}
