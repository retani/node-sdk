import * as got from 'got'
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
      const {
        body: { access_token: accessToken },
      } = await got.post(`${oauthUrl}/oauth/token`, {
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
      if (!error.statusCode) {
        throw error
      }

      const errorName = `HTTP ${error.statusCode} — ${error.statusMessage}`

      // tslint:disable-next-line:no-expression-statement
      logger.error(errorName, error.response && error.response.body)

      throw new Error(
        `HTTP ${error.statusCode} — ${error.statusMessage}. ${
          error.response && error.response.body && error.response.body.message
            ? `OAuth ${error.response.body.message}`
            : ''
        }`,
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

  console.log(window)
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
    window.location = oauthUrl

    return undefined
  }

  console.log(window)

  window.location.hash = ''

  return accessToken
}

export const getNewTokenUsingImplicitFlow = memoize(
  unmemoizedGetNewTokenUsingImplicitFlow,
  MEMOIZE_OPTIONS,
)

/*

const OAUTH_URL = `https://accounts.allthings.me/oauth/authorize?client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkgscope=user:profile&response_type=token&redirect_uri=${REDIRECT_URL}&state=1`

#access_token=c2bd3d5677f4d136f9c49edb3a5f2b2a9e517cee&state=1

https://api-doc.dev.allthings.me/#!/Assets47ContactPersons/get_assets_contact_persons

https://accounts.dev.allthings.me/oauth/authorize?client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user:profile&response_type=token&redirect_uri=https://api-doc.dev.allthings.me/o2c.html&state=1



https://accounts.allthings.me/oauth/authorize?client_id=${OAUTH_CLIENT}&scope=user:profile&response_type=token&redirect_uri=${REDIRECT_URL}&state=1

https://accounts.dev.allthings.me/oauth/authorize?response_type=token&redirect_uri=https%3A%2F%2Fapi-doc.dev.allthings.me%2Fo2c.html&realm=your-realms&client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user%3Aprofile&state=allthings_auth


client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user%3Aprofile&state=allthings_auth

#access_token=57f1801c8adabd73a7ba352c06fbf25e48bc0245&state=1


const OAUTH_URL = `https://accounts.allthings.me/oauth/
authorize?client_id=${OAUTH_CLIENT}&scope=user:profile&response_type=token&redirect_uri=${REDIRECT_URL}&state=1`

https://accounts.dev.allthings.me/login?referrer=%2Foauth%2Fauthorize%3F
response_type%3Dtoken%26
redirect_uri%3Dhttps%253A%252F%252Fapi-doc.dev.allthings.me%252Fo2c.html%26realm%3Dyour-realms%26
client_id%3D56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg%26
scope%3Duser%253Aprofile%26state%3Dallthings_auth*/

/*

https://accounts.dev.allthings.me/login?referrer=/oauth/authorize?response_type=token&redirect_uri=https%3A%2F%2Fapi-doc.dev.allthings.me%2Fo2c.html&realm=your-realms&client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user%3Aprofile&state=allthings_auth


https://accounts.dev.allthings.me/oauth/authorize?
response_type=token&redirect_uri=https://api-doc.dev.allthings.me/o2c.html&
realm=your-realms&
client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&
scope=user:profile&state=allthings_auth



https://accounts.dev.allthings.me/oauth/authorize?response_type=token&redirect_uri=https://api-doc.dev.allthings.me/o2c.html&realm=your-realms&client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user:profile&state=allthings_auth
*/
