// tslint:disable:no-expression-statement
import { until } from '../utils/functional'
import { makeApiRequest } from './request'

describe('Request', () => {
  it('should throw when options.requestMaxRetries reached', async () => {
    await expect(
      until(
        () => false,
        makeApiRequest(
          { requestMaxRetries: 1, requestBackOffInterval: 0 } as any,
          'get',
          '',
          '',
          '',
          {},
        ),
        { statusCode: 503 },
        1,
      ),
    ).rejects.toThrow('Maximum number of retries reached')
  })
})
