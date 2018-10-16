// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import {
  APP_ID,
  APP_PROPERTY_MANAGER_ID,
  USER_ID,
} from '../../../test/constants'
import { EnumTimezone } from '../types'
import { EnumUnitType } from './unit'

const client = restClient()

const testData = {
  content: {
    content: 'Hello world!',
  },
  type: 'text',
}

let sharedTicketId: string // tslint:disable-line no-let

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

  const ticket = await client.ticketCreate(utilisationPeriod.id, {
    category: '5728504906128762098b4568',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    phoneNumber: '+1 555 12345',
    title: 'Ut enim ad minim veniam',
  })

  sharedTicketId = ticket.id // tslint:disable-line no-expression-statement
})

describe('conversationFindById()', () => {
  it('should be able to get a conversation by ID', async () => {
    const { id } = await client.ticketConversationCreate(sharedTicketId, {
      participants: [USER_ID],
    })
    const result = await client.conversationFindById(id)
    expect(result.id).toEqual(id)
  })
})

describe('conversationMessageCreate()', () => {
  it('should be able to create a new message in a conversation', async () => {
    const { id } = await client.ticketConversationCreate(sharedTicketId, {
      participants: [USER_ID],
    })

    const message = await client.conversationMessageCreate(id, testData)
    expect(message.id).toBeTruthy()
    expect(message.content.content).toEqual(testData.content.content)
  })
})

describe('conversationMessagesList()', () => {
  it('should be able to get all messages of a conversation', async () => {
    const { id } = await client.ticketConversationCreate(sharedTicketId, {
      participants: [USER_ID],
    })

    const result = await client.conversationMessagesList(id)
    expect(result.total).toEqual(0)

    await client.conversationMessageCreate(id, testData)
    const result2 = await client.conversationMessagesList(id)
    expect(result2.total).toEqual(1)
  })
})

describe('conversationMessageUpdateById()', () => {
  it('should be able to update a message by message ID', async () => {
    const conversation = await client.ticketConversationCreate(sharedTicketId, {
      participants: [USER_ID],
    })
    const message = await client.conversationMessageCreate(
      conversation.id,
      testData,
    )

    const result = await client.conversationMessagesList(conversation.id)
    const msgResult = result._embedded.items[0]
    expect(msgResult.read).toBe(false)

    const msgUpdateResult = await client.conversationMessageUpdateById(
      message.id,
      { read: true },
    )
    expect(msgUpdateResult.read).toBe(true)

    const result2 = await client.conversationMessagesList(conversation.id)
    const msgResult2 = result2._embedded.items[0]
    expect(msgResult2.read).toBe(true)
  })
})
