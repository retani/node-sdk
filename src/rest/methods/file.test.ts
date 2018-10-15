// tslint:disable:no-expression-statement
import { readFileSync } from 'fs'
import restClient from '..'

const client = restClient()

describe('fileCreate(), fileDelete()', () => {
  it('should be able to upload a new file, and then remove it', async () => {
    const createdFile = await client.fileCreate(
      readFileSync(__dirname + '/1x1.png'),
      '2x2.png',
      'deers/',
    )
    expect(createdFile.name).toEqual('2x2.png')
    expect(createdFile.type).toEqual('image/png')
    expect(createdFile.path).toEqual('deers')
    const deleteFile = await client.fileDelete(createdFile.id)
    expect(deleteFile).toBe('')
  })
})
