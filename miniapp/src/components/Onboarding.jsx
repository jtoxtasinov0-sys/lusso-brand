import { useState } from 'react';
import { haptic } from '../telegram';

export default function Onboarding({ t, onDone }) {
  const [step, setStep] = useState(0);

  const slides = [
    { visual: <img src="/logo.png" alt="LUSSO" />, kicker: 'LUSSO · 루쏘', title: t.ob1Title, text: t.ob1Text },
    { visual: <span className="em">📦</span>, kicker: '택배 · DELIVERY', title: t.ob2Title, text: t.ob2Text },
    { visual: <span className="em">🇰🇷</span>, kicker: '전국 배송 · KOREA', title: t.ob3Title, text: t.ob3Text },
  ];

  const next = () => {
    haptic('light');
    if (step < slides.length - 1) setStep(step + 1);
    else onDone();
  };

  const s = slides[step];

  return (
    <div className="onboarding">
      <div className="ob-glow" />

      <div className="ob-top">
        <div className="ob-progress">
          {slides.map((_, i) => (
            <span key={i} className={i < step ? 'done' : i === step ? 'on' : ''} />
          ))}
        </div>
        <button className="ob-skip" onClick={onDone}>
          {t.skip}
        </button>
      </div>

      <div className="ob-stage" key={step}>
        <div className="ob-orb">{s.visual}</div>
        <div className="ob-text">
          <small>{s.kicker}</small>
          <h1>{s.title}</h1>
          <p>{s.text}</p>
        </div>
      </div>

      <button className="btn" onClick={next}>
        {step === slides.length - 1 ? t.start : t.next}
      </button>
    </div>
  );
}
