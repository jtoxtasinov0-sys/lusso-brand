import { useState } from 'react';
import { haptic } from '../telegram';

export default function Onboarding({ t, onDone }) {
  const [step, setStep] = useState(0);

  const slides = [
    { emoji: '🛍', title: t.ob1Title, text: t.ob1Text },
    { emoji: '📦', title: t.ob2Title, text: t.ob2Text },
    { emoji: '🇰🇷', title: t.ob3Title, text: t.ob3Text },
  ];

  const next = () => {
    haptic('light');
    if (step < slides.length - 1) setStep(step + 1);
    else onDone();
  };

  const s = slides[step];

  return (
    <div className="onboarding">
      <button className="ob-skip" onClick={onDone}>
        {t.skip}
      </button>

      <div className="ob-slide" key={step}>
        <div className="ob-visual">{s.emoji}</div>
        <h1>{s.title}</h1>
        <p>{s.text}</p>
      </div>

      <div className="ob-footer">
        <div className="ob-dots">
          {slides.map((_, i) => (
            <span key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <button className="btn" onClick={next}>
          {step === slides.length - 1 ? t.start : '→'}
        </button>
      </div>
    </div>
  );
}
