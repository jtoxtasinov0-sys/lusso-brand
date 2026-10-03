// Kodda sintez qilingan musiqa va ovoz effektlari (mualliflik huquqi muammosi yo'q).
// Premium, sokin: iliq pad akkordlar, yumshoq elektro-pianino arpedjio, past bas,
// juda yengil ritm. Effektlar videodagi voqealarga (events.json) moslab qo'yiladi.
// Foydalanish: node audio.js build/events-ios.json build/audio-ios.wav
const fs = require('fs');

const EV = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3];
const SR = 44100, DUR = EV.dur, N = Math.round(SR * DUR);
const TAU = Math.PI * 2;

const mk = () => [new Float32Array(N), new Float32Array(N)];
const music = mk(), musicVerb = mk(), sfx = mk(), sfxVerb = mk();
const duck = new Float32Array(N).fill(1);

let seed = 20261003;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function add(buf, send, i, l, r, amt) {
  if (i < 0 || i >= N) return;
  buf[0][i] += l; buf[1][i] += r;
  if (send) { send[0][i] += l * amt; send[1][i] += r * amt; }
}

/* ---------------- cholg'ular ---------------- */
// iliq pad: bir-biridan sal farqli 3 ovoz, sekin kirish
function pad(t0, dur, midi, vel) {
  const f = mtof(midi), att = 1.4, len = dur + 1.8;
  const det = [-0.09, 0, 0.1], pan = [0.22, 0.5, 0.78];
  const i0 = Math.round(t0 * SR);
  for (let k = 0; k < len * SR; k++) {
    const t = k / SR;
    let env = Math.min(1, t / att);
    if (t > dur) env *= Math.exp(-(t - dur) * 2.6);
    const trem = 1 + 0.06 * Math.sin(TAU * 0.25 * t);
    let l = 0, r = 0;
    for (let v = 0; v < 3; v++) {
      const ff = f * Math.pow(2, det[v] / 12);
      const s = Math.sin(TAU * ff * t + v) + 0.32 * Math.sin(TAU * 2 * ff * t + v * 2) + 0.12 * Math.sin(TAU * 3 * ff * t) + 0.05 * Math.sin(TAU * 4 * ff * t);
      l += s * (1 - pan[v]); r += s * pan[v];
    }
    const g = vel * env * trem * 0.045;
    add(music, musicVerb, i0 + k, l * g, r * g, 0.95);
  }
}

// elektro-pianino / qo'ng'iroq (2 operatorli FM)
function pluck(buf, send, t0, midi, vel, pn = 0.5, bright = 1, decay = 2.6, amt = 0.6) {
  const f = mtof(midi), i0 = Math.round(t0 * SR);
  for (let k = 0; k < 3.0 * SR; k++) {
    const t = k / SR;
    const env = Math.exp(-t * decay) * Math.min(1, t / 0.004);
    const idx = bright * 1.9 * Math.exp(-t * 6);
    const s = Math.sin(TAU * f * t + idx * Math.sin(TAU * f * t)) + 0.2 * Math.sin(TAU * 2 * f * t) * Math.exp(-t * 5);
    const g = vel * env;
    add(buf, send, i0 + k, s * g * (1 - pn) * 2, s * g * pn * 2, amt);
  }
}

function bass(t0, dur, midi, vel) {
  const f = mtof(midi), i0 = Math.round(t0 * SR);
  for (let k = 0; k < (dur + 0.4) * SR; k++) {
    const t = k / SR;
    let env = Math.min(1, t / 0.03) * Math.exp(-t * 0.7);
    if (t > dur) env *= Math.exp(-(t - dur) * 10);
    const s = Math.tanh(1.4 * (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t)));
    add(music, null, i0 + k, s * env * vel, s * env * vel, 0);
  }
}

function kick(t0, vel) {
  let ph = 0; const i0 = Math.round(t0 * SR);
  for (let k = 0; k < 0.45 * SR; k++) {
    const t = k / SR, f = 46 + 80 * Math.exp(-t * 30);
    ph += TAU * f / SR;
    const s = Math.sin(ph) * Math.exp(-t * 8) * vel;
    add(music, null, i0 + k, s, s, 0);
    if (i0 + k < N) duck[i0 + k] = Math.min(duck[i0 + k], 1 - 0.35 * Math.exp(-t * 6));
  }
}

function noise(buf, send, t0, vel, fc, q, decay, len, pn = 0.5, amt = 0.3, high = false) {
  let low = 0, band = 0; const i0 = Math.round(t0 * SR);
  const fq = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR);
  for (let k = 0; k < len * SR; k++) {
    const t = k / SR, x = rnd();
    low += fq * band; const hp = x - low - q * band; band += fq * hp;
    const s = (high ? hp : band) * Math.exp(-t * decay) * vel;
    add(buf, send, i0 + k, s * (1 - pn) * 2, s * pn * 2, amt);
  }
}

