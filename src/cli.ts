#!/usr/bin/env node
// tslint:disable: no-console no-expression-statement object-literal-sort-keys
import { restSdk } from './'

// @TODO

export async function main(): Promise<void> {
  const [, , action, ...args] = process.argv
  const restClient = restSdk()
  console.log('\n\n', args)

  if (action === 'list-active-users') {
    // @TODO
    // const [appId] = args
    // console.log(await restClient.getActiveUsers(appId))
    console.log(await restClient.getCurrentUser())
  } else {
    console.log('Please provide an action to perform.')
  }

  console.log('\n\n')
  /*

  */
}

// tslint:disable-next-line
main().catch(console.error) // ¯\_(ツ)_/¯
