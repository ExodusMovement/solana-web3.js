// @ts-ignore
import * as secp256k1 from '@exodus/crypto/secp256k1'

export const ecdsaSign = (
  msgHash: Uint8Array | Buffer,
  privKey: Uint8Array | Buffer,
) => {
  const { signature, recovery } = secp256k1.ecdsaSignHashSync({
    hash: msgHash,
    priateKey: privKey,
    recovery: true
  })
  return [signature, recovery]
};
export const isValidPrivateKey = (privateKey: Uint8Array | Buffer) =>
  secp256k1.privateKeyIsValid({ privateKey });

export const publicKeyCreate = (privateKey: Uint8Array | Buffer, compressed: boolean) =>
  secp256k1.privateKeyToPublicKey({ privateKey, compressed });
