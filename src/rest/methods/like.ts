import { IUser } from './user'

// @TODO: get this from types file once it's merged
interface IGenericLink {
  readonly href: string
}

export interface ILikeCollection {
  readonly page: number
  readonly limit: number
  readonly pages: number
  readonly total: number
  readonly metaData: ReadonlyArray<any> // @TODO
  readonly _links: {
    readonly self: IGenericLink
    readonly first: IGenericLink
    readonly last: IGenericLink
  }
  readonly _embedded: {
    readonly items: ReadonlyArray<IUser>
  }
}

export type LikeCollectionResult = Promise<ILikeCollection>
