// tslint:disable:no-expression-statement
import fetch from 'cross-fetch'
import { DEFAULT_API_WRAPPER_OPTIONS } from '../constants'
import { until } from '../utils/functional'
import { makeApiRequest } from './request'

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
