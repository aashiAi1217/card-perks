import sharp from 'sharp'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1b1d26"/><stop offset="1" stop-color="#0b0c10"/></linearGradient>
  <linearGradient id="c" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f4d58d"/><stop offset="1" stop-color="#c9962e"/></linearGradient></defs>
  <rect width="512" height="512" rx="110" fill="url(#g)"/>
  <rect x="96" y="150" width="320" height="212" rx="28" fill="url(#c)"/>
  <rect x="96" y="200" width="320" height="40" fill="#0b0c10" opacity="0.85"/>
  <circle cx="356" cy="312" r="26" fill="#0b0c10" opacity="0.85"/>
  <path d="M341 312 l10 10 l22 -24" stroke="#f4d58d" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
await sharp(Buffer.from(svg)).png().toFile('public/icon.png')
console.log('public/icon.png written')
