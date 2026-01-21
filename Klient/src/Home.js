import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContext } from './ToastContext';

function Home() {
  const [marki, setMarki] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { show } = useContext(ToastContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = 'http://127.0.0.1:8000/marki/';
        if (filter === 'true' || filter === 'false') {
          url += `?czy_istnieje=${filter}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setMarki(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  if (loading) return <div className="app">Ładowanie…</div>;
  if (error) return <div className="app error">Błąd: {error}</div>;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Usunąć markę "${name}"?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/marki/${id}`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        setMarki((prev) => prev.filter((x) => x.id !== id));
        try { show('success', 'Poprawnie zapisano zmiany'); } catch {}
      } else {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail || `${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setError(err.message || 'Błąd podczas usuwania');
      try { show('error', 'Wystąpił błąd'); } catch {}
    }
  };

  return (
    <div className="app">
      <h1>Lista marek</h1>
      <div className="home-actions">
        <button onClick={() => navigate(`/add`)} aria-label={`Dodaj nową markę`}>
            Dodaj nową markę
        </button>

        <label style={{marginLeft:12}}>
          Filtruj:
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setLoading(true); }} style={{marginLeft:8}}>
            <option value="all">Wszystkie</option>
            <option value="true">Tylko istniejące (tak)</option>
            <option value="false">Tylko nieistniejące (nie)</option>
          </select>
        </label>
      </div>
      <div className="grid">
        {marki.map((m) => (
          <div className="card" key={m.id}>
            <button onClick={() => handleDelete(m.id, m.nazwa)} aria-label={`Usuń ${m.nazwa}`}>
            ×
            </button>
            <button onClick={() => navigate(`/edit/${m.id}`)} aria-label={`Edytuj ${m.nazwa}`}>
            Edytuj
            </button>
            <div >
              <div >Nazwa</div>
              <div >{m.nazwa}</div>
            </div>
            <div >
              <div >Rok założenia</div>
              <div >{m.rok_zalozenia}</div>
            </div>
            <div >
              <div >Czy istnieje</div>
              <div >{m.czy_istnieje ? 'tak' : 'nie'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
