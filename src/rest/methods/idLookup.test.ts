// tslint:disable:no-expression-statement
import restApi from '..'
import { APP_ID } from '../../../test/constants'
import { EnumResource } from '../types'

const api = restApi()

describe('createIdLookup()', () => {
  it('should be able to look up a single id given an id string', async () => {
    const result = await api.createIdLookup(
      APP_ID,
      EnumResource.property,
      'foobar',
    )

    expect(result).toEqual({
      foobar: null,
    })
  })

  it('should be able to look up an array of ids', async () => {
    const result = await api.createIdLookup(APP_ID, EnumResource.group, [
      'foo',
      'bar',
      'foobar',
    ])

    expect(result).toEqual({
      bar: null,
      foo: null,
      foobar: null,
    })
  })
})
