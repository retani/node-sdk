// tslint:disable:no-expression-statement
import generateId from 'nanoid'
import restClient from '..'
import { USER_ID } from '../../../test/constants'

const client = restClient()

describe('appCreate()', () => {
  it('should create a new App', async () => {
    const result = await client.appCreate(USER_ID, {
      name: generateId(),
      siteUrl: generateId(),
    })

    expect(result).toBeTruthy()
  })
})