/* ---------------- effektlar ---------------- */
function swoosh(t0, dur, f0, f1, vel, p0 = 0.3, p1 = 0.7) {
  let low = 0, band = 0; const i0 = Math.round(t0 * SR);
  for (let k = 0; k < dur * SR; k++) {
    const t = k / SR, u = t / dur, fc = f0 * Math.pow(f1 / f0, u);
    const fq = 2 * Math.sin(Math.PI * Math.min(fc, 9000) / SR), x = rnd();
    low += fq * band; const hp = x - low - 0.55 * band; band += fq * hp;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 2);
    const s = band * env * vel, pn = p0 + (p1 - p0) * u;
    add(sfx, sfxVerb, i0 + k, s * (1 - pn) * 2, s * pn * 2, 0.5);
  }
}
function tap(t0, vel = 1) {
  const i0 = Math.round(t0 * SR);
  for (let k = 0; k < 0.12 * SR; k++) {
    const t = k / SR;
    const tick = Math.sin(TAU * 2600 * t) * Math.exp(-t * 170) * 0.3;
    const body = Math.sin(TAU * (240 + 220 * Math.exp(-t * 60)) * t) * Math.exp(-t * 42) * 0.6;
    const nz = rnd() * Math.exp(-t * 650) * 0.22;
    const s = (tick + body + nz) * vel;
    add(sfx, sfxVerb, i0 + k, s, s, 0.15);
  }
}
function key(t0, vel = 0.3) { // klaviatura "chiq"i
  const i0 = Math.round(t0 * SR);
  for (let k = 0; k < 0.05 * SR; k++) {
    const t = k / SR;
    const s = (rnd() * Math.exp(-t * 900) * 0.6 + Math.sin(TAU * 1900 * t) * Math.exp(-t * 220) * 0.4) * vel;
    add(sfx, null, i0 + k, s, s, 0);
  }
}
function pop(t0, vel = 1) {
  let ph = 0; const i0 = Math.round(t0 * SR);
  for (let k = 0; k < 0.25 * SR; k++) {
    const t = k / SR;
    ph += TAU * (360 + 720 * (1 - Math.exp(-t * 40))) / SR;
    const s = Math.sin(ph) * Math.exp(-t * 26) * vel * 0.6;
    add(sfx, sfxVerb, i0 + k, s, s, 0.3);
  }
}
function chime(t0, notes, gap, vel) {
  notes.forEach((m, j) => pluck(sfx, sfxVerb, t0 + j * gap, m, vel, 0.3 + 0.4 * (j / Math.max(1, notes.length - 1)), 0.55, 2.0, 0.9));
}
function riser(t0, dur, vel) {
  let low = 0, band = 0; const i0 = Math.round(t0 * SR);
  for (let k = 0; k < dur * SR; k++) {
    const t = k / SR, u = t / dur, fc = 300 * Math.pow(22, u);
    const fq = 2 * Math.sin(Math.PI * Math.min(fc, 8000) / SR), x = rnd();
    low += fq * band; const hp = x - low - 0.4 * band; band += fq * hp;
    add(sfx, sfxVerb, i0 + k, band * Math.pow(u, 2.2) * vel, band * Math.pow(u, 2.2) * vel, 0.7);
  }
}

/* ---------------- musiqa (70 BPM, Db major — sokin, premium) ---------------- */
const BEAT = 60 / 70, BAR = BEAT * 4, START = 1.7;
const PROG = [ // [bas, pad notalari]
  [37, [60, 65, 68, 72]], // Dbmaj7
  [42, [61, 65, 68, 70]], // Gbmaj9 (inv)
  [34, [58, 61, 65, 68]], // Bbm7
  [39, [58, 63, 66, 70]], // Ebm9
  [37, [60, 65, 68, 72]],
  [42, [61, 65, 68, 70]],
  [44, [60, 63, 68, 71]], // Ab7sus
  [37, [60, 65, 68, 73]], // Db add9 (yechim)
];
const bars = Math.max(2, Math.ceil((DUR - START) / BAR));
const CH = [];
for (let b = 0; b < bars - 1; b++) CH.push(PROG[b % 7]);
CH.push(PROG[7]);

