import fetch from 'cross-fetch'
import memoize from 'mem'
import querystring from 'query-string'
import { USER_AGENT } from '../constants'
import makeLogger from '../utils/logger'

const logger = makeLogger('API Request')

const MEMOIZE_OPTIONS = { cachePromiseRejection: false, maxAge: 3600 * 1000 }

export const getNewTokenUsingPasswordGrant = memoize(
  async (
    oauthUrl: string,
    clientId: string,
    clientSecret: string,
    username: string,
    password: string,
  ): Promise<string | undefined> => {
    try {
      const url = `${oauthUrl}/oauth/token`
      const response = await fetch(url, {
        body: querystring.stringify({
          client_id: clientId,
          ...(clientSecret && { client_secret: clientSecret }),
          grant_type: 'password',
          password,
          scope: 'user:profile',
          username,
        }),
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          // OAuth 2 requires request content-type to be application/x-www-form-urlencoded
          'Content-Type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
          'user-agent': USER_AGENT,
        },
        method: 'POST',
        mode: 'cors',
      })

      const resp = await response.json()
      if (response.status !== 200) {
        throw response
      }

      return resp.access_token
    } catch (error) {
      if (!error.status) {
        throw error
      }

      const errorName = `HTTP ${error.status} — ${error.statusText}`

      // tslint:disable-next-line:no-expression-statement
      logger.error(errorName, error.response)

      throw new Error(
        `HTTP ${error.status} — ${error.statusText}. Could not get token`,
      )
    }
  },
  MEMOIZE_OPTIONS,
)
