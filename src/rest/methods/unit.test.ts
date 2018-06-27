// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restApi from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumUnitType } from './unit'

let sharedGroupId: string // tslint:disable-line no-let

const api = restApi()

const testData = {
  name: 'Foobar Unit',
  type: EnumUnitType.rented,
}

describe('createUnit()', () => {
  beforeAll(async () => {
    const property = await api.createProperty(APP_ID, {
      name: 'Foobar Property',
      timezone: 'Europe/Berlin',
    })

    const group = await api.createGroup(property.id, {
      name: 'Foobar Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    sharedGroupId = group.id // tslint:disable-line no-expression-statement
  })

  it('should be able to create a new unit', async () => {
    const data = { ...testData, externalId: generateId() }
    const result = await api.createUnit(sharedGroupId, data)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('getUnitById()', () => {
  it('should be able to get a unit by ID', async () => {
    const data = { ...testData, externalId: generateId() }
    const { id } = await api.createUnit(sharedGroupId, data)
    const result = await api.getUnitById(id)

    expect(result.name).toEqual(data.name)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('updateUnitById()', () => {
  it('should be able to update a unit by ID', async () => {
    const initialData = { ...testData, externalId: generateId() }
    const unit = await api.createUnit(sharedGroupId, initialData)

    expect(unit.name).toEqual(initialData.name)
    expect(unit.externalId).toEqual(initialData.externalId)

    const updateData = {
      externalId: generateId(),
      type: EnumUnitType.owned,
    }

    const result = await api.updateUnitById(unit.id, updateData)

    expect(result.type).toEqual(updateData.type)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})
