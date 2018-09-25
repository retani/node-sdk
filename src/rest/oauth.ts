import fetch from 'cross-fetch'
import memoize from 'mem'
import querystring from 'query-string'
import { DEFAULT_API_WRAPPER_OPTIONS, USER_AGENT } from '../constants'
import makeLogger from '../utils/logger'
import { InterfaceAllthingsRestClientOptions } from './types'

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

export const unmemoizedGetNewTokenUsingImplicitFlow = async (
  clientOptions: InterfaceAllthingsRestClientOptions,
): Promise<string | undefined> => {
  const redirectUri = window.location.origin
  const payload = querystring.parse(window.location.hash)
  const accessToken = payload && payload.access_token

  const oauthUrl = `${clientOptions.oauthUrl}/authorize?${querystring.stringify(
    {
      client_id: DEFAULT_API_WRAPPER_OPTIONS.clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'user:profile',
      state: 1,
    },
  )}`

  if (!accessToken) {
    // tslint:disable-next-line:no-expression-statement no-object-mutation
    window.location.href = oauthUrl

    return undefined
  }

  // tslint:disable-next-line:no-expression-statement no-object-mutation
  window.location.hash = ''

  return accessToken
}

export const getNewTokenUsingImplicitFlow = memoize(
  unmemoizedGetNewTokenUsingImplicitFlow,
  MEMOIZE_OPTIONS,
)
