import Bottleneck from 'bottleneck'
import fetch from 'cross-fetch'
import querystring from 'query-string'
import {
  QUEUE_CONCURRENCY,
  QUEUE_DELAY,
  QUEUE_RESERVOIR,
  QUEUE_RESERVOIR_REFILL_INTERVAL,
  USER_AGENT,
} from '../constants'
import { until } from '../utils/functional'
import makeLogger from '../utils/logger'
import sleep from '../utils/sleep'
import {
  getNewTokenUsingImplicitFlow,
  getNewTokenUsingPasswordGrant,
} from './oauth'
import { InterfaceAllthingsRestClientOptions } from './types'

const logger = makeLogger('REST API Request')

export interface IRequestOptions {
  readonly body?: { readonly [key: string]: any }
  readonly query?: { readonly [parameter: string]: string }
}

export type RequestResult = Promise<any>

export type HttpVerb = 'delete' | 'get' | 'head' | 'patch' | 'post' | 'put'

export type MethodHttpRequest = (
  httpMethod: string,
  apiMethod: string,
  payload?: IRequestOptions,
) => RequestResult

const queue = new Bottleneck({
  maxConcurrent: QUEUE_CONCURRENCY,
  minTime: QUEUE_DELAY,
  reservoir: QUEUE_RESERVOIR,
})

export type IntervalSet = Set<NodeJS.Timer>

const refillIntervalSet: IntervalSet = new Set()

/**
 * refillReservoir() refills the queue's reservoir
 * at a rate of 1 every QUEUE_RESERVOIR_REFILL_INTERVAL
 * Caution: if the job's weight is greater than 1, it's possible that the
 * reservoir never gets depleted, but the job with weight 2 never runs.
 * Effectively, only weight of 1 is supported.
 */
function refillReservoir(): IntervalSet {
  if (refillIntervalSet.size === 0) {
    const interval: NodeJS.Timer = setInterval(async () => {
      const reservoir = (await queue.currentReservoir()) as number

      if (queue.empty() && (await queue.running()) === 0 && reservoir > 10) {
        return (
          queue.incrementReservoir(1) &&
          !clearInterval(interval) &&
          refillIntervalSet.delete(interval)
        )
      }

      return reservoir < QUEUE_RESERVOIR
        ? queue.incrementReservoir(1)
        : !clearInterval(interval) && refillIntervalSet.delete(interval)
    }, QUEUE_RESERVOIR_REFILL_INTERVAL)

    return refillIntervalSet.add(interval)
  }

  return refillIntervalSet
}

/**
 * Determine if the result was successful. Here, successful means
 * _not_ a 503 error.
 */
export function responseWasSuccessful(response: any): boolean {
  return ![503].includes(response.status)
}

/**
 * Perform an API request. The request is passed to the queue from where it is
 * queued and scheduled for execution. When a request fails with a statuCode of 503,
 * the request is retried up to REQUEST_MAX_RETRIES times. Each retry incurrs a wait
 * penalty of retryCount * REQUEST_BACK_OFF_INTERVAL.
 */
export function makeApiRequest(
  options: InterfaceAllthingsRestClientOptions,
  httpMethod: HttpVerb,
  apiUrl: string,
  apiMethod: string,
  accessToken: string,
  payload?: IRequestOptions,
): (previousResult: any, iteration: number) => Promise<Response> {
  return async (previousResult, retryCount) => {
    if (retryCount > 0) {
      if (retryCount > options.requestMaxRetries) {
        const error = `Maximum number of retries reached while retrying ${
          previousResult.method
        } request ${previousResult.path}.`

        // tslint:disable-next-line:no-expression-statement
        logger.error(error)

        throw new Error(error)
      }

      // tslint:disable-next-line:no-expression-statement
      logger.warn(
        `Warning: encountered ${previousResult.statusCode}. Retrying ${
          previousResult.method
        } request ${previousResult.path} (retry #${retryCount}).`,
      )

      // disabling linter here for better readabiliy
      // tslint:disable-next-line:no-expression-statement
      await sleep(options.requestBackOffInterval * 2 ** retryCount)
    }

    try {
      return (
        refillReservoir() &&
        (await queue.schedule(async () => {
          const url = `${apiUrl}/api${apiMethod}${
            payload && payload.query
              ? '?' + querystring.stringify(payload.query)
              : ''
          }`

          const response = await fetch(url, {
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              accept: 'application/json',
              'user-agent': USER_AGENT,
            },
            method: httpMethod.toUpperCase(),
            mode: 'cors',
            ...(payload &&
              payload.body && { body: JSON.stringify(payload.body) }),
          })

          // Retry 503s as it was likely a rate-limited request
          if (response.status === 503) {
            return response
          }

          if (!response.ok) {
            return new Error(`${response.status} ${response.statusText}`)
          }

          // The API only returns JSON, so if it's something else there was
          // probably an error.
          if (
            response.headers.get('content-type') !== 'application/json' &&
            response.status !== 204
          ) {
            return new Error(
              `Response content type was "${response.headers.get(
                'content-type',
              )}" but expected JSON`,
            )
          }

          return {
            body: response.status === 204 ? '' : await response.json(),
            statusCode: response.status,
          }
        }))
      )
    } catch (error) {
      return error
    }
  }
}

/**
 * Perform a request. If an access token is not provided, or has not previously been
 * fetched, a new one will be retrieved from the Accounts OAuth token service. The token
 * is reused on subsequent requests.
 */
export default async function request(
  options: InterfaceAllthingsRestClientOptions,
  httpMethod: HttpVerb,
  apiMethod: string,
  payload?: IRequestOptions,
): RequestResult {
  // tslint:disable-next-line:no-expression-statement
  logger.log(httpMethod, apiMethod, payload)

  const { apiUrl, accessToken: maybeAccessToken } = options

  const accessToken =
    maybeAccessToken ||
    (typeof window !== 'undefined'
      ? await getNewTokenUsingImplicitFlow(options)
      : await getNewTokenUsingPasswordGrant(options))

  if (!accessToken) {
    throw new Error('Issue getting OAuth2 authentication token.')
  }

  /*
    Make the API request. If the response was a 503, we retry the request
    while backing off exponentially +REQUEST_BACK_OFF_INTERVAL milliseconds
    on each retry until we reach REQUEST_MAX_RETRIES at which point throw an error.
  */
  const result = await until(
    responseWasSuccessful,
    makeApiRequest(
      options,
      httpMethod,
      apiUrl,
      apiMethod,
      accessToken,
      payload,
    ),
  )

  if (result instanceof Error) {
    // tslint:disable-next-line:no-expression-statement
    logger.log('Request Error', result, payload)

    throw result
  }

  return result.body
}
