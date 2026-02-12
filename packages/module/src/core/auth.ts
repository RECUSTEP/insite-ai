import { type RandomReader, generateRandomString } from "@oslojs/crypto/random";

const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes);
  },
};

export function generateId() {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return generateRandomString(random, alphabet, 32);
}