PROG[0][1].forEach((m) => pad(0, START + 0.3, m, 0.5));
riser(0.15, START - 0.1, 0.18);
CH.forEach(([b, notes], bar) => {
  const t = START + bar * BAR, last = bar === CH.length - 1;
  const len = last ? Math.max(1, DUR - t - 1.4) : BAR;
  notes.forEach((m) => pad(t, len, m, 0.62));
  if (bar >= 1) bass(t, last ? 2.6 : BEAT * 1.6, b + 12, 0.1);
  if (bar >= 1 && !last) bass(t + BEAT * 2.5, BEAT * 1.1, b + 12, 0.07);
  const order = [0, 2, 1, 3, 2, 1, 3, 2];
  const n = last ? 4 : 8;
  for (let s = 0; s < n; s++) pluck(music, musicVerb, t + s * BEAT / 2, notes[order[s]] + 12, (bar === 0 ? 0.03 : 0.045) * (s % 2 ? 0.7 : 1), s % 2 ? 0.35 : 0.65, 0.7, 3.2, 0.6);
  if (bar >= 2 && !last) {
    for (let q = 0; q < 4; q++) {
      const bt = t + q * BEAT;
      if (q === 0 || q === 2) kick(bt, 0.42);
      if (q === 1 || q === 3) noise(music, musicVerb, bt, 0.08, 1700, 0.9, 32, 0.25, 0.5, 0.5);
      for (let h = 0; h < 2; h++) noise(music, musicVerb, bt + h * BEAT / 2, h ? 0.018 : 0.026, 9000, 0.7, 70, 0.06, h ? 0.35 : 0.65, 0.1, true);
    }
  }
});

/* ---------------- voqealarga effektlar ---------------- */
swoosh(0.45, 1.3, 180, 2200, 0.3); // telefon pastdan chiqadi
(EV.heads || []).forEach((t) => swoosh(t - 0.1, 0.8, 600, 3500, 0.14, 0.6, 0.4));
(EV.steps || []).forEach((t, j) => pluck(sfx, sfxVerb, t + 0.05, [84, 86, 89, 91, 93, 96, 98, 101][j % 8], 0.04, 0.5, 0.3, 4, 0.8));
(EV.taps || []).forEach((t) => tap(t));
(EV.keys || []).forEach((t) => key(t));
(EV.up || []).forEach((t) => swoosh(t - 0.05, 0.55, 260, 2600, 0.22));
(EV.down || []).forEach((t) => swoosh(t - 0.05, 0.6, 2600, 300, 0.2));
(EV.load || []).forEach((t) => swoosh(t, 1.0, 400, 1800, 0.08));
(EV.opens || []).forEach((t) => { swoosh(t - 0.05, 0.8, 300, 5000, 0.26); chime(t + 0.5, [80, 87], 0.09, 0.05); });
(EV.pops || []).forEach((t) => { pop(t); chime(t + 0.02, [81, 88], 0.08, 0.07); });
(EV.saves || []).forEach((t) => chime(t, [77, 81, 84, 89], 0.07, 0.07));
chime(EV.done, [73, 77, 80, 84, 85, 89], 0.085, 0.065); // "tayyor" yaltirashi
swoosh(EV.done - 0.1, 0.9, 500, 3000, 0.12, 0.4, 0.6);

/* ---------------- reverb (Freeverb-lite) ---------------- */
function reverb(src, room, damp) {
  const out = mk();
  const combs = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116], aps = [556, 441, 341, 225];
  for (let ch = 0; ch < 2; ch++) {
    const sp = ch ? 23 : 0, x = src[ch], y = out[ch];
    const cb = combs.map((d) => ({ b: new Float32Array(d + sp), p: 0, f: 0 }));
    const ab = aps.map((d) => ({ b: new Float32Array(d + sp), p: 0 }));
    for (let i = 0; i < N; i++) {
      let s = 0;
      for (const c of cb) { const o = c.b[c.p]; c.f = o * (1 - damp) + c.f * damp; c.b[c.p] = x[i] * 0.015 + c.f * room; c.p = (c.p + 1) % c.b.length; s += o; }
      for (const a of ab) { const o = a.b[a.p], v = s + o * 0.5; a.b[a.p] = v; a.p = (a.p + 1) % a.b.length; s = o - v * 0.5; }
      y[i] = s;
    }
  }
  return out;
}
const mv = reverb(musicVerb, 0.89, 0.42), sv = reverb(sfxVerb, 0.8, 0.3);

/* ---------------- miks + master ---------------- */
const Lc = new Float32Array(N), Rc = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = Math.min(1, t / 0.4) * Math.min(1, (DUR - t) / 1.5), d = duck[i];
  for (let ch = 0; ch < 2; ch++) {
    let s = (music[ch][i] * 0.85 + mv[ch][i] * 0.6 * d) * (0.78 + 0.22 * d) + sfx[ch][i] + sv[ch][i] * 0.42;
    s = Math.tanh(s * 1.25) * fade;
    (ch ? Rc : Lc)[i] = s; peak = Math.max(peak, Math.abs(s));
  }
}
const g = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Lc[i] * g * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Rc[i] * g * 32767), 46 + i * 4);
}
fs.writeFileSync(OUT, buf);
console.log('✓', OUT, 'peak', peak.toFixed(3));
