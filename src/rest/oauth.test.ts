// tslint:disable:no-expression-statement
import {
  getNewTokenUsingImplicitFlow,
  getNewTokenUsingPasswordGrant,
} from './oauth'

describe('getNewTokenUsingPasswordGrant()', () => {
  it('should return a token given valid credentials', async () => {
    const accessToken = await getNewTokenUsingPasswordGrant(
      process.env.ALLTHINGS_OAUTH_URL as string,
      process.env.ALLTHINGS_OAUTH_CLIENT_ID as string,
      process.env.ALLTHINGS_OAUTH_CLIENT_SECRET as string,
      process.env.ALLTHINGS_OAUTH_USERNAME as string,
      process.env.ALLTHINGS_OAUTH_PASSWORD as string,
    )

    expect(typeof accessToken).toBe('string')
  })

  it('should throw given invalid credentials', async () => {
    await expect(
      getNewTokenUsingPasswordGrant(
        process.env.ALLTHINGS_OAUTH_URL as string,
        '',
        '',
        '',
        '',
      ),
    ).rejects.toThrow('HTTP 400 — Bad Request. OAuth')

    await expect(
      getNewTokenUsingPasswordGrant(
        `${process.env.ALLTHINGS_OAUTH_URL as string}/foobar`,
        '',
        '',
        '',
        '',
      ),
    ).rejects.toThrow('HTTP 404 — Not Found')

    await expect(
      getNewTokenUsingPasswordGrant('foobarHost', '', '', '', ''),
    ).rejects.toThrow('ENOTFOUND')
  })

  it.only('should return a token given valid credentials', async () => {
    /* const mockFetch = jest.fn()
    const mockJson = jest.fn()

    //  window.location.origin
    const REDIRECT_URL = 'https://codesandbox.testio/s/3ykzjvx2n5'
    // /const OAUTH_URL = `https://accounts.allthings.me/oauth/authorize?client_id=${OAUTH_CLIENT}&scope=user:profile&response_type=token&redirect_uri=${REDIRECT_URL}&state=1`

    // tslint:disable no-object-mutation

    // tslint:enable no-object-mutation

    jest.doMock('cross-fetch', () => {
      mockJson.mockResolvedValueOnce({ accessToken: '123 Welt' })
      mockFetch.mockResolvedValue({
        url: 'https://api-doc.dev.allthings.me/o2c.htm#accessToken=123',
      })

      return mockFetch
    })

    jest.resetModules()
    jest.resetAllMocks()*/
    const oauth = require('./oauth')

    global.window = { location: { hash: '', origin: '' } }
    global.window.location.origin = 'https://codesandbox.testio/s/3ykzjvx2n5'
    console.log(global.window.location.origin)

    const token = await oauth.unmemoizedGetNewTokenUsingImplicitFlow({
      clientId: process.env.client_id,
      clientSecret: '',
      oauthUrl: 'https://accounts.dev.allthings.me/oauth',
      password: '',
      username: '',
    })

    console.log(token)
    global.window = { location: { hash: '', origin: '' } }
    global.window.location.hash =
      'access_token=fa778460246d25857234aff086a82fc0e83f6f1f'

    console.log(window.location)

    const token23 = await oauth.unmemoizedGetNewTokenUsingImplicitFlow({
      clientId: process.env.client_id,
      clientSecret: '',
      oauthUrl: 'https://accounts.dev.allthings.me/oauth',
      password: '',
      username: '',
    })

    console.log(token23)
    /*  expect(typeof responseUrl).toBe('string')
    expect(responseUrl).toBe(
      'https://api-doc.dev.allthings.me/o2c.htm#accessToken=123',
    )*/
  })
})

/*

https://accounts.allthings.me/oauth/authorize?client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user:profile&state=1&response_type=token&redirect_uri=https://api-doc.dev.allthings.me/o2c.html
https%3A%2F%2Fapi-doc.dev.allthings.me%2Fo2c.html&
*/
