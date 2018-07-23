import Bottleneck from 'bottleneck'
import * as got from 'got'
import {
  QUEUE_CONCURRENCY,
  QUEUE_DELAY,
  QUEUE_RESERVOIR,
  QUEUE_RESERVOIR_REFILL_INTERVAL,
  REQUEST_BACK_OFF_INTERVAL,
  REQUEST_MAX_RETRIES,
  USER_AGENT,
} from '../constants'
import { until } from '../utils/functional'
import makeLogger from '../utils/logger'
import sleep from '../utils/sleep'
import { getNewTokenUsingPasswordGrant } from './oauth'
import { InterfaceAllthingsRestClientOptions } from './types'

const logger = makeLogger('REST API Request')

export interface IRequestOptions {
  readonly body?: { readonly [key: string]: any }
  readonly query?: { readonly [parameter: string]: string }
}

export type RequestResult = Promise<any>

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
    const interval = setInterval(async () => {
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
function responseWasSuccessful(result: any): boolean {
  return ![503].includes(result.statusCode)
}

/**
 * Perform an API request. The request is passed to the queue from where it is
 * queued and scheduled for execution. When a request fails with a statuCode of 503,
 * the request is retried up to REQUEST_MAX_RETRIES times. Each retry incurrs a wait
 * penalty of retryCount * REQUEST_BACK_OFF_INTERVAL.
 */
function makeApiRequest(
  apiUrl: string,
  httpMethod: string,
  apiMethod: string,
  accessToken: string,
  payload?: IRequestOptions,
): (previousResult: any, iteration: number) => Promise<got.Response<object>> {
  return async (previousResult, retryCount) => {
    if (retryCount > 0) {
      if (retryCount > REQUEST_MAX_RETRIES) {
        const error = `Error: Maximum number of retries reached while retrying ${
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
      await sleep(REQUEST_BACK_OFF_INTERVAL * retryCount)
    }

    try {
      return (
        refillReservoir() &&
        (await queue.schedule(async () =>
          (got as IndexSignature)[httpMethod](`${apiUrl}/api${apiMethod}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'user-agent': USER_AGENT,
            },
            json: true,
            ...payload,
          }),
        ))
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
  httpMethod: string,
  apiMethod: string,
  payload?: IRequestOptions,
): RequestResult {
  // tslint:disable-next-line:no-expression-statement
  logger.log(httpMethod, apiMethod, payload)

  const {
    apiUrl,
    accessToken: maybeAccessToken,
    clientId,
    clientSecret,
    oauthUrl,
    password,
    username,
  } = options

  const accessToken =
    clientId && clientSecret && username && password
      ? await getNewTokenUsingPasswordGrant(
          oauthUrl,
          clientId,
          clientSecret,
          username,
          password,
        )
      : maybeAccessToken

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
    makeApiRequest(apiUrl, httpMethod, apiMethod, accessToken, payload),
  )

  if (result instanceof Error) {
    // tslint:disable-next-line:no-expression-statement
    logger.log(
      'Request Error',
      result,
      // @ts-ignore
      result.response && result.response.body,
      payload,
    )

    throw result
  }

  return result.body
}
