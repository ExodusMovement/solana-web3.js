// @ts-ignore
import { randomBytes } from '@exodus/crypto/randomBytes'
// @ts-ignore
import * as curve25519 from '@exodus/crypto/curve25519';

/**
 * A 64 byte secret key, the first 32 bytes of which is the
 * private scalar and the last 32 bytes is the public key.
 * Read more: https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
 */
type Ed25519SecretKey = Uint8Array;

/**
 * Ed25519 Keypair
 */
export interface Ed25519Keypair {
  publicKey: Uint8Array;
  secretKey: Ed25519SecretKey;
}

export const generatePrivateKey = () => randomBytes(32);

export const generateKeypair = (): Ed25519Keypair => {
  const privateKey = generatePrivateKey();
  const publicKey = curve25519.edwardsToPublicSync({ privateKey });
  const secretKey = new Uint8Array(64);
  secretKey.set(privateKey, 0);
  secretKey.set(publicKey, 32);
  return { publicKey, secretKey };
}

// Input: 32-byte seed
export const getPublicKey = (s: Uint8Array): Uint8Array =>
  curve25519.edwardsToPublicSync({ privateKey: s })

export const sign = (message: Uint8Array, secretKey: Ed25519SecretKey) =>
  curve25519.signDetachedSync({ message, privateKey: secretKey.subarray(0, 32) });

export function verify(
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array,
) {
  return curve25519.verifyDetachedSync({ signature, message, publicKey });
}

// Check that a pubkey is on the curve.
export function isOnCurve(p: Uint8Array) {
  try {
    curve25519.edwardsToMontgomeryPublicSync({ publicKey: p }) // checks public key validity
    return true
  } catch {}
  return false
}
