import { useEffect, useState } from 'react';
import { haptic, openLink } from '../telegram';
import { CONTACT_PHONE, WHATSAPP_URL, TELEGRAM_URL, CALL_URL } from '../constants';
import Icon from './Icon';

// Ilovaning istalgan joyidan aloqa oynasini ochish: openContact()
const EVENT = 'lusso:contact';
export function openContact() {
  haptic('light');
  window.dispatchEvent(new Event(EVENT));
}

const WA_PATH =
  'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.6-.1 1.1z';
const TG_PATH =
  'M21.9 4.6 18.8 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.8 13 2.1 11.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.6z';

function Brand({ d }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export default function ContactSheet({ t }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const show = () => {
      setClosing(false);
      setCopied(false);
      setOpen(true);
    };
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  if (!open) return null;

  const close = () => {
    setClosing(true);
    setTimeout(() => setOpen(false), 260);
  };

  const go = (url) => {
    haptic('light');
    openLink(url);
    close();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_PHONE.replace(/-/g, ''));
      setCopied(true);
      haptic('success');
    } catch {
      /* clipboard yo'q */
    }
  };

  return (
    <>
      <div className={`backdrop contact-backdrop ${closing ? 'closing' : ''}`} onClick={close} />
      <div className={`sheet contact-sheet ${closing ? 'closing' : ''}`}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={close} aria-label="✕">
          <Icon name="close" />
        </button>

        <div className="contact-body">
          <div className="contact-badge">
            <Icon name="chat" />
          </div>
          <h2>{t.contactTitle}</h2>
          <p className="contact-text">{t.contactText}</p>

          <div className="contact-actions">
            <button className="contact-btn wa" onClick={() => go(WHATSAPP_URL)}>
              <Brand d={WA_PATH} />
              <span>
                <b>WhatsApp</b>
                <small>{t.contactWrite}</small>
              </span>
              <Icon name="next" />
            </button>
            <button className="contact-btn tg" onClick={() => go(TELEGRAM_URL)}>
              <Brand d={TG_PATH} />
              <span>
                <b>Telegram</b>
                <small>{t.contactWrite}</small>
              </span>
              <Icon name="next" />
            </button>
            <button className="contact-btn call" onClick={() => go(CALL_URL)}>
              <Icon name="phone" />
              <span>
                <b>{t.contactCall}</b>
                <small>{CONTACT_PHONE}</small>
              </span>
              <Icon name="next" />
            </button>
          </div>

          <button className="contact-number" onClick={copy}>
            <span>{CONTACT_PHONE}</span>
            <em>{copied ? t.copied : t.copy}</em>
          </button>
          <div className="contact-hours">{t.contactHours}</div>
        </div>
      </div>
    </>
  );
}

// Sahifalar ichidagi ixcham "Savolingiz bormi?" kartasi
export function ContactCard({ t, compact = false }) {
  return (
    <button className={`contact-card ${compact ? 'compact' : ''}`} onClick={openContact}>
      <span className="cc-ic">
        <Icon name="chat" />
      </span>
      <span className="cc-txt">
        <b>{t.contactCardTitle}</b>
        <small>{t.contactCardText}</small>
      </span>
      <span className="cc-go">
        <Icon name="arrow" />
      </span>
    </button>
  );
}
