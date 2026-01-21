import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MarkaForm from './MarkaForm';

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/marki/${id}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setInitial({ nazwa: data.nazwa, rok_zalozenia: data.rok_zalozenia, czy_istnieje: data.czy_istnieje });
      } catch (err) {
        setInitial({ nazwa: '', rok_zalozenia: 2000, czy_istnieje: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const doUpdate = async (form) => {
    const res = await fetch(`http://127.0.0.1:8000/marki/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(detail?.detail || `${res.status} ${res.statusText}`);
    }
  };

  if (loading) return <div className="app">Ładowanie…</div>;

  return (
    <div className="app">
      <h1>Edycja marki</h1>
      <MarkaForm
        initial={initial}
        onSubmit={async (form) => { await doUpdate(form); navigate('/'); }}
        submitLabel="Zapisz"
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
