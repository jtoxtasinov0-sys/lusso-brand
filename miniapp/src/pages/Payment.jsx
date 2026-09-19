import { useRef, useState } from 'react';
import { money } from '../i18n';
import api from '../api';
import { haptic, closeApp } from '../telegram';

export default function Payment({ t, order, bank, onDone }) {
  const [copied, setCopied] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* eski brauzerlar */
    }
    haptic('success');
    setCopied(key);
    setTimeout(() => setCopied(''), 1600);
  };

  const pickFile = () => fileRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await api.uploadReceipt(order.id, file);
      setUploaded(true);
      haptic('success');
    } catch (err) {
      alert(err.message);
      haptic('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-body" style={{ paddingTop: 12 }}>
        <div className="pay-success">
          <div className="ok">✓</div>
          <h2>{t.paySuccess}</h2>
          <p>
            {t.orderNo}: <b>{order.orderNumber}</b>
            <br />
            {t.payText}
          </p>
        </div>

        <div className="bank-card">
          <div className="bank-row">
            <span>{t.bank}</span>
            <b>{bank?.name}</b>
          </div>
          <div className="bank-row">
            <span>{t.account}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <b>{bank?.account}</b>
              <button className="copy-btn" onClick={() => copy(bank?.account, 'acc')}>
                {copied === 'acc' ? '✓' : t.copy}
              </button>
            </div>
          </div>
          <div className="bank-row">
            <span>{t.holder}</span>
            <b>{bank?.holder}</b>
          </div>
          <div className="bank-row" style={{ borderTop: '1px solid #e6e6e8', marginTop: 6, paddingTop: 12 }}>
            <span>{t.amount}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <b style={{ fontSize: 17 }}>{money(order.total)}</b>
              <button className="copy-btn" onClick={() => copy(String(order.total), 'sum')}>
                {copied === 'sum' ? '✓' : t.copy}
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFile}
        />

        <div className={`upload-area ${uploaded ? 'done' : ''}`} onClick={uploaded ? undefined : pickFile}>
          {busy ? '⏳ ...' : uploaded ? t.receiptSent : t.uploadReceipt}
        </div>

        <button
          className="btn"
          style={{ marginTop: 18 }}
          onClick={() => {
            haptic('success');
            onDone();
            closeApp();
          }}
        >
          {uploaded ? t.done : t.laterPay}
        </button>
      </div>
    </div>
  );
}
