// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { APP_PROPERTY_MANAGER_ID, USER_ID } from '../../../test/constants'
import { EnumUnitType } from './unit'

const client = restClient()

describe('registrationCodeCreate()', async () => {
  it('should be able to create a new registration code', async () => {
    const name = `Registration Code ${generateId()}`
    const code = generateId()
    const testExternalId = generateId()

    const app = await client.appCreate(USER_ID, { name, siteUrl: generateId() })
    const property = await client.propertyCreate(app.id, {
      name,
      timezone: 'Europe/Berlin',
    })
    const group = await client.groupCreate(property.id, {
      name,
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })
    const unit = await client.unitCreate(group.id, {
      name,
      type: EnumUnitType.owned,
    })
    const utilisationPeriods = (await Promise.all([
      client.utilisationPeriodCreate(unit.id, {
        endDate: '2018-01-02',
        startDate: '2018-01-01',
      }),
      client.utilisationPeriodCreate(unit.id, {
        endDate: '2018-02-02',
        startDate: '2018-02-01',
      }),
      client.utilisationPeriodCreate(unit.id, {
        endDate: '2018-03-02',
        startDate: '2018-03-01',
      }),
    ])).map(item => item.id)

    const result = await client.registrationCodeCreate(
      code,
      utilisationPeriods,
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    expect(result.id).toBeTruthy()
    expect(result.code).toEqual(code)
    expect(result.expiresAt).toEqual(null)
    expect(result.permanent).toBe(false)
    expect(result.externalId).toEqual(testExternalId)
    expect(result.utilisationPeriods).toContainEqual(utilisationPeriods[0])
    expect(result.utilisationPeriods).toContainEqual(utilisationPeriods[1])
    expect(result.utilisationPeriods).toContainEqual(utilisationPeriods[2])

    const singleUtilisationPeriod = await client.registrationCodeCreate(
      generateId(),
      utilisationPeriods[0],
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    expect(singleUtilisationPeriod.utilisationPeriods).toContainEqual(
      utilisationPeriods[0],
    )

    // test for default options parameter
    const emptyOptions = await client.registrationCodeCreate(
      generateId(),
      utilisationPeriods[0],
      undefined,
    )

    expect(emptyOptions.utilisationPeriods).toContainEqual(
      utilisationPeriods[0],
    )
  })
})
