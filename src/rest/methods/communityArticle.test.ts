// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation
import generateId from 'nanoid'
import restClient, { EnumUserPermissionObjectType } from '..'
import { APP_ID, APP_PROPERTY_MANAGER_ID } from '../../../test/constants'
import { EnumLocale, EnumTimezone } from '../types'
import { getDateOrNullField } from './communityArticle'
import { EnumUnitType } from './unit'
import { EnumUserPermissionRole } from './user'

const client = restClient()

let sharedUserId: string // tslint:disable-line no-let
const testData = {
  category: 'events',
  channels: ['foobar'],
  content:
    'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
  title: 'Hello world!',
}

beforeAll(async () => {
  const property = await client.propertyCreate(APP_ID, {
    name: 'Community Article Test Property',
    timezone: EnumTimezone.EuropeBerlin,
  })

  const user = await client.userCreate(APP_ID, generateId(), generateId(), {
    email: generateId() + '@foobar.test',
    locale: EnumLocale.en_US,
  })

  sharedUserId = user.id
  testData.channels = ['Property-' + property.id]
})

describe('communityArticlesGet()', () => {
  it('should be able to list all community articles the user is allowed to see', async () => {
    const property = await client.propertyCreate(APP_ID, {
      name: 'CommunityArticlesGet Test Property',
      timezone: EnumTimezone.EuropeBerlin,
    })
    const group = await client.groupCreate(property.id, {
      name: 'CommunityArticlesGet Test Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })
    const unit = await client.unitCreate(group.id, {
      name: 'CommunityArticlesGet Test Unit',
      type: EnumUnitType.rented,
    })
    const utilisationPeriod = await client.utilisationPeriodCreate(unit.id, {
      endDate: '2050-01-03',
      externalId: generateId(),
      startDate: '2015-01-03',
    })
    const password = generateId()
    const email = generateId() + '@foobar.test'
    const user = await client.userCreate(APP_ID, generateId(), password, {
      email,
      locale: EnumLocale.en_US,
    })
    await client.userCheckInToUtilisationPeriod(user.id, utilisationPeriod.id)
    const clientNewUser = restClient({ username: email, password })

    const initialResults = await clientNewUser.communityArticlesGet()

    const articleData = {
      category: 'welcome-message',
      channels: ['App-' + APP_ID],
      content:
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      title: 'Hello world!',
    }

    await clientNewUser.communityArticleCreate(user.id, articleData)
    const resultWithOneNewArticle = await clientNewUser.communityArticlesGet()
    expect(resultWithOneNewArticle.total).toEqual(initialResults.total + 1)
  })
})

describe('communityArticleCreate()', () => {
  it('should be able to create a new community article', async () => {
    const result = await client.communityArticleCreate(sharedUserId, testData)

    expect(result.id).toBeTruthy()
    expect(result.title).toEqual(testData.title)
    expect(result.likeCount).toEqual(0)
    expect(result._embedded.user.id).toEqual(sharedUserId)
  })
})

describe('communityArticleGetById()', () => {
  it('should be able to get a community article by ID', async () => {
    const { id } = await client.communityArticleCreate(sharedUserId, testData)

    const result = await client.communityArticleGetById(id)
    expect(result.id).toEqual(id)
    expect(result.title).toEqual(testData.title)
    expect(result.likeCount).toEqual(0)
    expect(result._embedded.user.id).toEqual(sharedUserId)
  })
})

describe('communityArticleDelete()', () => {
  it('should be able to delete a community article by its ID', async () => {
    const { id } = await client.communityArticleCreate(sharedUserId, testData)

    const resultBeforeDeletion = await client.communityArticleGetById(id)
    expect(resultBeforeDeletion.id).toEqual(id)

    expect(await client.communityArticleDelete(id)).toEqual(true)
    await expect(client.communityArticleGetById(id)).rejects.toThrow(
      '404 Not Found',
    )
  })
})

describe('communityArticleUpdate()', () => {
  it('should be able to update a community article by its ID', async () => {
    const resultBeforeUpdate = await client.communityArticleCreate(
      sharedUserId,
      testData,
    )
    expect(resultBeforeUpdate.title).toEqual(testData.title)

    const data = { title: 'An updated title' }
    const resultAfterUpdate = await client.communityArticleUpdate(
      resultBeforeUpdate.id,
      data,
    )
    expect(resultAfterUpdate.title).toEqual(data.title)
  })
})

describe('communityArticleStatsGetByUser()', () => {
  it('should return community article stats by a user ID', async () => {
    const property = await client.propertyCreate(APP_ID, {
      name: 'CommunityArticleStatsGetByUser Test Property',
      timezone: EnumTimezone.EuropeBerlin,
    })
    const group = await client.groupCreate(property.id, {
      name: 'CommunityArticleStatsGetByUser Test Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })
    const unit = await client.unitCreate(group.id, {
      name: 'CommunityArticleStatsGetByUser Test Unit',
      type: EnumUnitType.rented,
    })
    const utilisationPeriod = await client.utilisationPeriodCreate(unit.id, {
      endDate: '2050-01-03',
      externalId: generateId(),
      startDate: '2015-01-03',
    })
    const password = generateId()
    const email = generateId() + '@foobar.test'
    const user = await client.userCreate(APP_ID, generateId(), password, {
      email,
      locale: EnumLocale.en_US,
    })
    await client.userCheckInToUtilisationPeriod(user.id, utilisationPeriod.id)
    const permissionData = {
      objectId: unit.id,
      objectType: EnumUserPermissionObjectType.unit,
      restrictions: [],
      role: EnumUserPermissionRole.pinboardAdmin,
    }
    await client.userCreatePermission(user.id, permissionData)
    const clientNewUser = restClient({ username: email, password })

    const result = await clientNewUser.communityArticleStatsGetByUser(user.id)

    expect(typeof result.total === 'number').toEqual(true)
    expect(typeof result.scheduled === 'number').toEqual(true)
    expect(typeof result.createdByUser === 'number').toEqual(true)
  })
})

describe('communityArticleCreateLike()', () => {
  it('should create a new like in a community article', async () => {
    const communityArticle = await client.communityArticleCreate(
      sharedUserId,
      testData,
    )

    expect(
      await client.communityArticleCreateLike(communityArticle.id),
    ).toEqual(true)
    await expect(
      client.communityArticleCreateLike(communityArticle.id),
    ).rejects.toThrow('409 Conflict')
  })
})

describe('communityArticleDeleteLike()', () => {
  it('should delete a like in a community article', async () => {
    const communityArticle = await client.communityArticleCreate(
      sharedUserId,
      testData,
    )

    await client.communityArticleCreateLike(communityArticle.id)

    expect(
      await client.communityArticleDeleteLike(communityArticle.id),
    ).toEqual(true)
    await expect(
      client.communityArticleDeleteLike(communityArticle.id),
    ).rejects.toThrow('409 Conflict')
  })
})

describe('communityArticleGetLikes()', () => {
  it('should get all likes for a community article', async () => {
    const communityArticle = await client.communityArticleCreate(
      sharedUserId,
      testData,
    )

    const resultWithNoLikes = await client.communityArticleGetLikes(
      communityArticle.id,
    )
    expect(resultWithNoLikes.total).toEqual(0)

    await client.communityArticleCreateLike(communityArticle.id)

    const resultWithOneLike = await client.communityArticleGetLikes(
      communityArticle.id,
    )
    expect(resultWithOneLike.total).toEqual(1)
    expect(resultWithOneLike._embedded.items[0].id).toBeTruthy()
  })
})

describe('getDateOrNullField()', () => {
  it('should return a Date object when given a string, and null otherwise', async () => {
    const dateString = '2015-03-25T12:00:00Z'
    expect(getDateOrNullField(dateString) instanceof Date).toEqual(true)

    expect(getDateOrNullField(null)).toEqual(null)
    expect(getDateOrNullField(undefined)).toEqual(null)
  })
})
