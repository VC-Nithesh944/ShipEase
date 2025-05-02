// Backend/rsa_signature.js
const crypto = require('crypto'); // Using built-in crypto for SHA-256 for demonstration (you might need to implement a simpler hash if strictly no built-ins are allowed for any part)
// const { encrypt, decrypt } = require('./rsa_crypto'); // Reuse RSA for signing/verification
const { generateKeys, encrypt, decrypt, signWithPrivateKey } = require('./rsa_crypto');

function simpleHash(data) {
  // A very basic and insecure hashing function for demonstration
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash * 31 + data.charCodeAt(i)) % 1000000; // Modulo to keep it manageable
  }
  return hash.toString();
}


function sign(privateKey, data) {
  const hash = simpleHash(data);
  return signWithPrivateKey(privateKey, hash);
}

function verify(publicKey, data, signature) {
  const originalHash = simpleHash(data);
  const decryptedSignature = decrypt(publicKey, signature);
  return originalHash === decryptedSignature;
}

module.exports = { sign, verify };