// tslint:disable:no-expression-statement
import restClient from '.'

const mockAccessToken = 'foobar-token'
const mockClientId = 'foobar-clientId'

describe('Rest API Client', () => {
  it('should return a client', async () => {
    const client = restClient()

    expect(client).toBeTruthy()
    expect(typeof client).toBe('object')
  })

  it('should use accessToken when provided in options object', async () => {
    const client = restClient({
      accessToken: mockAccessToken,
      clientId: mockClientId,
      clientSecret: '',
    })

    await expect(client.get('/me')).rejects.toThrow()
  })

  it('should throw error when apiUrl parameter is not provided', async () => {
    expect(() => restClient({ apiUrl: undefined } as any)).toThrow()
  })

  it('should throw error when oauthUrl parameter is not provided', async () => {
    expect(() => restClient({ oauthUrl: undefined } as any)).toThrow()
  })

  it('should throw error when clientId parameter is not provided', async () => {
    expect(() => restClient({ clientId: undefined } as any)).toThrow()
  })

  it('should use default options when none provided, and process.env variables unset', async () => {
    jest.resetModules()

    // tslint:disable no-delete no-object-mutation
    delete process.env.ALLTHINGS_OAUTH_CLIENT_ID
    delete process.env.ALLTHINGS_OAUTH_CLIENT_SECRET
    delete process.env.ALLTHINGS_OAUTH_USERNAME
    delete process.env.ALLTHINGS_OAUTH_PASSWORD
    delete process.env.ALLTHINGS_REST_API_URL
    delete process.env.ALLTHINGS_OAUTH_URL
    // tslint:enable no-delete no-object-mutation

    const restClient2 = require('.').default

    const client = restClient2({ clientId: 'foobar' } as any)

    expect(client.options).toEqual({
      apiUrl: 'https://api.allthings.me',
      clientId: 'foobar',
      clientSecret: undefined,
      oauthUrl: 'https://accounts.allthings.me',
      password: undefined,
      username: undefined,
    })

    jest.resetModules()
    // restore process.env.ALLTHINGS_* test values
    require('../../test/setup')
  })

  it('should throw error when unable to get access token', async () => {
    const client = restClient({
      clientId: 'failClient',
      clientSecret: 'failSecret',
      password: 'failPassword',
      username: 'failUser',
    })

    await expect(
      client.createApp('foobar', { name: 'foobar', siteUrl: 'foobar.test' }),
    ).rejects.toThrow()
  })
})
