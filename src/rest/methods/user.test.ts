// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restApi from '..'
import { APP_ID } from '../../../test/constants'
import { EnumLocale } from '../types'
import { EnumUserPermissionObjectType, EnumUserPermissionRole } from './user'

const api = restApi()

const testData = {
  description: 'Foobar User',
  locale: EnumLocale.en_US,
}

describe('createUser()', () => {
  it('should be able to create a new user', async () => {
    const data = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }
    const result = await api.createUser(
      APP_ID,
      generateId(),
      generateId(),
      data,
    )

    expect(result.email).toEqual(data.email)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('getUserById()', () => {
  it('should be able to get a user by their ID', async () => {
    const data = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }
    const { id } = await api.createUser(
      APP_ID,
      generateId(),
      generateId(),
      data,
    )
    const result = await api.getUserById(id)

    expect(result.email).toEqual(data.email)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('updateUserById()', () => {
  it('should be able to update a user by their ID', async () => {
    const initialData = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }
    const user = await api.createUser(
      APP_ID,
      generateId(),
      generateId(),
      initialData,
    )

    expect(user.email).toEqual(initialData.email)
    expect(user.externalId).toEqual(initialData.externalId)

    const updateData = {
      externalId: generateId(),
      locale: EnumLocale.de_DE,
    }

    const result = await api.updateUserById(user.id, updateData)

    expect(result.locale).toEqual(updateData.locale)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})

describe('createUserPermission()', () => {
  it('should be able to add a permission to a user', async () => {
    const initialData = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }
    const user = await api.createUser(
      APP_ID,
      generateId(),
      generateId(),
      initialData,
    )

    expect(user.email).toEqual(initialData.email)
    expect(user.externalId).toEqual(initialData.externalId)

    const permissionData = {
      objectId: APP_ID,
      objectType: EnumUserPermissionObjectType.app,
      restrictions: [],
      role: EnumUserPermissionRole.admin,
    }

    const result = await api.createUserPermission(user.id, permissionData)

    expect(result.role).toEqual(permissionData.role)
    expect(result.objectType).toEqual(permissionData.objectType)
  })
})

describe('getUserPermissions()', () => {
  it('should be able to list permissions of a user', async () => {
    const initialData = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }

    const user = await api.createUser(
      APP_ID,
      generateId(),
      generateId(),
      initialData,
    )

    const permissionData = {
      objectId: APP_ID,
      objectType: EnumUserPermissionObjectType.app,
      restrictions: [],
      role: EnumUserPermissionRole.admin,
    }

    await api.createUserPermission(user.id, permissionData)

    const result = await api.getUserPermissions(user.id)

    expect(result).toHaveLength(1)
    expect(result[0].objectType).toEqual(permissionData.objectType)
  })
})

describe('deleteUserPermission()', () => {
  it('should be able to delete a user permission', async () => {
    const initialData = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }

    const user = await api.createUser(
      APP_ID,
      generateId(),
      generateId(),
      initialData,
    )

    const permissionData = {
      objectId: APP_ID,
      objectType: EnumUserPermissionObjectType.app,
      restrictions: [],
      role: EnumUserPermissionRole.admin,
    }

    const permission = await api.createUserPermission(user.id, permissionData)

    // permission should exist
    expect(await api.getUserPermissions(user.id)).toHaveLength(1)

    // delete the permission
    expect(await api.deleteUserPermission(permission.id)).toBe(true)

    // permission should no longer exist
    expect(await api.getUserPermissions(user.id)).toHaveLength(0)
  })
})
