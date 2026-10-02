// Do'kon oddiy brauzerda ochilganda (brauzer kirishi o'chiq bo'lsa) ko'rsatiladigan ekran:
// mijozni Telegram botga yo'naltiradi
export default function BotOnly({ botUrl }) {
  return (
    <div className="bot-only">
      <img src="/logo.png" alt="LUSSO BRAND KR" />
      <h1>LUSSO BRAND KR</h1>
      <p>Do'kon Telegram bot orqali ishlaydi. Xarid qilish uchun botni oching.</p>
      {botUrl && (
        <a className="bot-only-btn" href={botUrl}>
          Telegram botni ochish
        </a>
      )}
    </div>
  );
}
