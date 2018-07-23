import { MethodHttpPost } from '../post'

export interface IApp {
  readonly id: string
  readonly name: string
  readonly siteUrl: string
}

export type PartialApp = Partial<IApp>

export type CreateAppResult = Promise<IApp>

export type MethodCreateApp = (
  userId: string,
  data: PartialApp & {
    readonly name: string
    readonly siteUrl: string
  },
) => CreateAppResult

// @TODO: this is very much incomplete.
export async function createApp(
  post: MethodHttpPost,
  userId: string,
  data: PartialApp & {
    readonly name: string
    readonly siteUrl: string
  },
): CreateAppResult {
  return post(`/v1/users/${userId}/apps`, {
    availableLocales: { '0': 'de_DE' },
    contactEmail: 'no-reply@allthings.me',
    fromEmailAddress: 'no-reply@alltings.me',
    ...data,
    siteUrl: data.siteUrl.replace('_', ''),
  })
}
