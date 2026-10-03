// O'rnatish videosini render qiladi: node render-install.js ios|and
// 1080×1920, 30 fps -> ffmpeg (H.264) + sintez qilingan ovoz -> video/LUSSO-<Qurilma>-ornatish.mp4
const path = require('path'), fs = require('fs');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const DEV = process.argv[2] === 'and' ? 'and' : 'ios';
const NAME = DEV === 'and' ? 'Samsung' : 'iPhone';
const FPS = 30;
const BUILD = path.join(__dirname, 'build');
fs.mkdirSync(BUILD, { recursive: true });

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => { console.error('XATO', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, `stage/index.html?scene=install&dev=${DEV}`));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  const D = await p.evaluate(() => DURATION);
  fs.writeFileSync(path.join(BUILD, `events-${DEV}.json`), JSON.stringify(await p.evaluate(() => EVENTS)));
  const N = Math.round(D * FPS);
  const silent = path.join(BUILD, `silent-${DEV}.mp4`);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) {
    await p.evaluate((t) => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`kadr ${f}/${N}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close();

  const wav = path.join(BUILD, `audio-${DEV}.wav`);
  execFileSync('node', [path.join(__dirname, 'audio.js'), path.join(BUILD, `events-${DEV}.json`), wav], { stdio: 'inherit' });
  const out = path.join(__dirname, `LUSSO-${NAME}-ornatish.mp4`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  console.log('✓', out);
})();
