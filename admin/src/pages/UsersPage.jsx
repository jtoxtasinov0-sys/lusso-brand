import { useEffect, useState } from 'react';
import api from '../api';

export default function UsersPage({ toast }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .users(search)
        .then(setUsers)
        .catch((e) => toast(e.message, true))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <div className="page-head">
        <h1>Mijozlar</h1>
        <input
          className="input"
          style={{ width: 260 }}
          placeholder="Ism yoki telefon bo'yicha qidirish"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty">Yuklanmoqda...</div>
      ) : users.length === 0 ? (
        <div className="empty">
          <div className="e">👥</div>
          Mijoz topilmadi
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Username</th>
                <th>Til</th>
                <th>Buyurtmalar</th>
                <th>Ro'yxatdan o'tgan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>
                      {u.firstName} {u.lastName || ''}
                    </b>
                  </td>
                  <td>{u.phone || <span className="muted">—</span>}</td>
                  <td className="muted">{u.username ? '@' + u.username : '—'}</td>
                  <td>
                    <span className="pill">{u.language === 'ru' ? '🇷🇺 RU' : '🇺🇿 UZ'}</span>
                  </td>
                  <td>{u._count?.orders ?? 0}</td>
                  <td className="muted nowrap">
                    {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
