import type { Chunk, ObjectType } from "../metadata.js";
export declare class VLenUTF8 {
    #private;
    readonly kind = "array_to_bytes";
    constructor(shape: number[]);
    static fromConfig(_: unknown, meta: {
        shape: number[];
    }): VLenUTF8;
    encode(_chunk: Chunk<ObjectType>): Uint8Array;
    decode(bytes: Uint8Array): Chunk<ObjectType>;
}
