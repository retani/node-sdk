// tslint:disable:no-expression-statement

// tslint:disable no-object-mutation
process.env.DEBUG = process.env.DEBUG || 'Handler Helper'

process.env.ALLTHINGS_OAUTH_CLIENT_ID =
  process.env.ALLTHINGS_OAUTH_CLIENT_ID || ''
process.env.ALLTHINGS_OAUTH_CLIENT_SECRET =
  process.env.ALLTHINGS_OAUTH_CLIENT_SECRET || ''
process.env.ALLTHINGS_OAUTH_USERNAME =
  process.env.ALLTHINGS_OAUTH_USERNAME || ''
process.env.ALLTHINGS_OAUTH_PASSWORD =
  process.env.ALLTHINGS_OAUTH_PASSWORD || ''

process.env.ALLTHINGS_REST_API_URL = 'https://api.dev.allthings.me'
process.env.ALLTHINGS_OAUTH_URL = 'https://accounts.dev.allthings.me'
// tslint:enable no-object-mutation

jest.setTimeout(1000 * 60 * 5)
