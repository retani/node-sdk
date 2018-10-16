import { InterfaceAllthingsRestClient } from '../types'
import { IUser } from './user'

interface IGenericLink {
  readonly href: string
}

export interface IBasicConversation {
  readonly id: string
  readonly _links: {
    readonly self: IGenericLink
    readonly createdBy: IGenericLink
    readonly messages: IGenericLink
  }
  readonly _embedded: {
    readonly createdBy: IUser
    readonly participants: ReadonlyArray<IUser>
  }
}

export interface IPreprocessedConversation extends IBasicConversation {
  readonly createdAt: string
}

export interface IConversation extends IBasicConversation {
  readonly createdAt: Date
}

export interface IBasicMessage {
  readonly id: string
  readonly read: boolean
  readonly type: string // @TODO
  readonly content: {
    readonly content: string
  }
  readonly internal: boolean
  readonly _links: {
    readonly createdBy: IGenericLink
    readonly conversation: IGenericLink
  }
  readonly _embedded: {
    readonly createdBy: IUser
  }
}

export interface IPreprocessedMessage extends IBasicMessage {
  readonly createdAt: string
}

export interface IMessage extends IBasicMessage {
  readonly createdAt: Date
}

export interface IMessageCollection {
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
  readonly _embedded: {
    readonly items: ReadonlyArray<IMessage>
  }
}

export type ConversationResult = Promise<IConversation>

export type PartialMessage = Partial<IPreprocessedMessage>

export type MessageResult = Promise<IMessage>

export type MessageCollectionResult = Promise<IMessageCollection>

function stringToDate(s: string): Date {
  return new Date(Date.parse(s))
}

export function mapConversationDateFields(
  conversation: IPreprocessedConversation,
): IConversation {
  return {
    ...conversation,
    createdAt: stringToDate(conversation.createdAt),
  }
}

export function mapMessageDateFields(message: IPreprocessedMessage): IMessage {
  return {
    ...message,
    createdAt: stringToDate(message.createdAt),
  }
}

/*
  Get a conversation by its ID
  https://api-doc.allthings.me/#/Conversations/get_conversations__conversationId
*/

export type MethodConversationFindById = (
  conversationId: string,
  token?: string,
) => ConversationResult

export async function conversationFindById(
  client: InterfaceAllthingsRestClient,
  conversationId: string,
  token?: string,
): ConversationResult {
  const query = token ? '?token=' + token : ''

  return mapConversationDateFields(
    await client.get(`/v1/conversations/${conversationId}${query}`),
  )
}

/*
  Create a new message in a conversation by conversation ID
  https://api-doc.allthings.me/#/Conversations/post_conversations__conversationId__messages
*/

export type MethodConversationMessageCreate = (
  conversationId: string,
  data: {
    readonly type: string
    readonly content: {
      readonly content: string
    }
  },
  token?: string,
) => MessageResult

export async function conversationMessageCreate(
  client: InterfaceAllthingsRestClient,
  conversationId: string,
  data: {
    readonly type: string
    readonly content: {
      readonly content: string
    }
  },
  token?: string,
): MessageResult {
  const query = token ? '?token=' + token : ''

  return mapMessageDateFields(
    await client.post(
      `/v1/conversations/${conversationId}/messages${query}`,
      data,
    ),
  )
}

/*
  Get all messages of a conversation by conversation ID
  https://api-doc.dev.allthings.me/#/Conversations/get_conversations__conversationId__messages
*/

export type MethodConversationMessagesList = (
  conversationId: string,
  token?: string | null,
  filter?: string | null,
) => MessageCollectionResult

export async function conversationMessagesList(
  client: InterfaceAllthingsRestClient,
  conversationId: string,
  token?: string | null,
  filter?: string | null,
): MessageCollectionResult {
  const queryToken = token ? 'token=' + token : ''
  const queryFilter = filter ? 'filter=' + filter : ''
  const query =
    queryToken && queryFilter
      ? `?${queryToken}&${queryFilter}`
      : queryToken || queryFilter
        ? `?${queryToken}${queryFilter}`
        : ''

  return client.get(`/v1/conversations/${conversationId}/messages${query}`)
}

/*
  Update a message by its ID
  https://api-doc.dev.allthings.me/#/Conversations/patch_messages__messageId
*/

export type MethodConversationMessageUpdateById = (
  messageId: string,
  data: PartialMessage,
  token?: string,
) => MessageResult

export async function conversationMessageUpdateById(
  client: InterfaceAllthingsRestClient,
  messageId: string,
  data: PartialMessage,
  token?: string,
): MessageResult {
  const query = token ? '?token=' + token : ''

  return mapMessageDateFields(
    await client.patch(`/v1/messages/${messageId}${query}`, data),
  )
}
