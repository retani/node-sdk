import qs from 'query-string'

interface IStringMap {
  readonly [key: string]: any
}

export function getQueryString(obj: IStringMap): string {
  const query = qs.stringify(obj)

  return query ? `?${query}` : ''
}
