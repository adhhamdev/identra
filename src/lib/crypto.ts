import { gcm } from '@noble/ciphers/aes.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha512 } from '@noble/hashes/sha2.js';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { Buffer } from 'buffer';
import * as Crypto from 'expo-crypto';

/**
 * Generates a new 12-word recovery phrase (BIP-39 mnemonic)
 * Uses expo-crypto for secure native entropy
 */
export function generateMnemonic(): string {
  // 12 words = 128 bits of entropy
  const entropy = Crypto.getRandomBytes(16);
  return bip39.entropyToMnemonic(entropy, wordlist);
}

/**
 * Validates a recovery phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  try {
    return bip39.validateMnemonic(mnemonic.trim().toLowerCase(), wordlist);
  } catch (e) {
    return false;
  }
}

/**
 * Derives a 32-byte Master Key from the recovery phrase
 * Uses PBKDF2-HMAC-SHA512 with 100k iterations
 */
export async function deriveKeyFromMnemonic(
  mnemonic: string,
  salt: string = 'identra-fixed-salt'
): Promise<Uint8Array> {
  const seed = await bip39.mnemonicToSeed(mnemonic.trim().toLowerCase());

  // PBKDF2 derivation
  const key = pbkdf2(sha512, seed, salt, {
    c: 100000, // High iterations for security
    dkLen: 32, // 256-bit key
  });

  return key;
}

/**
 * Encrypts a string using AES-256-GCM
 */
export async function encryptText(
  text: string,
  key: Uint8Array
): Promise<string> {
  const nonce = Crypto.getRandomBytes(12); // GCM standard 96-bit nonce
  const data = new TextEncoder().encode(text);

  const aes = gcm(key, nonce);
  const ciphertext = aes.encrypt(data);

  // Combine nonce + ciphertext (tag is included in ciphertext by Noble)
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);

  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypts a base64 string
 */
export async function decryptText(
  base64: string,
  key: Uint8Array
): Promise<string> {
  if (!base64 || base64.length < 32) return base64; // GCM min length (nonce 12 + tag 16) is 28 bytes, approx 38 chars base64

  try {
    const combined = Buffer.from(base64, 'base64');
    if (combined.length < 28) return base64;

    const nonce = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const aes = gcm(key, nonce);
    const decrypted = aes.decrypt(ciphertext);

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.warn('Decryption failed, returning original text', e);
    return base64;
  }
}

/**
 * Encrypts a binary blob (Uint8Array)
 */
export async function encryptFile(
  data: Uint8Array,
  key: Uint8Array
): Promise<Uint8Array> {
  const nonce = Crypto.getRandomBytes(12);
  const aes = gcm(key, nonce);
  const ciphertext = aes.encrypt(data);

  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);

  return combined;
}

/**
 * Decrypts a binary blob
 */
export async function decryptFile(
  data: Uint8Array,
  key: Uint8Array
): Promise<Uint8Array> {
  const nonce = data.slice(0, 12);
  const ciphertext = data.slice(12);

  const aes = gcm(key, nonce);
  return aes.decrypt(ciphertext);
}
