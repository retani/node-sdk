// tslint:disable:no-expression-statement
import restClient from '..'
import { APP_ID } from '../../../test/constants'
import { EnumResource } from '../types'

const client = restClient()

describe('lookupIds()', () => {
  it('should be able to look up a single id given an id string', async () => {
    const result = await client.lookupIds(APP_ID, {
      externalIds: 'foobar',
      resource: EnumResource.property,
    })

    expect(result).toEqual({
      foobar: null,
    })
  })

  it('should be able to look up an array of ids', async () => {
    const result = await client.lookupIds(APP_ID, {
      externalIds: ['foo', 'bar', 'foobar'],
      resource: EnumResource.group,
    })

    expect(result).toEqual({
      bar: null,
      foo: null,
      foobar: null,
    })
  })
})
