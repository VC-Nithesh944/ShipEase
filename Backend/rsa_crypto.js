// Backend/rsa_crypto.js


function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }
  
  function gcd(a, b) {
    while (b) {
      a %= b;
      [a, b] = [b, a];
    }
    return a;
  }
  
  function extendedEuclideanAlgorithm(a, b) {
    if (a === 0) {
      return [b, 0, 1];
    }
    const [g, x1, y1] = extendedEuclideanAlgorithm(b % a, a);
    const x = y1 - Math.floor(b / a) * x1;
    const y = x1;
    return [g, x, y];
  }
  
  function modInverse(a, m) {
    const [g, x] = extendedEuclideanAlgorithm(a, m);
    if (g !== 1) {
      throw new Error('Modular inverse does not exist');
    }
    return (x % m + m) % m;
  }
  
  function generateKeys() {
    // Choose two distinct prime numbers p and q
    let p = 61; // For simplicity in this example
    let q = 53; // For simplicity in this example
    const n = p * q;
    const phi = (p - 1) * (q - 1);
  
    // Choose an integer e such that 1 < e < phi and gcd(e, phi) = 1
    const e = 17; // For simplicity
  
    // Compute d as the modular multiplicative inverse of e modulo phi
    const d = modInverse(e, phi);
  
    const publicKey = { n, e };
    const privateKey = { n, d };
  
    return { publicKey, privateKey };
  }

  function signWithPrivateKey(privateKey, message) {
    let signedMessage = '';
    for (let i = 0; i < message.length; i++) {
      signedMessage += encryptChar({ n: privateKey.n, e: privateKey.d }, message[i]) + ',';
    }
    return signedMessage.slice(0, -1);
  }

  function encryptChar(publicKey, char) {
    const { n, e } = publicKey;
    const charCode = char.charCodeAt(0);
    let m = BigInt(charCode);
    let exp = BigInt(e);
    const mod = BigInt(n);
    let result = 1n;
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * m) % mod;
      }
      m = (m * m) % mod;
      exp /= 2n;
    }
    return result.toString();
  }
  
  function decryptChar(privateKey, ciphertext) {
    const { n, d } = privateKey;
    const c = BigInt(ciphertext);
    const exp = BigInt(d);
    const mod = BigInt(n);
    let result = 1n;
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * c) % mod;
      }
      c = (c * c) % mod;
      exp /= 2n;
    }
    return String.fromCharCode(Number(result));
  }
  
  function encrypt(publicKey, message) {
    let encryptedMessage = '';
    for (let i = 0; i < message.length; i++) {
      encryptedMessage += encryptChar(publicKey, message[i]) + ','; // Separate encrypted characters
    }
    return encryptedMessage.slice(0, -1); // Remove the trailing comma
  }
  
  function decrypt(privateKey, ciphertext) {
    const encryptedChars = ciphertext.split(',');
    let decryptedMessage = '';
    for (const char of encryptedChars) {
      decryptedMessage += decryptChar(privateKey, char);
    }
    return decryptedMessage;
  }
  
  module.exports = { generateKeys, encrypt, decrypt,signWithPrivateKey };