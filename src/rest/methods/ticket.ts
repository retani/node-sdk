import { InterfaceAllthingsRestClient } from '../types'
import {
  ConversationResult,
  IConversation,
  mapConversationDateFields,
} from './conversation'
import { IGroup } from './group'
import { IProperty } from './property'
import { IUnit } from './unit'
import { IUser } from './user'

// @TODO
// add all languages
export interface IIntlField {
  readonly en_US?: string | null
  readonly de_DE?: string | null
  readonly fr_FR?: string | null
}

export interface ICategory {
  readonly key: string
  readonly name: IIntlField
  readonly description: IIntlField
  readonly id: string
}

export enum EnumTicketStatus {
  closed = 'closed',
  waitingForAgent = 'waiting-for-agent',
  waitingForCustomer = 'waiting-for-customer',
  waitingForExternal = 'waiting-for-external',
}

interface IGenericLink {
  readonly href: string
}

export interface ITicketStats {
  readonly unassigned: number
  readonly openAssignedToUser: number
  readonly closed: number
  readonly waitingForAgent: number
  readonly waitingForCustomer: number
  readonly waitingForExternal: number
  readonly _links: {
    readonly self: IGenericLink
  }
}

export interface ITicketLinks {
  readonly self: IGenericLink
  readonly createdBy: IGenericLink
  readonly assignedTo: IGenericLink
  readonly conversations: IGenericLink
  readonly comments: IGenericLink
}

export interface ITicketEmbedded {
  readonly createdBy: IUser
  readonly assignedTo: IUser | null
  readonly category: ICategory
  readonly conversations: ReadonlyArray<IConversation>
  readonly files: ReadonlyArray<any> // @TODO
  readonly group: IGroup
  readonly property: IProperty
  readonly unit: IUnit
  readonly comments: ReadonlyArray<any> // @TODO
}

export interface IBasicTicket {
  readonly assignedTo: string | null
  readonly category: string | null
  readonly commentCount: number
  readonly unreadAdminMessages: number
  readonly unreadUserMessages: number
  readonly id: string
  readonly description: string
  readonly phoneNumber: string
  readonly status: EnumTicketStatus
  readonly tags: ReadonlyArray<string>
  readonly title: string
  readonly channels: ReadonlyArray<string>
  readonly channelPaths: ReadonlyArray<ReadonlyArray<string>>
  readonly files: ReadonlyArray<any> // @TODO
  readonly read: boolean
  readonly sortHash: string
  readonly incrementID: number
  readonly _links: ITicketLinks
  readonly _embedded: ITicketEmbedded
  readonly customerWaitingSinceIndicator?: string
}

export interface IPreprocessedTicket extends IBasicTicket {
  readonly updatedAt: string
  readonly createdAt: string
  readonly customerWaitingSince: string
  readonly lastStatusUpdate: string
}

export interface ITicket extends IBasicTicket {
  readonly updatedAt: Date
  readonly createdAt: Date
  readonly customerWaitingSince: Date
  readonly lastStatusUpdate: Date
}

export interface ITicketCollection {
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
    readonly items: ReadonlyArray<IPreprocessedTicket> // this should be ITicket
  }
}

export type PartialTicket = Partial<IPreprocessedTicket>

export type TicketResult = Promise<ITicket>

export type TicketStatsResult = Promise<ITicketStats>

export type TicketCollectionResult = Promise<ITicketCollection>

function stringToDate(s: string): Date {
  return new Date(Date.parse(s))
}

function mapTicketDateFields({
  createdAt,
  customerWaitingSince,
  lastStatusUpdate,
  updatedAt,
  ...ticket
}: IPreprocessedTicket): ITicket {
  return {
    ...ticket,
    createdAt: stringToDate(createdAt),
    customerWaitingSince: stringToDate(customerWaitingSince),
    lastStatusUpdate: stringToDate(lastStatusUpdate),
    updatedAt: stringToDate(updatedAt),
  }
}

