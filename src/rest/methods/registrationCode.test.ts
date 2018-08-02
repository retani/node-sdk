// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { APP_PROPERTY_MANAGER_ID, USER_ID } from '../../../test/constants'
import { EnumTimezone } from '../types'
import { EnumUnitType } from './unit'

let sharedUtilisationPeriodIds: ReadonlyArray<string> // tslint:disable-line no-let

const client = restClient()

describe('createRegistrationCode()', async () => {
  beforeAll(async () => {
    const name = `Registration Code ${generateId()}`
    const app = await client.createApp(USER_ID, { name, siteUrl: generateId() })

    const property = await client.createProperty(app.id, {
      name,
      timezone: EnumTimezone.EuropeBerlin,
    })

    const group = await client.createGroup(property.id, {
      name,
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    const unit = await client.createUnit(group.id, {
      name,
      type: EnumUnitType.rented,
    })

    sharedUtilisationPeriodIds = (await Promise.all([
      client.createUtilisationPeriod(unit.id, {
        endDate: '2018-01-02',
        startDate: '2018-01-01',
      }),
      client.createUtilisationPeriod(unit.id, {
        endDate: '2018-02-02',
        startDate: '2018-02-01',
      }),
      client.createUtilisationPeriod(unit.id, {
        endDate: '2018-03-02',
        startDate: '2018-03-01',
      }),
    ])).map(item => item.id)
  })

  it('should be able to create a new registration code', async () => {
    const code = generateId()
    const testExternalId = generateId()

    const result = await client.createRegistrationCode(
      code,
      sharedUtilisationPeriodIds,
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
    expect(result.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )
    expect(result.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[1],
    )
    expect(result.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[2],
    )

    const singleUtilisationPeriod = await client.createRegistrationCode(
      generateId(),
      sharedUtilisationPeriodIds[0],
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    expect(singleUtilisationPeriod.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )

    // test for default options parameter
    const emptyOptions = await client.createRegistrationCode(
      generateId(),
      sharedUtilisationPeriodIds[0],
      undefined,
    )

    expect(emptyOptions.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )
  })
})

describe('registrationCodeFindById()', async () => {
  it('should be able to find a registration code by id', async () => {
    const testExternalId = generateId()

    const createdRegistrationCode = await client.createRegistrationCode(
      generateId(),
      sharedUtilisationPeriodIds,
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    const foundRegistrationCode = await client.registrationCodeFindById(
      createdRegistrationCode.id,
    )

    expect(createdRegistrationCode.id).toBeTruthy()
    expect(foundRegistrationCode.id).toEqual(createdRegistrationCode.id)

    expect(foundRegistrationCode.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[0],
    )
    expect(foundRegistrationCode.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[1],
    )
    expect(foundRegistrationCode.utilisationPeriods).toContainEqual(
      sharedUtilisationPeriodIds[2],
    )
  })
})

describe('registrationCodeDelete()', async () => {
  it('should be able to find a registration code by id', async () => {
    const testExternalId = generateId()

    const createdRegistrationCode = await client.createRegistrationCode(
      generateId(),
      sharedUtilisationPeriodIds,
      {
        expiresAt: null,
        externalId: testExternalId,
        permanent: false,
      },
    )

    const foundRegistrationCode = await client.registrationCodeFindById(
      createdRegistrationCode.id,
    )

    expect(createdRegistrationCode.id).toBeTruthy()
    expect(foundRegistrationCode.id).toEqual(createdRegistrationCode.id)

    await client.registrationCodeDelete(createdRegistrationCode.id)

    /* const wasRegCodeDeleted = await client.registrationCodeFindById(
      createdRegistrationCode.id,
    )
    this will be neede but it doesnt return anything, so what to expect?
    console.log(wasRegCodeDeleted)*/
  })
})
