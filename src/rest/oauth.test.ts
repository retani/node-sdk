// tslint:disable:no-expression-statement
import {
  getNewTokenUsingImplicitFlow,
  getNewTokenUsingPasswordGrant,
} from './oauth'

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
    ).rejects.toThrow('HTTP 400 — Bad Request. OAuth')

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
      getNewTokenUsingPasswordGrant('foobarHost', '', '', '', ''),
    ).rejects.toThrow('ENOTFOUND')
  })

  it.only('should return a token given valid credentials', async () => {
    // tslint:disable
    var got = require('got')
    got.get = jest.fn()
    got.get.mockReturnValue('hello')
    // tslint:enable

    console.log(got.get())
    //const asd =      'https://accounts.allthings.me/oauth/authorize?client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user:profile&response_type=token&redirect_uri=https://api-doc.dev.allthings.me/#!/Assets47ContactPersons/get_assets_contact_persons&state=1'
    // console.log(global.window)
    const accessToken = await getNewTokenUsingImplicitFlow(
      'https://accounts.allthings.me/oauth',
      process.env.ALLTHINGS_OAUTH_CLIENT_ID as string,
      'https://api-doc.dev.allthings.me/o2c.htm',
    )

    expect(typeof accessToken).toBe('string')
  })
})

/*

https://accounts.allthings.me/oauth/authorize?client_id=56decfea06e2d46b008b456b_33ym85mc88u8o8okcsog8k8k0og8sgowgs48ksggksw84s8gkg&scope=user:profile&state=1&response_type=token&redirect_uri=https://api-doc.dev.allthings.me/o2c.html
https%3A%2F%2Fapi-doc.dev.allthings.me%2Fo2c.html&
*/
