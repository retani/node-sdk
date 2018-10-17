// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import {
  APP_ID,
  APP_PROPERTY_MANAGER_ID,
  USER_ID,
} from '../../../test/constants'
import { EnumLocale, EnumTimezone } from '../types'
import { EnumTicketStatus } from './ticket'
import { EnumUnitType } from './unit'
import { EnumUserPermissionObjectType, EnumUserPermissionRole } from './user'

const client = restClient()

const CATEGORY_ID = '5728504906128762098b4568'

const testData = {
  category: CATEGORY_ID,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  phoneNumber: '+1 555 12345',
  title: 'Ut enim ad minim veniam',
}

let sharedUtilisationPeriodId: string // tslint:disable-line no-let

beforeAll(async () => {
  const property = await client.propertyCreate(APP_ID, {
    name: 'Ticket Test Property',
    timezone: EnumTimezone.EuropeBerlin,
  })

  const group = await client.groupCreate(property.id, {
    name: 'Ticket Test Group',
    propertyManagerId: APP_PROPERTY_MANAGER_ID,
  })

  const unit = await client.unitCreate(group.id, {
    name: 'Ticket Test Unit',
    type: EnumUnitType.rented,
  })

  const utilisationPeriod = await client.utilisationPeriodCreate(unit.id, {
    endDate: '2050-01-01',
    startDate: '2050-01-01',
  })

  sharedUtilisationPeriodId = utilisationPeriod.id // tslint:disable-line no-expression-statement
})

describe('ticketCreate()', () => {
  it('should be able to create a new ticket', async () => {
    const result = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )

    expect(result.id).toBeTruthy()
    expect(result).toMatchObject(testData)
    expect(result.assignedTo).toBe(null)
    expect(result.status).toBe(EnumTicketStatus.waitingForAgent)
  })
})

describe('ticketGetById()', () => {
  it('should be able to get a ticket by ID', async () => {
    const { id } = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )
    const result = await client.ticketGetById(id)

    expect(result.id).toEqual(id)
    expect(result).toMatchObject(testData)
  })
})

describe('ticketUpdateById()', () => {
  it('should be able to update a ticket by ID', async () => {
    const { id } = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )
    const resultWithStatusClosed = await client.ticketUpdateById(id, {
      status: EnumTicketStatus.closed,
    })

    expect(resultWithStatusClosed.id).toEqual(id)
    expect(resultWithStatusClosed.status).toBe(EnumTicketStatus.closed)

    const resultWithStatusWaitingForAgent = await client.ticketUpdateById(id, {
      status: EnumTicketStatus.waitingForAgent,
    })

    expect(resultWithStatusWaitingForAgent.id).toEqual(id)
    expect(resultWithStatusWaitingForAgent.status).toBe(
      EnumTicketStatus.waitingForAgent,
    )

    const agentData = {
      description: 'Ticket Test Agent',
      email: generateId() + '@foobar.test',
      locale: EnumLocale.en_US,
    }
    const agent = await client.agentCreate(
      APP_ID,
      APP_PROPERTY_MANAGER_ID,
      generateId(),
      agentData,
    )
    await client.userCreatePermission(agent.id, {
      objectId: APP_ID,
      objectType: EnumUserPermissionObjectType.app,
      restrictions: [],
      role: EnumUserPermissionRole.admin,
    })
    const resultAssignedToAgent = await client.ticketUpdateById(id, {
      assignedTo: agent.id,
    })

    expect(resultAssignedToAgent.id).toEqual(id)
    expect(resultAssignedToAgent.assignedTo).toEqual(agent.id)
  })
})

describe('ticketsGetByUser()', () => {
  it('should be able to list all tickets by user ID', async () => {
    const userData = {
      description: 'Ticket Test User',
      email: generateId() + '@foobar.test',
      locale: EnumLocale.en_US,
    }
    const password = generateId()
    const user = await client.userCreate(
      APP_ID,
      generateId(),
      password,
      userData,
    )

    await client.userCreatePermission(user.id, {
      objectId: APP_ID,
      objectType: EnumUserPermissionObjectType.app,
      restrictions: [],
      role: EnumUserPermissionRole.admin,
    })
    const clientNewUser = restClient({ username: userData.email, password })

    await clientNewUser.ticketCreate(sharedUtilisationPeriodId, testData)
    const resultWithOneTicket = await client.ticketsGetByUser(user.id)
    expect(resultWithOneTicket.total).toEqual(1)

    await clientNewUser.ticketCreate(sharedUtilisationPeriodId, testData)
    const resultWithTwoTickets = await client.ticketsGetByUser(user.id)
    expect(resultWithTwoTickets.total).toEqual(2)
  })
})