/*
  Create new ticket
  https://api-doc.allthings.me/#/Tickets/post_utilisation_periods__utilisationPeriodID__tickets
*/

export type MethodTicketCreate = (
  utilisationPeriodId: string,
  data: PartialTicket & {
    readonly category: string
    readonly description: string
  },
) => TicketResult

export async function ticketCreate(
  client: InterfaceAllthingsRestClient,
  utilisationPeriodId: string,
  data: PartialTicket & {
    readonly category: string
    readonly description: string
  },
): TicketResult {
  return mapTicketDateFields(
    await client.post(
      `/v1/utilisation-periods/${utilisationPeriodId}/tickets`,
      data,
    ),
  )
}

/*
  Get a ticket by its ID
  https://api-doc.allthings.me/#/Tickets/get_tickets__ticketId
*/

export type MethodTicketGetById = (ticketId: string) => TicketResult

export async function ticketGetById(
  client: InterfaceAllthingsRestClient,
  ticketId: string,
): TicketResult {
  return mapTicketDateFields(await client.get(`/v1/tickets/${ticketId}`))
}

/*
  Update a ticket by its ID
  https://api-doc.allthings.me/#/Tickets/patch_tickets__ticketId
*/

export type MethodTicketUpdateById = (
  ticketId: string,
  data: PartialTicket,
) => TicketResult

export async function ticketUpdateById(
  client: InterfaceAllthingsRestClient,
  ticketId: string,
  data: PartialTicket,
): TicketResult {
  return mapTicketDateFields(
    await client.patch(`/v1/tickets/${ticketId}`, data),
  )
}

/*
  List all tickets by user ID
  https://api-doc.allthings.me/#/Tickets/get_users__userId__tickets
*/

export type MethodTicketsGetByUser = (
  userId: string,
  filter?: string,
) => TicketCollectionResult

export async function ticketsGetByUser(
  client: InterfaceAllthingsRestClient,
  userId: string,
  filter?: string,
): TicketCollectionResult {
  const query = filter ? '?filter=' + filter : ''

  return client.get(`/v1/users/${userId}/tickets${query}`)
}

/*
  Remove an external agent from a ticket
  https://api-doc.allthings.me/#/Tickets/delete_tickets__ticketId__remove_external_agent__externalAgentId
*/

export type MethodTicketRemoveExternalAgent = (
  ticketId: string,
  externalAgentId: string,
) => Promise<any> // @TODO

export async function ticketRemoveExternalAgent(
  client: InterfaceAllthingsRestClient,
  ticketId: string,
  externalAgentId: string,
): Promise<any> {
  // @TODO
  return client.delete(
    `/v1/tickets/${ticketId}/remove-external-agent/${externalAgentId}`,
  )
}

/*
  Get ticket stats by user ID
  https://api-doc.allthings.me/#/Tickets/Stats/get_users__userId__ticket_stats
*/

export type MethodTicketStatsGetByUser = (
  userId: string,
  appFilter?: string,
) => TicketStatsResult

export async function ticketStatsGetByUser(
  client: InterfaceAllthingsRestClient,
  userId: string,
  appFilter?: string,
): TicketStatsResult {
  const query = appFilter ? '?appFilter=' + appFilter : ''

  return client.get(`/v1/users/${userId}/ticket-stats${query}`)
}

/*
  Create new ticket conversation by ticket ID
  https://api-doc.allthings.me/#/Ticket/Conversations/post_tickets__ticketId__conversations
*/

export type MethodTicketCreateConversation = (
  ticketId: string,
  data?: {
    readonly participants: ReadonlyArray<string>
  },
) => ConversationResult

export async function ticketCreateConversation(
  client: InterfaceAllthingsRestClient,
  ticketId: string,
  data?: {
    readonly participants: ReadonlyArray<string>
  },
): ConversationResult {
  return mapConversationDateFields(
    await client.post(`/v1/tickets/${ticketId}/conversations`, data),
  )
}

// @TODO - ticketListConversations
