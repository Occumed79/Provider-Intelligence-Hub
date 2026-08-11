# car-block-validator

> Validate car block bytes with web3.storage supported codecs

[![Build](https://github.com/web3-storage/car-block-validator/actions/workflows/main.yml/badge.svg)](https://github.com/web3-storage/car-block-validator/actions/workflows/main.yml)

`car-block-validator` validates [@ipld/car](https://github.com/ipld/js-car) blocks for the given hashers:

| hashes                                                                                                                          | import                         | repo                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `sha2-256`, `sha2-512`                                                                                                          | `multiformats/hashes/sha2`     | [multiformats/js-multiformats](https://github.com/multiformats/js-multiformats/tree/master/src/hashes)             |
| `sha3-224`, `sha3-256`, `sha3-384`,`sha3-512`, `shake-128`, `shake-256`, `keccak-224`, `keccak-256`, `keccak-384`, `keccak-512` | `@multiformats/sha3`           | [multiformats/js-sha3](https://github.com/multiformats/js-sha3)                                                    |
| `identity`                                                                                                                      | `multiformats/hashes/identity` | [multiformats/js-multiformats](https://github.com/multiformats/js-multiformats/tree/master/src/hashes/identity.js) |
| `murmur3-128`, `murmur3-32`                                                                                                     | `@multiformats/murmur3`        | [multiformats/js-murmur3](https://github.com/multiformats/js-murmur3)                                              |
| `blake2b-*`, `blake2s-*`                                                                                                        | `@multiformats/blake2`         | [multiformats/js-blake2](https://github.com/multiformats/js-blake2)                                                |

## Install

```sh
# install it as a dependency
$ npm i @web3-storage/car-block-validator
```

## Usage

```js
import { validateBlock } from '@web3-storage/car-block-validator'

// Read CAR file as wished
// const inStream = fs.createReadStream(process.argv[2])
// const reader = await CarBlockIterator.fromIterable(inStream)

for await (const block of reader) {
  await validateBlock(block)
  // throws if not valid, either unknown codec or not valid bytes
}
```
