import qs from 'query-string'

interface IStringMap {
  readonly [key: string]: string | undefined
}

export function getQueryString(obj: IStringMap): string {
  const query = qs.stringify(obj)

  return query ? `?${query}` : ''
}
