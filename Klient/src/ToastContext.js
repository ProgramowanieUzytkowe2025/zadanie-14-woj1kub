import React, { createContext, useCallback, useState, useEffect, useRef } from 'react';

export const ToastContext = createContext({ show: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const origFetchRef = useRef(null);

  const show = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const startRequest = useCallback(() => setLoadingCount((n) => n + 1), []);
  const finishRequest = useCallback(() => setLoadingCount((n) => Math.max(0, n - 1)), []);

  useEffect(() => {
    const orig = window.fetch;
    origFetchRef.current = orig;
    window.fetch = async (...args) => {
      startRequest();
      try {
        const res = await orig(...args);
        return res;
      } catch (err) {
        throw err;
      } finally {
        finishRequest();
      }
    };
    return () => {
      if (origFetchRef.current) window.fetch = origFetchRef.current;
    };
  }, [startRequest, finishRequest]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* loader overlay */}
      {loadingCount > 0 && (
        <div aria-hidden style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontSize: 20, padding: '12px 18px', background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>wczytywanie…</div>
        </div>
      )}

      {/* toasts */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            marginBottom: 8,
            padding: '10px 14px',
            borderRadius: 6,
            color: '#fff',
            minWidth: 200,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            background: t.type === 'success' ? '#16a34a' : '#dc2626'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
