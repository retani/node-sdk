// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumUnitType } from './unit'

let sharedGroupId: string // tslint:disable-line no-let

const client = restClient()

const testData = {
  name: 'Foobar Unit',
  type: EnumUnitType.rented,
}

describe('createUnit()', () => {
  beforeAll(async () => {
    const property = await client.createProperty(APP_ID, {
      name: 'Foobar Property',
      timezone: 'Europe/Berlin',
    })

    const group = await client.createGroup(property.id, {
      name: 'Foobar Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    sharedGroupId = group.id // tslint:disable-line no-expression-statement
  })

  it('should be able to create a new unit', async () => {
    const data = { ...testData, externalId: generateId() }
    const result = await client.createUnit(sharedGroupId, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('getUnitById()', () => {
  it('should be able to get a unit by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const { id } = await client.createUnit(sharedGroupId, data)
    const result = await client.getUnitById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('updateUnitById()', () => {
  it('should be able to update a unit by ID', async () => {
    const initialData = { ...testData, externalId: generateId() }
    const unit = await client.createUnit(sharedGroupId, initialData)

    expect(unit.name).toEqual(initialData.name)
    expect(unit.externalId).toEqual(initialData.externalId)

    const updateData = {
      externalId: generateId(),
      type: EnumUnitType.owned,
    }

    const result = await client.updateUnitById(unit.id, updateData)

    expect(result.type).toEqual(updateData.type)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})
