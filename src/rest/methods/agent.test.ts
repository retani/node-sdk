// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumLocale, EnumTimezone } from '../types'
import {
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  EnumUserType,
} from './user'

const client = restClient()

const testData = {
  description: 'Foobar User',
  locale: EnumLocale.en_US,
}

describe('agentCreate()', () => {
  it('should be able to create a new agent', async () => {
    const data = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }

    const agent = await client.agentCreate(
      APP_ID,
      APP_PROPERTY_MANAGER_ID,
      generateId(),
      data,
    )

    const result = await client.userGetById(agent.id)

    expect(result.email).toEqual(data.email)
    expect(result.externalId).toEqual(data.externalId)
    expect(result.roles).toEqual([])
    expect(result.type).toEqual(EnumUserType.customer)

    const {
      _embedded: { items: managerAgents },
    } = await client.get(
      `/v1/property-managers/${APP_PROPERTY_MANAGER_ID}/users?limit=-1`,
    )

    const ourManagerAgent = managerAgents.find(
      (item: any) => item.id === agent.id,
    )

    expect(ourManagerAgent).toBeTruthy()
    expect(ourManagerAgent.email).toEqual(agent.email)
    expect(ourManagerAgent.externalId).toEqual(agent.externalId)
    expect(ourManagerAgent.roles).toEqual(agent.roles)
    expect(ourManagerAgent.type).toEqual(agent.type)
  })
})

describe('agentCreatePermissions()', () => {
  it('should be able to add agent permissions', async () => {
    const data = {
      ...testData,
      email: generateId() + '@foobar.test',
      externalId: generateId(),
    }

    const agent = await client.agentCreate(
      APP_ID,
      APP_PROPERTY_MANAGER_ID,
      generateId(),
      data,
    )

    const [
      appAdminPermission,
      appPinboardPermission,
    ] = await client.agentCreatePermissions(
      agent.id,
      APP_ID,
      EnumUserPermissionObjectType.app,
      [EnumUserPermissionRole.admin, EnumUserPermissionRole.pinboardAdmin],
    )

    // appAdminPermission
    expect(appAdminPermission.objectId).toEqual(APP_ID)
    expect(appAdminPermission.objectType).toEqual(
      EnumUserPermissionObjectType.app,
    )
    expect(appAdminPermission.role).toEqual(EnumUserPermissionRole.admin)

    // appPinboardPermission
    expect(appPinboardPermission.objectId).toEqual(APP_ID)
    expect(appPinboardPermission.objectType).toEqual(
      EnumUserPermissionObjectType.app,
    )
    expect(appPinboardPermission.role).toEqual(
      EnumUserPermissionRole.pinboardAdmin,
    )

    const property = await client.propertyCreate(APP_ID, {
      name: generateId(),
      timezone: EnumTimezone.EuropeBerlin,
    })

    const [
      propertyAdminPermission,
      propertyPinboardPermission,
    ] = await client.agentCreatePermissions(
      agent.id,
      property.id,
      EnumUserPermissionObjectType.property,
      [EnumUserPermissionRole.admin, EnumUserPermissionRole.pinboardAdmin],
    )

    // propertyAdminPermission
    expect(propertyAdminPermission.objectId).toEqual(property.id)
    expect(propertyAdminPermission.objectType).toEqual(
      EnumUserPermissionObjectType.property,
    )
    expect(propertyAdminPermission.role).toEqual(EnumUserPermissionRole.admin)

    // propertyPinboardPermission
    expect(propertyPinboardPermission.objectId).toEqual(property.id)
    expect(propertyPinboardPermission.objectType).toEqual(
      EnumUserPermissionObjectType.property,
    )
    expect(propertyPinboardPermission.role).toEqual(
      EnumUserPermissionRole.pinboardAdmin,
    )
  })
})
