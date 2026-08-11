import { sha256, sha512 } from 'multiformats/hashes/sha2'
import { murmur3128, murmur332 } from '@multiformats/murmur3'
import { blake2b256 } from '@multiformats/blake2/blake2b'
import { blake2s256 } from '@multiformats/blake2/blake2s'
import {
  sha3224,
  sha3256,
  sha3384,
  sha3512,
  shake128,
  shake256,
  keccak224,
  keccak256,
  keccak384,
  keccak512
} from '@multiformats/sha3'
import { equals } from 'uint8arrays/equals'

/**
 * @typedef {object} Block
 * @property {import('multiformats/cid').CID} cid
 * @property {Uint8Array} bytes
 */

/** @type {Map<number, import('multiformats/hashes/interface').MultihashHasher>} */
export const hashMap = new Map(
  [
    sha256, sha512, murmur3128, murmur332, blake2b256, blake2s256,
    sha3224, sha3256, sha3384, sha3512, shake128, shake256,
    keccak224, keccak256, keccak384, keccak512
  ].map(hash => [hash.code, hash])
)

/** The multihash hasher is not supported by this library. */
export class UnsupportedHashError extends Error {
  /** @param {number} code */
  constructor (code) {
    super(`multihash code ${code} is not supported`)
  }
}

/** The bytes did not hash to the same value as the passed multihash. */
export class HashMismatchError extends Error {
  constructor () {
    super('CID hash does not match bytes')
  }
}

/**
 * Validates IPLD block bytes.
 * @param {Block} block
 */
export function validateBlock (block) {
  const hasher = hashMap.get(block.cid.multihash.code)
  if (!hasher) {
    throw new UnsupportedHashError(block.cid.multihash.code)
  }

  const result = hasher.digest(block.bytes)

  /** @param {import('multiformats/hashes/interface').MultihashDigest} h */
  const compareDigests = h => {
    if (!equals(h.digest, block.cid.multihash.digest)) {
      throw new HashMismatchError()
    }
  }

  if (result instanceof Promise) {
    return result.then(compareDigests)
  }

  compareDigests(result)
}
