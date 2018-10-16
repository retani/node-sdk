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
    name: 'Foobar Property',
    timezone: EnumTimezone.EuropeBerlin,
  })

  const group = await client.groupCreate(property.id, {
    name: 'Foobar Group',
    propertyManagerId: APP_PROPERTY_MANAGER_ID,
  })

  const unit = await client.unitCreate(group.id, {
    name: 'Foobar Unit',
    type: EnumUnitType.rented,
  })

  const utilisationPeriod = await client.utilisationPeriodCreate(unit.id, {
    endDate: '2050-01-01',
    externalId: generateId(),
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

describe('ticketFindById()', () => {
  it('should be able to get a ticket by ID', async () => {
    const { id } = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )
    const result = await client.ticketFindById(id)

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
    const result = await client.ticketUpdateById(id, {
      status: EnumTicketStatus.closed,
    })

    expect(result.id).toEqual(id)
    expect(result.status).toBe(EnumTicketStatus.closed)

    const result2 = await client.ticketUpdateById(id, {
      status: EnumTicketStatus.waitingForAgent,
    })

    expect(result2.id).toEqual(id)
    expect(result2.status).toBe(EnumTicketStatus.waitingForAgent)

    const agentData = {
      description: 'Foobar User',
      email: generateId() + '@foobar.test',
      externalId: generateId(),
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
    const result3 = await client.ticketUpdateById(id, { assignedTo: agent.id })

    expect(result3.id).toEqual(id)
    expect(result3.assignedTo).toEqual(agent.id)
  })
})

describe('ticketFindAllByUser()', () => {
  it('should be able to list all tickets by user ID', async () => {
    const userData = {
      description: 'Foobar User',
      email: generateId() + '@foobar.test',
      externalId: generateId(),
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
    const result = await client.ticketFindAllByUser(user.id)
    expect(result.total).toEqual(1)

    await clientNewUser.ticketCreate(sharedUtilisationPeriodId, testData)
    const result2 = await client.ticketFindAllByUser(user.id)
    expect(result2.total).toEqual(2)
  })
})

describe('ticketRemoveExternalAgent()', () => {
  it('should be able to remove an external agent from a ticket', async () => {
    const { id: ticketId } = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )
    const agentData = {
      description: 'Foobar User',
      email: generateId() + '@foobar.test',
      externalId: generateId(),
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
    const ticket = await client.ticketUpdateById(ticketId, {
      assignedTo: agent.id,
    })
    expect(ticket.assignedTo).toEqual(agent.id)

    await client.ticketRemoveExternalAgent(ticketId, agent.id)
    const ticket2 = await client.ticketFindById(ticket.id)
    expect(ticket2.assignedTo).toBe(null)
  })
})

describe('ticketGetStatsByUser()', () => {
  it('should be able to get ticket stats for a specific user', async () => {
    const property = await client.propertyCreate(APP_ID, {
      name: 'Foobar Property',
      timezone: EnumTimezone.EuropeBerlin,
    })

    const group = await client.groupCreate(property.id, {
      name: 'Foobar Group',
      propertyManagerId: APP_PROPERTY_MANAGER_ID,
    })

    const unit = await client.unitCreate(group.id, {
      name: 'Foobar Unit',
      type: EnumUnitType.rented,
    })

    const utilisationPeriod = await client.utilisationPeriodCreate(unit.id, {
      endDate: '2050-01-01',
      externalId: generateId(),
      startDate: '2050-01-01',
    })

    const userData = {
      description: 'Foobar User',
      email: generateId() + '@foobar.test',
      externalId: generateId(),
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
    const result = await client.ticketGetStatsByUser(user.id)
    expect(result).toMatchObject({
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
    const result2 = await client.ticketGetStatsByUser(user.id)
    expect(result2).toMatchObject({
      closed: 1,
      openAssignedToUser: 0,
      unassigned: 1,
      waitingForAgent: 0,
      waitingForCustomer: 0,
      waitingForExternal: 0,
    })

    await clientNewUser.ticketCreate(utilisationPeriod.id, testData)
    const result3 = await client.ticketGetStatsByUser(user.id)
    expect(result3).toMatchObject({
      closed: 1,
      openAssignedToUser: 0,
      unassigned: 2,
      waitingForAgent: 1,
      waitingForCustomer: 0,
      waitingForExternal: 0,
    })
  })
})

describe('ticketConversationCreate()', () => {
  it('should be able to create a ticket conversation', async () => {
    const { id } = await client.ticketCreate(
      sharedUtilisationPeriodId,
      testData,
    )
    const result = await client.ticketConversationCreate(id, {
      participants: [USER_ID],
    })

    expect(result.id).toBeTruthy()
    expect(result._embedded.createdBy.id).toEqual(USER_ID)
  })
})

// @TODO - this endpoint doesn't seem to work right now
// describe('ticketConversationsList()', () => {
//   it('should be able to list ticket conversations', async () => {
//     const { id } = await client.ticketCreate(sharedUtilisationPeriodId, testData)
//     await client.ticketConversationCreate(id, { participants: [USER_ID] } )
//     await client.ticketFindById(id)

//     const result = await client.ticketConversationsList(id)
//     console.log('ticketConversationsListResult:',result)
//     expect(1).toEqual(1)
//   })
// })
