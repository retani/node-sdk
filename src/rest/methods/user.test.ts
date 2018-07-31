// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { times } from '../../utils/functional'
import { EnumLocale, EnumTimezone } from '../types'
import { EnumUnitType } from './unit'
import { EnumUserPermissionObjectType, EnumUserPermissionRole } from './user'

const client = restClient()

const testData = {
  description: 'Foobar User',
  locale: EnumLocale.en_US,
}

describe('getUsers()', () => {
  it('should be able to get a list of users', async () => {
    const limit = 3

    await Promise.all(
      times(
        () => ({
          ...testData,
          email: generateId() + '@foobar.test',
          externalId: generateId(),
        }),
        limit,
      ).map(data =>
        client.createUser(APP_ID, generateId(), generateId(), data),
      ),
    )

    const result = await client.getUsers()
    expect(result._embedded).toHaveProperty('items')

    const result2 = await client.getUsers(1, limit)
    expect(result2._embedded.items).toHaveLength(limit)
  })
})

describe('getCurrentUser()', () => {
  it('should be able to get the current user (the viewer)', async () => {
    const currentUser = await client.getCurrentUser()

    expect(currentUser.id).toBeDefined()
    expect(currentUser.email).toEqual(process.env.ALLTHINGS_OAUTH_USERNAME)
  })
})

describe('createUser()', () => {
  it('should be able to create a new user', async () => {
    const data = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }
    const result = await client.createUser(
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
    const { id } = await client.createUser(
      APP_ID,
      generateId(),
      generateId(),
      data,
    )
    const result = await client.getUserById(id)

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
    const user = await client.createUser(
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

    const result = await client.updateUserById(user.id, updateData)

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
    const user = await client.createUser(
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

    const result = await client.createUserPermission(user.id, permissionData)

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

    const user = await client.createUser(
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

    await client.createUserPermission(user.id, permissionData)

    const result = await client.getUserPermissions(user.id)

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

    const user = await client.createUser(
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

    const permission = await client.createUserPermission(
      user.id,
      permissionData,
    )

    // permission should exist
    expect(await client.getUserPermissions(user.id)).toHaveLength(1)

    // delete the permission
    expect(await client.deleteUserPermission(permission.id)).toBe(true)

    // permission should no longer exist
    expect(await client.getUserPermissions(user.id)).toHaveLength(0)
  })
})

describe('userGetUtilisationPeriods()', () => {
  let sharedUnitId: string // tslint:disable-line no-let

  beforeAll(async () => {
    const property = await client.createProperty(APP_ID, {
      name: 'Foobar2 Property',
      timezone: EnumTimezone.EuropeBerlin,
    })

    const group = await client.createGroup(property.id, {
      name: 'Foobar2 Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    const unit = await client.createUnit(group.id, {
      name: 'Foobar2 Unit',
      type: EnumUnitType.rented,
    })

    sharedUnitId = unit.id // tslint:disable-line no-expression-statement
  })

  it('should get a list of utlisation periods a user is checked in to', async () => {
    const initialData = {
      endDate: '2450-01-03',
      externalId: generateId(),
      startDate: '2449-01-03',
    }
    const utilisationPeriod = await client.createUtilisationPeriod(
      sharedUnitId,
      initialData,
    )

    const userEmail = generateId() + '@test.com'

    const user = await client.createUser(APP_ID, generateId(), generateId(), {
      email: userEmail,
      locale: EnumLocale.de_DE,
    })

    await client.userCheckInToUtilisationPeriod(user.id, utilisationPeriod.id)

    const [usersUtilisationPeriod] = await client.userGetUtilisationPeriods(
      user.id,
    )

    expect(usersUtilisationPeriod.id).toEqual(utilisationPeriod.id)
  })
})
