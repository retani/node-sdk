import { version } from '../package.json'
import { InterfaceAllthingsRestClientOptions } from './rest/types'

const REST_API_URL = 'https://api.allthings.me'
const OAUTH_URL = 'https://accounts.allthings.me'

// Queue scheduling options
export const QUEUE_CONCURRENCY = undefined
export const QUEUE_DELAY = 0
export const QUEUE_RESERVOIR = 30
export const QUEUE_RESERVOIR_REFILL_INTERVAL = 500

// Request error handling options
export const REQUEST_BACK_OFF_INTERVAL = 200
export const REQUEST_MAX_RETRIES = 50

// Default options passed to the api wrapper on instansiation
export const DEFAULT_API_WRAPPER_OPTIONS: InterfaceAllthingsRestClientOptions = {
  apiUrl: process.env.ALLTHINGS_REST_API_URL || REST_API_URL,
  clientId: process.env.ALLTHINGS_OAUTH_CLIENT_ID,
  clientSecret: process.env.ALLTHINGS_OAUTH_CLIENT_SECRET,
  oauthUrl: process.env.ALLTHINGS_OAUTH_URL || OAUTH_URL,
  password: process.env.ALLTHINGS_OAUTH_PASSWORD,
  requestBackOffInterval: REQUEST_BACK_OFF_INTERVAL,
  requestMaxRetries: REQUEST_MAX_RETRIES,
  scope: 'user:profile',
  state: '1',
  username: process.env.ALLTHINGS_OAUTH_USERNAME,
}

export const USER_AGENT = `Allthings Node SDK REST Client/${version}`
