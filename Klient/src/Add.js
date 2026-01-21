import { useNavigate } from 'react-router-dom';
import MarkaForm from './MarkaForm';

export default function Add() {
  const navigate = useNavigate();

  const doCreate = async (form) => {
    const res = await fetch('http://127.0.0.1:8000/marki/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(detail?.detail || `${res.status} ${res.statusText}`);
    }
  };

  return (
    <div className="app">
      <h1>Dodaj markę</h1>
      <MarkaForm
        initial={{ nazwa: '', rok_zalozenia: 2000, czy_istnieje: true }}
        onSubmit={async (form) => { await doCreate(form); navigate('/'); }}
        submitLabel="Dodaj"
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
