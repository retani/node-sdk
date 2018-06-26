// tslint:disable:no-expression-statement
import restApi from './'

const mockAccessToken = 'foobar-token'
const mockClientId = 'foobar-clientId'

describe('Api wrapper', () => {
  it('should return an api wrapper object', async () => {
    const api = restApi()

    expect(api).toBeTruthy()
    expect(typeof api).toBe('object')
  })

  it('should use accessToken when provided in options object', async () => {
    const api = restApi({
      accessToken: mockAccessToken,
      clientId: mockClientId,
      clientSecret: '',
    })

    await expect(api.get('/me')).rejects.toThrow()
  })

  it('should throw error when clientId parameter is not provided', async () => {
    expect(() => restApi({ clientId: undefined } as any)).toThrow()
  })

  it('should throw error when unable to get access token', async () => {
    const api = restApi({
      clientId: 'failClient',
      clientSecret: 'failSecret',
      password: 'failPassword',
      username: 'failUser',
    })

    await expect(
      api.createApp('foobar', { name: 'foobar', siteUrl: 'foobar.test' }),
    ).rejects.toThrow()
  })
})
