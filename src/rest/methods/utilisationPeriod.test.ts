// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumUnitType } from './unit'

let sharedUnitId: string // tslint:disable-line no-let

const client = restClient()

describe('createUtilisationPeriod()', () => {
  beforeAll(async () => {
    const property = await client.createProperty(APP_ID, {
      name: 'Foobar Property',
      timezone: 'Europe/Berlin',
    })

    const group = await client.createGroup(property.id, {
      name: 'Foobar Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    const unit = await client.createUnit(group.id, {
      name: 'Foobar Unit',
      type: EnumUnitType.rented,
    })

    sharedUnitId = unit.id // tslint:disable-line no-expression-statement
  })

  it('should be able to create a new utilisation period', async () => {
    const data = {
      endDate: '2050-01-01',
      externalId: generateId(),
      startDate: '2050-01-01',
    }
    const result = await client.createUtilisationPeriod(sharedUnitId, data)

    expect(result.startDate).toEqual(data.startDate)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('getUtilisationPeriodById()', () => {
  it('should be able to get a utilisation period by ID', async () => {
    const data = {
      endDate: '2050-01-02',
      externalId: generateId(),
      startDate: '2050-01-02',
    }
    const { id } = await client.createUtilisationPeriod(sharedUnitId, data)
    const result = await client.getUtilisationPeriodById(id)

    expect(result.startDate).toEqual(data.startDate)
    expect(result.externalId).toEqual(data.externalId)
  })
})

describe('updateUtilisationPeriodById()', () => {
  it('should be able to update a utilisation period by ID', async () => {
    const initialData = {
      endDate: '2050-01-03',
      externalId: generateId(),
      startDate: '2050-01-03',
    }
    const utilisationPeriod = await client.createUtilisationPeriod(
      sharedUnitId,
      initialData,
    )

    expect(utilisationPeriod.endDate).toEqual(initialData.endDate)
    expect(utilisationPeriod.externalId).toEqual(initialData.externalId)

    const updateData = {
      endDate: '2100-01-01',
      externalId: generateId(),
      startDate: '2100-01-02',
    }

    const result = await client.updateUtilisationPeriodById(
      utilisationPeriod.id,
      updateData,
    )

    expect(result.startDate).toEqual(updateData.startDate)
    expect(result.endDate).toEqual(updateData.endDate)
    expect(result.externalId).toEqual(updateData.externalId)
  })
})
