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

export type ConversationResult = Promise<IConversation>

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
