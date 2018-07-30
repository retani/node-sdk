// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restClient from '..'
import { USER_ID } from '../../../test/constants'

const client = restClient()

describe('createApp()', () => {
  it('should create a new App', async () => {
    const result = await client.appCreate(USER_ID, {
      name: generateId(),
      siteUrl: generateId(),
    })

    expect(result).toBeTruthy()
  })
})
