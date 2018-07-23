// tslint:disable:no-expression-statement
import { getNewTokenUsingPasswordGrant } from './oauth'

describe('getNewTokenUsingPasswordGrant()', () => {
  it('should return a token given valid credentials', async () => {
    const accessToken = await getNewTokenUsingPasswordGrant(
      process.env.ALLTHINGS_OAUTH_CLIENT_ID as string,
      process.env.ALLTHINGS_OAUTH_CLIENT_SECRET as string,
      process.env.ALLTHINGS_OAUTH_USERNAME as string,
      process.env.ALLTHINGS_OAUTH_PASSWORD as string,
    )

    expect(typeof accessToken).toBe('string')
  })

  it('should return undefined given invalid credentials', async () => {
    await expect(getNewTokenUsingPasswordGrant('', '', '', '')).rejects.toThrow(
      'HTTP 400 — Bad Request',
    )
  })
})
