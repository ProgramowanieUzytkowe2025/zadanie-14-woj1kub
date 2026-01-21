import { useState, useContext } from 'react';
import { ToastContext } from './ToastContext';

export default function MarkaForm({ initial = { nazwa: '', rok_zalozenia: 2000, czy_istnieje: true }, onSubmit, submitLabel = 'Zapisz', onCancel }) {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { show } = useContext(ToastContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
      // pokaż toast sukcesu jeśli wszystko OK
      try { show('success', 'Poprawnie zapisano zmiany'); } catch {}
    } catch (err) {
      setError(err?.message || String(err));
      try { show('error', 'Wystąpił błąd'); } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      {error && <div className="error">Błąd: {error}</div>}
      <form className="edit-form" onSubmit={handleSubmit}>
        <label>
          Nazwa
          <input name="nazwa" value={form.nazwa} onChange={handleChange} />
        </label>
        <label>
          Rok założenia
          <input name="rok_zalozenia" type="number" value={form.rok_zalozenia} onChange={handleChange} />
        </label>
        <label className="checkbox">
          <input name="czy_istnieje" type="checkbox" checked={form.czy_istnieje} onChange={handleChange} />
          Czy istnieje
        </label>
        <div className="form-actions">
          <button type="submit" disabled={submitting}>{submitLabel}</button>
          <button type="button" onClick={onCancel}>Anuluj</button>
        </div>
      </form>
    </div>
  );
}
