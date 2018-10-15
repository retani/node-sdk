// tslint:disable:no-expression-statement
import { readFileSync } from 'fs'
import restClient from '..'

const client = restClient()

describe('bucketCreate()', () => {
  it('should be able to create a bucket', async () => {
    const createBucket = await client.bucketCreate(['Property-123'], 'Test')
    expect(createBucket.id).not.toBeNull()
  })
})

describe('bucketGet()', () => {
  it('should be able to get a bucket', async () => {
    const createBucket = await client.bucketCreate(['Property-123'], 'Test')
    expect(createBucket.id).not.toBeNull()
    const bucket = await client.bucketGet(createBucket.id)
    expect(bucket.id).toBe(createBucket.id)
  })

  describe('bucketAddFile() bucketDeleteFile()', () => {
    it('should be able to add a file, then remove it', async () => {
      const createdFile = await client.fileCreate(
        readFileSync(__dirname + '/1x1.png'),
        '2x2.png',
      )
      expect(createdFile.id).not.toBeNull()
      const createBucket = await client.bucketCreate(['Property-123'], 'Test')
      expect(createBucket.id).not.toBeNull()
      await client.bucketAddFile(createBucket.id, createdFile.id)
      const bucketWithFile = await client.bucketGet(createBucket.id)
      expect(bucketWithFile.files.indexOf(createdFile.id)).toBe(0)

      await client.bucketDeleteFile(createBucket.id, createdFile.id)
      const bucketWithoutFile = await client.bucketGet(createBucket.id)
      expect(bucketWithoutFile.files.length).toBe(0)
    })
  })

  describe('bucketDeleteFilesInPath()', () => {
    it('should be able to delete the files in a path', async () => {
      const file1 = await client.fileCreate(
        readFileSync(__dirname + '/1x1.png'),
        '2x2.png',
        'test/',
      )
      const file2 = await client.fileCreate(
        readFileSync(__dirname + '/1x1.png'),
        '1x1.png',
        'test/',
      )
      const file3 = await client.fileCreate(
        readFileSync(__dirname + '/1x1.png'),
        '2x2.png',
      )
      const createBucket = await client.bucketCreate(['Property-123'], 'Test')

      await client.bucketAddFile(createBucket.id, file1.id)
      await client.bucketAddFile(createBucket.id, file2.id)
      await client.bucketAddFile(createBucket.id, file3.id)

      const bucket = await client.bucketGet(createBucket.id)
      expect(bucket.files.length).toBe(3)

      await client.bucketDeleteFilesInPath(createBucket.id, '/test/')
      const bucketWithoutFile = await client.bucketGet(createBucket.id)
      expect(bucketWithoutFile.files.indexOf(file1.id)).toBe(-1)
      expect(bucketWithoutFile.files.indexOf(file2.id)).toBe(-1)
      expect(bucketWithoutFile.files.indexOf(file3.id)).toBe(0)
    })
  })
})
