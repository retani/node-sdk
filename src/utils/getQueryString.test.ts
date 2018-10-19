// tslint:disable:no-expression-statement
import { getQueryString } from './getQueryString'

describe('getQueryString()', () => {
  it('should return a query string with one param', () => {
    const actual = getQueryString({ token: 'abcd1234' })
    const expected = '?token=abcd1234'
    expect(actual).toEqual(expected)
  })

  it('should return a query string with two params', () => {
    const actual = getQueryString({ token: 'abcd1234', filter: 'foobar' })
    const expected = '?filter=foobar&token=abcd1234'
    expect(actual).toEqual(expected)
  })

  it('should return a query string with an undefined param', () => {
    const actual = getQueryString({ token: undefined, filter: 'foobar' })
    const expected = '?filter=foobar'
    expect(actual).toEqual(expected)
  })

  it('should return an empty string with no params', () => {
    const actual = getQueryString({})
    const expected = ''
    expect(actual).toEqual(expected)
  })

  it('should return an empty string with undefined params', () => {
    const actual = getQueryString({ token: undefined, filter: undefined })
    const expected = ''
    expect(actual).toEqual(expected)
  })

  it('should return a query string with an array param', () => {
    const actual = getQueryString({
      channels: ['App-abcd1234', 'Property-efgh5678'],
    })
    const expected = '?channels=App-abcd1234&channels=Property-efgh5678'
    expect(actual).toEqual(expected)
  })
})
