import { InterfaceAllthingsRestClientOptions } from './rest/types'

export const API_OAUTH_URL =
  process.env.ALLTHINGS_OAUTH_URL || 'https://accounts.allthings.me/oauth/token'

export const REST_API_URL =
  process.env.ALLTHINGS_REST_API_URL || 'https://api.allthings.me/api/v1'

// Queue scheduling options
export const QUEUE_CONCURRENCY = undefined
export const QUEUE_DELAY = 0
export const QUEUE_RESERVOIR = 30
export const QUEUE_RESERVOIR_REFILL_INTERVAL = 500

// Request error handling options
export const REQUEST_BACK_OFF_INTERVAL = 500
export const REQUEST_MAX_RETRIES = 50

// Default options passed to the api wrapper on instansiation
export const DEFAULT_API_WRAPPER_OPTIONS: InterfaceAllthingsRestClientOptions = {
  clientId: process.env.ALLTHINGS_OAUTH_CLIENT_ID,
  clientSecret: process.env.ALLTHINGS_OAUTH_CLIENT_SECRET,
  password: process.env.ALLTHINGS_OAUTH_PASSWORD,
  username: process.env.ALLTHINGS_OAUTH_USERNAME,
}

export const USER_AGENT = `Allthings Node REST SDK/${
  // tslint:disable-next-line no-var-requires
  require('../package.json').version // less than ideal hack
}`
