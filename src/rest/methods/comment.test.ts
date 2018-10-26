// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation
import restClient from '..'
import { APP_ID, USER_ID } from '../../../test/constants'
import { EnumTimezone } from '../types'

const client = restClient()

const communityArticleData = {
  category: 'events',
  channels: ['foobar'],
  content:
    'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
  title: 'Hello world!',
}
const testData = {
  content: 'Hello world!',
}

beforeAll(async () => {
  const property = await client.propertyCreate(APP_ID, {
    name: 'Community Article Test Property',
    timezone: EnumTimezone.EuropeBerlin,
  })
  communityArticleData.channels = ['Property-' + property.id]
})

describe('communityArticleCreateComment()', () => {
  it('should be able to create a comment in a community article', async () => {
    const { id } = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )
    const result = await client.communityArticleCreateComment(id, testData)

    expect(result.id).toBeTruthy()
    expect(result.content).toEqual(testData.content)
  })
})

describe('communityArticleGetComments()', () => {
  it('should be able to list all comments in a community article', async () => {
    const { id } = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )

    const resultWithoutComments = await client.communityArticleGetComments(id)
    expect(resultWithoutComments.total).toEqual(0)

    await client.communityArticleCreateComment(id, testData)

    const resultWithOneComment = await client.communityArticleGetComments(id)
    expect(resultWithOneComment.total).toEqual(1)
  })
})

describe('commentDelete()', () => {
  it('should be able to delete a comment by comment ID', async () => {
    const communityArticle = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )
    const comment = await client.communityArticleCreateComment(
      communityArticle.id,
      testData,
    )

    const resultWithOneComment = await client.communityArticleGetComments(
      communityArticle.id,
    )
    expect(resultWithOneComment.total).toEqual(1)

    expect(await client.commentDelete(comment.id)).toEqual(true)

    await expect(client.commentGet(comment.id)).rejects.toThrow('404 Not Found')

    const resultWithoutComments = await client.communityArticleGetComments(
      communityArticle.id,
    )
    expect(resultWithoutComments.total).toEqual(0)
  })
})

describe('commentGet()', () => {
  it('should be able to get a comment by comment ID', async () => {
    const communityArticle = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )
    const comment = await client.communityArticleCreateComment(
      communityArticle.id,
      testData,
    )

    const result = await client.commentGet(comment.id)

    expect(result.id).toEqual(comment.id)
    expect(result.content).toEqual(testData.content)
  })
})

describe('commentUpdate()', () => {
  it('should be able to update a comment by comment ID', async () => {
    const communityArticle = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )
    const comment = await client.communityArticleCreateComment(
      communityArticle.id,
      testData,
    )
    expect(comment.content).toEqual(testData.content)

    const updatedCommentData = {
      content: 'Hello again, world!',
    }
    const updatedComment = await client.commentUpdate(
      comment.id,
      updatedCommentData,
    )
    expect(updatedComment.id).toEqual(comment.id)
    expect(updatedComment.content).toEqual(updatedCommentData.content)
  })
})

describe('commentCreateLike()', () => {
  it('should create a new like in a comment', async () => {
    const communityArticle = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )
    const comment = await client.communityArticleCreateComment(
      communityArticle.id,
      testData,
    )

    expect(await client.commentCreateLike(comment.id)).toEqual(true)
    await expect(client.commentCreateLike(comment.id)).rejects.toThrow(
      '409 Conflict',
    )
  })
})

describe('commentDeleteLike()', () => {
  it('should delete a like in a comment', async () => {
    const communityArticle = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )
    const comment = await client.communityArticleCreateComment(
      communityArticle.id,
      testData,
    )

    await client.commentCreateLike(comment.id)

    expect(await client.commentDeleteLike(comment.id)).toEqual(true)
    await expect(client.commentDeleteLike(comment.id)).rejects.toThrow(
      '409 Conflict',
    )
  })
})

describe('commentGetLikes()', () => {
  it('should get all likes for a comment', async () => {
    const communityArticle = await client.communityArticleCreate(
      USER_ID,
      communityArticleData,
    )
    const comment = await client.communityArticleCreateComment(
      communityArticle.id,
      testData,
    )

    const resultWithNoLikes = await client.commentGetLikes(comment.id)
    expect(resultWithNoLikes.total).toEqual(0)

    await client.commentCreateLike(comment.id)

    const resultWithOneLike = await client.commentGetLikes(comment.id)
    expect(resultWithOneLike.total).toEqual(1)
    expect(resultWithOneLike._embedded.items[0].id).toBeTruthy()
  })
})
