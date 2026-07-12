'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ configured, unauthorized, setupError }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(unauthorized ? 'ئەم هەژمارە دەسەڵاتی ئەدمینی نییە.' : '');

  async function login(event) {
    event.preventDefault();
    if (!configured) {
      setError('سەرەتا Environment Variables ـی Supabase دابنێ.');
      return;
    }
    setLoading(true); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(form.get('email')).trim(),
        password: String(form.get('password')),
      }),
    });

    if (!response.ok) {
      setError(response.status === 503
        ? 'ڕێکخستنی ئەدمین تەواو نییە.'
        : 'ئیمەیڵ یان پاسوۆرد هەڵەیە.');
      setLoading(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="admin-login-page" dir="rtl">
      <div className="login-glow glow-a" /><div className="login-glow glow-b" />
      <section className="admin-login-card">
        <a href="/" className="admin-brand"><span>W</span><strong>WATAN</strong></a>
        <div className="login-icon"><i className="bi bi-shield-lock" /></div>
        <h1>چوونەژوورەوەی ئەدمین</h1><p>نامەکان ببینە و پڕۆژەکانت بەڕێوەببە.</p>
        {!configured && <div className="admin-setup-notice"><i className="bi bi-gear" /><div><strong>Supabase هێشتا ڕێکنەخراوە</strong><p>Environment Variables ـەکانی Supabase و ADMIN_PASSWORD لە Vercel دابنێ؛ پاشان Redeploy بکە.</p></div></div>}
        <form onSubmit={login}>
          <label>ئیمەیڵ</label><div className="admin-input"><i className="bi bi-envelope" /><input type="email" name="email" required autoComplete="email" /></div>
          <label>پاسوۆرد</label><div className="admin-input"><i className="bi bi-key" /><input type="password" name="password" required autoComplete="current-password" /></div>
          <button disabled={loading || !configured}>{loading ? 'چاوەڕوانبە...' : 'چوونەژوورەوە'}<i className="bi bi-arrow-left" /></button>
          {error && <div className="admin-error">{error}</div>}
        </form>
        <a className="back-home" href="/"><i className="bi bi-house" /> گەڕانەوە بۆ پۆرتفۆلیۆ</a>
      </section>
    </main>
  );
}
