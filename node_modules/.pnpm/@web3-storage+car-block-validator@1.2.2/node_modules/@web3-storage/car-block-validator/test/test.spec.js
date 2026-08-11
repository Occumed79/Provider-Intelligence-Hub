import test from 'ava'
import * as pb from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { CarWriter, CarBlockIterator } from '@ipld/car'
import { blake2b512 } from '@multiformats/blake2/blake2b'

import { validateBlock, hashMap, HashMismatchError, UnsupportedHashError } from '../src/index.js'

const bytes = pb.encode({ Data: new Uint8Array([1, 2, 3]), Links: [] })

for (const [code, hasher] of hashMap) {
  test(`can validate valid blocks and codecs with codec ${code}`, async t => {
    const hash = await hasher.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create([cid])
    writer.put({ cid, bytes })
    writer.close()

    const reader = await CarBlockIterator.fromIterable(out)

    for await (const block of reader) {
      await validateBlock(block)
    }

    t.truthy(true)
  })

  test(`throws when validating blocks with bad bytes with codec ${code}`, async (t) => {
    const hash = await hasher.digest(bytes)
    const cid = CID.create(1, pb.code, hash)

    const { writer, out } = CarWriter.create([cid])
    bytes[bytes.length - 1] = bytes[bytes.length - 1] + 1 // mangle a byte
    writer.put({ cid, bytes })
    writer.close()

    const reader = await CarBlockIterator.fromIterable(out)

    for await (const block of reader) {
      const err = await t.throwsAsync(async () => validateBlock(block))
      t.true(err instanceof HashMismatchError)
    }
  })
}

test('throws when validating blocks with unsupported hashers', async (t) => {
  const hash = await blake2b512.digest(bytes)
  const cid = CID.create(1, pb.code, hash)

  const { writer, out } = CarWriter.create([cid])
  writer.put({ cid, bytes })
  writer.close()

  const reader = await CarBlockIterator.fromIterable(out)

  for await (const block of reader) {
    const err = await t.throwsAsync(async () => validateBlock(block))
    t.true(err instanceof UnsupportedHashError)
  }
})
