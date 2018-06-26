// tslint:disable:no-expression-statement
import { generate as generateId } from 'shortid'
import restApi from '../'
import { USER_ID } from '../../../test/constants'

const api = restApi()

describe('createApp()', () => {
  it('should create a new App', async () => {
    const result = await api.createApp(USER_ID, {
      name: generateId(),
      siteUrl: generateId(),
    })

    expect(result).toBeTruthy()
  })
})
