// tslint:disable:no-expression-statement
import {
  getNewTokenUsingPasswordGrant,
  unmemoizedGetNewTokenUsingImplicitFlow,
} from './oauth'
import { InterfaceAllthingsRestClientOptions } from './types'

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
    ).rejects.toThrow('HTTP 400 — Bad Request')

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
      getNewTokenUsingPasswordGrant('http://foobarHost', '', '', '', ''),
    ).rejects.toThrow('ENOTFOUND')
  })

  it('should return a token given valid credentials', async () => {
    const clientOptions: InterfaceAllthingsRestClientOptions = {
      apiUrl: '',
      clientId: process.env.client_id,
      clientSecret: '',
      oauthUrl: 'https://accounts.dev.allthings.me/oauth',
      password: '',
      requestBackOffInterval: 0,
      requestMaxRetries: 0,
      username: '',
    }

    // tslint:disable no-object-mutation
    global.window = {
      location: { hash: '', href: '', origin: '' },
    }
    global.window.location.origin = 'https://codesandbox.testio/s/3ykzjvx2n5'
    // tslint:enable no-object-mutation

    const token = await unmemoizedGetNewTokenUsingImplicitFlow(clientOptions)

    expect(token).toBe(undefined)
    // tslint:disable no-object-mutation
    global.window = {
      location: { hash: '', href: '', origin: '' },
    }
    global.window.location.hash =
      'access_token=fa778460246d25857234aff086a82fc0e83f6f1f'
    // tslint:enable no-object-mutation

    const accessToken = await unmemoizedGetNewTokenUsingImplicitFlow(
      clientOptions,
    )

    expect(accessToken).toBe('fa778460246d25857234aff086a82fc0e83f6f1f')
  })
})
