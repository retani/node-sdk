import * as got from 'got'
import * as memoize from 'mem'
import { API_OAUTH_URL, USER_AGENT } from './constants'
import makeLogger from './utils/logger'

const logger = makeLogger('API Request')

const MEMOIZE_OPTIONS = { cachePromiseRejection: false, maxAge: 3600 * 1000 }

export const getNewTokenUsingPasswordGrant = memoize(
  async (
    clientId: string,
    clientSecret: string,
    username: string,
    password: string,
  ): Promise<string | undefined> => {
    try {
      const {
        body: { access_token: accessToken },
      } = await got.post(API_OAUTH_URL, {
        body: {
          client_id: clientId,
          ...(clientSecret && { client_secret: clientSecret }),
          grant_type: 'password',
          password,
          scope: 'user:profile',
          username,
        },
        // OAuth 2 requires request content-type to be application/x-www-form-urlencoded
        form: true,
        headers: {
          'user-agent': USER_AGENT,
        },
        json: true,
      })

      return accessToken
    } catch (error) {
      const errorName = `HTTP ${error.statusCode} — ${error.statusMessage}`

      // tslint:disable-next-line:no-expression-statement
      logger.error(errorName, error.response && error.response.body)

      throw new Error(`HTTP ${error.statusCode} — ${error.statusMessage}`)
    }
  },
  MEMOIZE_OPTIONS,
)
