// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restApi from '../'
import { APP_PROPERTY_MANAGER_ID, USER_ID } from '../../../test/constants'
import { EnumUnitType } from './unit'

const api = restApi()

describe('createRegistrationCode()', async () => {
  it('should be able to create a new registration code', async () => {
    const name = `Registration Code ${generateId()}`
    const code = generateId()
    const testExternalId = generateId()

    const app = await api.createApp(USER_ID, { name, siteUrl: generateId() })
    const property = await api.createProperty(app.id, {
      name,
      timezone: 'Europe/Berlin',
    })
    const group = await api.createGroup(property.id, {
      name,
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })
    const unit = await api.createUnit(group.id, {
      name,
      type: EnumUnitType.owned,
    })
    const utilisationPeriods = (await Promise.all([
      api.createUtilisationPeriod(unit.id, {
        endDate: '2018-01-02',
        startDate: '2018-01-01',
      }),
      api.createUtilisationPeriod(unit.id, {
        endDate: '2018-02-02',
        startDate: '2018-02-01',
      }),
      api.createUtilisationPeriod(unit.id, {
        endDate: '2018-03-02',
        startDate: '2018-03-01',
      }),
    ])).map(item => item.id)

    const result = await api.createRegistrationCode(code, utilisationPeriods, {
      expiresAt: null,
      externalId: testExternalId,
      permanent: false,
    })

    expect(result.id).toBeTruthy()
    expect(result.code).toEqual(code)
    expect(result.expiresAt).toEqual(null)
    expect(result.permanent).toBe(false)
    expect(result.externalId).toEqual(testExternalId)
    expect(result.utilisationPeriods).toContainEqual(utilisationPeriods[0])
    expect(result.utilisationPeriods).toContainEqual(utilisationPeriods[1])
    expect(result.utilisationPeriods).toContainEqual(utilisationPeriods[2])

    const singleUtilisationPeriod = await api.createRegistrationCode(
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
    const emptyOptions = await api.createRegistrationCode(
      generateId(),
      utilisationPeriods[0],
      undefined,
    )

    expect(emptyOptions.utilisationPeriods).toContainEqual(
      utilisationPeriods[0],
    )
  })
})
