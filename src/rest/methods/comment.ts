import { getQueryString } from '../../utils/getQueryString'
import { stringToDate } from '../../utils/stringToDate'
import { InterfaceAllthingsRestClient } from '../types'
import { ICommunityArticle } from './communityArticle'
import { LikeCollectionResult } from './like'
import { IUser } from './user'

// @TODO: get this from types file once it's merged
interface IGenericLink {
  readonly href: string
}

export interface IBasicComment {
  readonly id: string
  readonly content: string
  readonly published: boolean
  readonly sortHash: string
  readonly _links: {
    readonly self: IGenericLink
    readonly communityArticle: IGenericLink
    readonly likes: IGenericLink
  }
  readonly _embedded: {
    readonly communityArticle: ICommunityArticle
    readonly user: IUser
    readonly likes: ReadonlyArray<any> // @TODO
  }
}

export interface IPreprocessedComment extends IBasicComment {
  readonly createdAt: string
}

export interface IComment extends IBasicComment {
  readonly createdAt: Date
}

export interface IBasicCommentCollection {
  readonly page: number
  readonly limit: number
  readonly pages: number
  readonly total: number
  readonly metaData: ReadonlyArray<any> // @TODO
  readonly _links: {
    readonly self: IGenericLink
    readonly first: IGenericLink
    readonly last: IGenericLink
  }
}

export interface IPreprocessedCommentCollection
  extends IBasicCommentCollection {
  readonly _embedded: {
    readonly items: ReadonlyArray<IPreprocessedComment>
  }
}

export interface ICommentCollection extends IBasicCommentCollection {
  readonly _embedded: {
    readonly items: ReadonlyArray<IComment>
  }
}

export type PartialComment = Partial<IPreprocessedComment>

export type CommentResult = Promise<IComment>

export type CommentCollectionResult = Promise<ICommentCollection>

export function mapCommentDateFields({
  createdAt,
  ...comment
}: IPreprocessedComment): IComment {
  return {
    ...comment,
    createdAt: stringToDate(createdAt),
  }
}

function mapCommentCollectionDateFields(
  commentCollection: IPreprocessedCommentCollection,
): ICommentCollection {
  return {
    ...commentCollection,
    _embedded: {
      items: commentCollection._embedded.items.map(mapCommentDateFields),
    },
  }
}

/*
  Create a new comment by community article ID
  https://api-doc.allthings.me/#/CommunityArticles/Comments/post_community_articles__communityArticleID__comments
*/

export type MethodCommunityArticleCreateComment = (
  communityArticleId: string,
  data: {
    readonly content: string
  },
) => CommentResult

export async function communityArticleCreateComment(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
  data: {
    readonly content: string
  },
): CommentResult {
  return mapCommentDateFields(
    await client.post(
      `/v1/community-articles/${communityArticleId}/comments`,
      data,
    ),
  )
}

/*
  List all comments of a community article by community article ID
  https://api-doc.allthings.me/#/CommunityArticles/Comments/get_community_articles__communityArticleID__comments
*/

export type MethodCommunityArticleGetComments = (
  communityArticleId: string,
  filter?: string,
) => CommentCollectionResult

export async function communityArticleGetComments(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
  filter?: string,
): CommentCollectionResult {
  const query = getQueryString({ filter })

  return mapCommentCollectionDateFields(
    await client.get(
      `/v1/community-articles/${communityArticleId}/comments${query}`,
    ),
  )
}

/*
  Delete a comment by comment ID
  https://api-doc.allthings.me/#/CommunityArticles/Comments/delete_comments__commentID
*/

export type MethodCommentDelete = (commentId: string) => Promise<boolean>

export async function commentDelete(
  client: InterfaceAllthingsRestClient,
  commentId: string,
): Promise<boolean> {
  return (await client.delete(`/v1/comments/${commentId}`)) === ''
}

/*
  Get a comment by comment ID
  https://api-doc.allthings.me/#/CommunityArticles/Comments/get_comments__commentID
*/

export type MethodCommentGet = (commentId: string) => CommentResult

export async function commentGet(
  client: InterfaceAllthingsRestClient,
  commentId: string,
): CommentResult {
  return client.get(`/v1/comments/${commentId}`)
}

/*
  Update a comment by comment ID
  https://api-doc.allthings.me/#/CommunityArticles/Comments/patch_comments__commentID
*/

export type MethodCommentUpdate = (
  commentId: string,
  data: {
    readonly content: string
  },
) => CommentResult

export async function commentUpdate(
  client: InterfaceAllthingsRestClient,
  commentId: string,
  data: {
    readonly content: string
  },
): CommentResult {
  return client.patch(`/v1/comments/${commentId}`, data)
}

/*
  Create a like for a comment by comment ID
  https://api-doc.allthings.me/#/Comments/Likes/post_comments__commentId__likes
*/

export type MethodCommentCreateLike = (commentId: string) => Promise<boolean>

export async function commentCreateLike(
  client: InterfaceAllthingsRestClient,
  commentId: string,
): Promise<boolean> {
  return (await client.post(`/v1/comments/${commentId}/likes`)) === ''
}

/*
  Delete a like for a comment by comment ID
  https://api-doc.allthings.me/#/Comments/Likes/delete_comments__commentId__likes
*/

export type MethodCommentDeleteLike = (commentId: string) => Promise<boolean>

export async function commentDeleteLike(
  client: InterfaceAllthingsRestClient,
  commentId: string,
): Promise<boolean> {
  return (await client.delete(`/v1/comments/${commentId}/likes`)) === ''
}

/*
  Get all likes for a comment by comment ID
  https://api-doc.allthings.me/#/Comments/Likes/get_comments__commentId__likes
*/

export type MethodCommentGetLikes = (
  commentId: string,
  filter?: string,
) => LikeCollectionResult // @TODO

export async function commentGetLikes(
  client: InterfaceAllthingsRestClient,
  commentId: string,
  filter?: string,
): LikeCollectionResult {
  const query = getQueryString({ filter })

  return client.get(`/v1/comments/${commentId}/likes${query}`)
}
