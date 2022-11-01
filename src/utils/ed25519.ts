import nacl from 'tweetnacl';

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

//export const generatePrivateKey = ed25519.utils.randomPrivateKey;
export const generatePrivateKey = () =>
  nacl.sign.keyPair().secretKey.slice(0, 32);

export const generateKeypair = (): Ed25519Keypair => nacl.sign.keyPair();
// export const getPublicKey = ed25519.sync.getPublicKey;
export const getPublicKey = (s: Uint8Array) =>
  nacl.sign.keyPair.fromSeed(s).publicKey;
// export function isOnCurve(publicKey: Uint8Array): boolean { // TODO
//   try {
//     ed25519.Point.fromHex(publicKey, true /* strict */);
//     return true;
//   } catch {
//     return false;
//   }
// }
export const sign = (message: Uint8Array, secretKey: Ed25519SecretKey) =>
  nacl.sign.detached(message, secretKey);
//export const verify = ed25519.sync.verify;
export function verify(
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array,
) {
  return nacl.sign.detached.verify(message, signature, publicKey);
}

// @ts-ignore
let naclLowLevel = nacl.lowlevel;

// Check that a pubkey is on the curve.
// This function and its dependents were sourced from:
// https://github.com/dchest/tweetnacl-js/blob/f1ec050ceae0861f34280e62498b1d3ed9c350c6/nacl.js#L792
export function isOnCurve(p: Uint8Array) {
  var r = [
    naclLowLevel.gf(),
    naclLowLevel.gf(),
    naclLowLevel.gf(),
    naclLowLevel.gf(),
  ];

  var t = naclLowLevel.gf(),
    chk = naclLowLevel.gf(),
    num = naclLowLevel.gf(),
    den = naclLowLevel.gf(),
    den2 = naclLowLevel.gf(),
    den4 = naclLowLevel.gf(),
    den6 = naclLowLevel.gf();

  naclLowLevel.set25519(r[2], gf1);
  naclLowLevel.unpack25519(r[1], p);
  naclLowLevel.S(num, r[1]);
  naclLowLevel.M(den, num, naclLowLevel.D);
  naclLowLevel.Z(num, num, r[2]);
  naclLowLevel.A(den, r[2], den);

  naclLowLevel.S(den2, den);
  naclLowLevel.S(den4, den2);
  naclLowLevel.M(den6, den4, den2);
  naclLowLevel.M(t, den6, num);
  naclLowLevel.M(t, t, den);

  naclLowLevel.pow2523(t, t);
  naclLowLevel.M(t, t, num);
  naclLowLevel.M(t, t, den);
  naclLowLevel.M(t, t, den);
  naclLowLevel.M(r[0], t, den);

  naclLowLevel.S(chk, r[0]);
  naclLowLevel.M(chk, chk, den);
  if (neq25519(chk, num)) naclLowLevel.M(r[0], r[0], I);

  naclLowLevel.S(chk, r[0]);
  naclLowLevel.M(chk, chk, den);
  if (neq25519(chk, num)) return false;
  return true;
}
let gf1 = naclLowLevel.gf([1]);
let I = naclLowLevel.gf([
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7,
  0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83,
]);
function neq25519(a: any, b: any) {
  var c = new Uint8Array(32),
    d = new Uint8Array(32);
  naclLowLevel.pack25519(c, a);
  naclLowLevel.pack25519(d, b);
  return naclLowLevel.crypto_verify_32(c, 0, d, 0);
}