describe('ticketRemoveExternalAgent()', () => {
  it('should be able to remove an external agent from a ticket', async () => {
    const { id: ticketId } = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )
    const agentData = {
      description: 'Ticket Test Agent',
      email: generateId() + '@foobar.test',
      locale: EnumLocale.en_US,
    }
    const agent = await client.agentCreate(
      APP_ID,
      APP_PROPERTY_MANAGER_ID,
      generateId(),
      agentData,
    )

    await client.userCreatePermission(agent.id, {
      objectId: APP_ID,
      objectType: EnumUserPermissionObjectType.app,
      restrictions: [],
      role: EnumUserPermissionRole.externalTicketCollaborator,
    })
    const ticketWithAssignedAgent = await client.ticketUpdateById(ticketId, {
      assignedTo: agent.id,
    })
    expect(ticketWithAssignedAgent.assignedTo).toEqual(agent.id)

    expect(await client.ticketRemoveExternalAgent(ticketId, agent.id)).toEqual(
      true,
    )
    const ticketWithRemovedAgent = await client.ticketGetById(ticketId)
    expect(ticketWithRemovedAgent.assignedTo).toBe(null)

    await expect(
      client.ticketRemoveExternalAgent(ticketId, agent.id),
    ).rejects.toThrow('400 Bad Request')
  })
})

describe('ticketStatsGetByUser()', () => {
  it('should be able to get ticket stats for a specific user', async () => {
    const property = await client.propertyCreate(APP_ID, {
      name: 'Ticket Test Property',
      timezone: EnumTimezone.EuropeBerlin,
    })

    const group = await client.groupCreate(property.id, {
      name: 'Ticket Test Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    const unit = await client.unitCreate(group.id, {
      name: 'Ticket Test Unit',
      type: EnumUnitType.rented,
    })

    const utilisationPeriod = await client.utilisationPeriodCreate(unit.id, {
      endDate: '2050-01-01',
      startDate: '2050-01-01',
    })

    const userData = {
      description: 'Ticket Test User',
      email: generateId() + '@foobar.test',
      locale: EnumLocale.en_US,
    }
    const password = generateId()
    const user = await client.userCreate(
      APP_ID,
      generateId(),
      password,
      userData,
    )
    await client.userCreatePermission(user.id, {
      objectId: unit.id,
      objectType: EnumUserPermissionObjectType.unit,
      restrictions: [],
      role: EnumUserPermissionRole.admin,
    })
    const clientNewUser = restClient({ username: userData.email, password })

    const { id: ticketId } = await clientNewUser.ticketCreate(
      utilisationPeriod.id,
      testData,
    )
    const resultWithUnassignedTicket = await client.ticketStatsGetByUser(
      user.id,
    )
    expect(resultWithUnassignedTicket).toMatchObject({
      closed: 0,
      openAssignedToUser: 0,
      unassigned: 1,
      waitingForAgent: 1,
      waitingForCustomer: 0,
      waitingForExternal: 0,
    })

    await clientNewUser.ticketUpdateById(ticketId, {
      status: EnumTicketStatus.closed,
    })
    const resultWithClosedTicket = await client.ticketStatsGetByUser(user.id)
    expect(resultWithClosedTicket).toMatchObject({
      closed: 1,
      openAssignedToUser: 0,
      unassigned: 1,
      waitingForAgent: 0,
      waitingForCustomer: 0,
      waitingForExternal: 0,
    })

    await clientNewUser.ticketCreate(utilisationPeriod.id, testData)
    const resultWithMultipleTickets = await client.ticketStatsGetByUser(user.id)
    expect(resultWithMultipleTickets).toMatchObject({
      closed: 1,
      openAssignedToUser: 0,
      unassigned: 2,
      waitingForAgent: 1,
      waitingForCustomer: 0,
      waitingForExternal: 0,
    })
  })
})

describe('ticketCreateConversation()', () => {
  it('should be able to create a ticket conversation', async () => {
    const { id } = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )
    const result = await client.ticketCreateConversation(id, {
      participants: [USER_ID],
    })

    expect(result.id).toBeTruthy()
    expect(result._embedded.participants[0].id).toEqual(USER_ID)
  })
})

// @TODO - ticketListConversations
