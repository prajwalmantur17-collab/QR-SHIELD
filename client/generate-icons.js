import fs from 'fs';
import path from 'path';

// Valid 1x1 transparent PNG buffer or simple colored PNG
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const buf = Buffer.from(pngBase64, 'base64');

const publicDir = path.resolve('client/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), buf);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), buf);
console.log('Icons generated successfully');
