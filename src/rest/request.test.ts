// tslint:disable:no-expression-statement
import fetch from 'cross-fetch'
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { until } from '../utils/functional'
import { getNewTokenUsingPasswordGrant } from './oauth'
import request, { HttpVerb, makeApiRequest } from './request'
import { InterfaceAllthingsRestClientOptions } from './types'

jest.mock('cross-fetch')

const mockFetch = fetch as any

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
    // get a legit access token with the password grant, so we can mock it in the implicit flow
    const accessToken = await getNewTokenUsingPasswordGrant(
      DEFAULT_API_WRAPPER_OPTIONS,
    )

    // tslint:disable-next-line:no-object-mutation
    global.window = {
      location: {
        hash: `access_token=${accessToken}`,
        href: '',
        origin: '',
      },
    }

    const response = await request(
      DEFAULT_API_WRAPPER_OPTIONS,
      'get' as HttpVerb,
      '/v1/me',
    )

    expect(typeof response).toBe('object')
    expect(response).toHaveProperty('_embedded')
  })

  it('should redirect to the oauth url in a window context', async () => {
    // tslint:disable-next-line:no-object-mutation
    global.window = {
      location: { hash: '', href: '', origin: '' },
    }

    // tslint:enable no-object-mutation
    const clientOptions: InterfaceAllthingsRestClientOptions = {
      ...DEFAULT_API_WRAPPER_OPTIONS,
      apiUrl: '',
    }

    await expect(
      request(clientOptions, 'get' as HttpVerb, '/v1/me'),
    ).rejects.toThrow('Issue getting OAuth2 authentication token.')

    expect(global.window.location.href).toBeTruthy()
    expect(global.window.location.href).toContain(clientOptions.oauthUrl)
  })

  it('should throw when response is not JSON or HTTP 204', async () => {
    mockFetch.mockResolvedValueOnce({
      headers: new Map([['content-type', 'text/html']]),
      ok: true,
      status: 200,
    })

    const error = await makeApiRequest(
      DEFAULT_API_WRAPPER_OPTIONS,
      'get',
      DEFAULT_API_WRAPPER_OPTIONS.oauthUrl,
      '',
      '',
    )({}, 0)

    expect(() => {
      throw error
    }).toThrow('Response content type was "text/html" but expected JSON')
  })
})
