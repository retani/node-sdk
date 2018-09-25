// tslint:disable:no-expression-statement
import { until } from '../utils/functional'
import { getNewTokenUsingPasswordGrant } from './oauth'
import request, { HttpVerb, makeApiRequest } from './request'
import { InterfaceAllthingsRestClientOptions } from './types'

describe('Request', () => {
  it('should throw when options.requestMaxRetries reached', async () => {
    await expect(
      until(
        () => false,
        makeApiRequest(
          { requestMaxRetries: 2, requestBackOffInterval: 0 } as any,
          'get',
          '',
          '',
          '',
          { query: {} },
        ),
        { statusCode: 503 },
        1,
      ),
    ).rejects.toThrow('Maximum number of retries reached')
  })

  it('should get an oauth token on request from implicit grant', async () => {
    // get a legis access token with the password grant, so we can mock it in the implicit
    const accessToken = await getNewTokenUsingPasswordGrant(
      process.env.ALLTHINGS_OAUTH_URL as string,
      process.env.ALLTHINGS_OAUTH_CLIENT_ID as string,
      process.env.ALLTHINGS_OAUTH_CLIENT_SECRET as string,
      process.env.ALLTHINGS_OAUTH_USERNAME as string,
      process.env.ALLTHINGS_OAUTH_PASSWORD as string,
    )

    // tslint:disable no-object-mutation
    global.window = {
      location: {
        hash: `access_token=${accessToken}`,
        href: '',
        origin: '',
      },
    }
    // tslint:enable no-object-mutation
    const clientOptions: InterfaceAllthingsRestClientOptions = {
      apiUrl: process.env.ALLTHINGS_REST_API_URL || '',
      clientId: process.env.client_id,
      clientSecret: '',
      oauthUrl: 'https://accounts.dev.allthings.me/oauth',
      password: '',
      requestBackOffInterval: 0,
      requestMaxRetries: 0,
      username: '',
    }

    const response = await request(clientOptions, 'get' as HttpVerb, '/v1/me')

    expect(typeof response).toBe('object')
    expect(response).toHaveProperty('_embedded')
  })

  it('should get an oauth token on request from implicit grant', async () => {
    // tslint:disable no-object-mutation
    global.window = {
      location: { hash: '', href: '', origin: '' },
    }
    // tslint:enable no-object-mutation
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

    await expect(
      request(clientOptions, 'get' as HttpVerb, 'myapimethod'),
    ).rejects.toThrow('Issue getting OAuth2 authentication token.')
    expect(global.window.location.href).toBeTruthy()
    expect(global.window.location.href).toContain(clientOptions.oauthUrl)
  })
})
