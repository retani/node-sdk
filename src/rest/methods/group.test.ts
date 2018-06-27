// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restApi from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'

const api = restApi()

const testPropertyData = {
  name: 'Foobar Group Property',
  timezone: 'Europe/Berlin',
}

const testData = {
  name: 'Foobar Group',
  propertyManagerId: APP_PROPERTY_MANAGER_ID,
}

describe('createGroup()', () => {
  it('should be able to create a new group', async () => {
    const property = await api.createProperty(APP_ID, testPropertyData)

    const data = { ...testData, externalId: generateId() }
    const result = await api.createGroup(property.id, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('getGroupById()', () => {
  it('should be able to get a group by ID', async () => {
    const property = await api.createProperty(APP_ID, testPropertyData)

    const data = { ...testData, externalId: generateId() }
    const { id } = await api.createGroup(property.id, data)
    const result = await api.getGroupById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('updateGroupById()', () => {
  it('should be able to update a group by ID', async () => {
    const property = await api.createProperty(APP_ID, testPropertyData)

    const initialData = { ...testData, externalId: generateId() }

    const group = await api.createGroup(property.id, initialData)

    expect(group.name).toEqual(initialData.name)
    expect(group.externalId).toEqual(initialData.externalId)

    const updateData = {
      description: 'Bio Vegan Gluten Free Group',
      externalId: generateId(),
    }

    const result = await api.updateGroupById(group.id, updateData)

    expect(result.description).toEqual(updateData.description)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})
