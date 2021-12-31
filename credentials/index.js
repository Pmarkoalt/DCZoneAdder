require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function encrypt(path) {
  const input = fs.readFileSync(path);
  const key = ENCRYPTION_KEY ? Buffer.from(ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([iv, cipher.update(input), cipher.final()]);
  fs.writeFileSync('./credentials/service-key', encrypted);

  return {key: key.toString('hex')};
}

function decrypt(inputPath) {
  let chunk = fs.readFileSync(inputPath);
  const iv = chunk.slice(0, 16);
  chunk = chunk.slice(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return Buffer.concat([decipher.update(chunk), decipher.final()]);
}

function decryptServiceKey() {
  const buffer = decrypt('./credentials/service-key');
  return JSON.parse(buffer.toString('utf8'));
}

module.exports = {
  decryptServiceKey,
};
