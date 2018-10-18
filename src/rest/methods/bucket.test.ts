// tslint:disable:no-expression-statement
import { readFileSync } from 'fs'
import restClient from '..'

const client = restClient()

const getTestFile = () =>
  readFileSync(__dirname + '/../../../test/fixtures/1x1.png')

describe('bucketCreate()', () => {
  it('should be able to create a bucket', async () => {
    const createBucket = await client.bucketCreate({
      channels: ['Property-123'],
      name: 'Test',
    })
    expect(createBucket.id).not.toBeNull()
  })
})

describe('bucketGet()', () => {
  it('should be able to get a bucket', async () => {
    const createBucket = await client.bucketCreate({
      channels: ['Property-123'],
      name: 'Test',
    })
    expect(createBucket.id).not.toBeNull()
    const bucket = await client.bucketGet(createBucket.id)
    expect(bucket.id).toBe(createBucket.id)
  })

  describe('bucketAddFile() bucketRemoveFile()', () => {
    it('should be able to add a file, then remove it', async () => {
      const createdFile = await client.fileCreate({
        file: getTestFile(),
        name: '2x2.png',
      })
      expect(createdFile.id).not.toBeNull()
      const createBucket = await client.bucketCreate({
        channels: ['Property-123'],
        name: 'Test',
      })
      expect(createBucket.id).not.toBeNull()
      await client.bucketAddFile(createBucket.id, createdFile.id)
      const bucketWithFile = await client.bucketGet(createBucket.id)
      expect(bucketWithFile.files).toContain(createdFile.id)

      await client.bucketRemoveFile(createBucket.id, createdFile.id)
      const bucketWithoutFile = await client.bucketGet(createBucket.id)
      expect(bucketWithoutFile.files).toHaveLength(0)
    })
  })

  describe('bucketRemoveFilesInPath()', () => {
    it('should be able to delete the files in a path', async () => {
      const file1 = await client.fileCreate({
        file: getTestFile(),
        name: '2x2.png',
        path: 'test/',
      })
      const file2 = await client.fileCreate({
        file: getTestFile(),
        name: '1x1.png',
        path: 'test/',
      })
      const file3 = await client.fileCreate({
        file: getTestFile(),
        name: '2x2.png',
      })
      const createBucket = await client.bucketCreate({
        channels: ['Property-123'],
        name: 'Test',
      })

      await client.bucketAddFile(createBucket.id, file1.id)
      await client.bucketAddFile(createBucket.id, file2.id)
      await client.bucketAddFile(createBucket.id, file3.id)

      const bucket = await client.bucketGet(createBucket.id)
      expect(bucket.files).toHaveLength(3)

      await client.bucketRemoveFilesInPath(createBucket.id, {
        path: '/test/',
      })
      const bucketWithoutFile = await client.bucketGet(createBucket.id)
      expect(bucketWithoutFile.files).not.toContain(file1.id)
      expect(bucketWithoutFile.files).not.toContain(file2.id)
      expect(bucketWithoutFile.files).toContain(file3.id)
    })
  })
})
