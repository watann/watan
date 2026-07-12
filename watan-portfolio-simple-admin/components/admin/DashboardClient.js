'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const emptyProject = { title_ku: '', title_en: '', description_ku: '', description_en: '', tech: '', project_url: '', github_url: '', sort_order: 0, is_published: true };

export default function DashboardClient({ initialMessages, initialProjects, userEmail }) {
  const router = useRouter();
  const [tab, setTab] = useState('messages');
  const [messages, setMessages] = useState(initialMessages);
  const [projects, setProjects] = useState(initialProjects);
  const [projectModal, setProjectModal] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const unread = useMemo(() => messages.filter((item) => !item.is_read).length, [messages]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  async function toggleRead(message) {
    setBusy(message.id);
    const response = await fetch(`/api/admin/messages/${message.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_read: !message.is_read }) });
    if (response.ok) {
      const { message: updated } = await response.json();
      setMessages((items) => items.map((item) => item.id === updated.id ? updated : item));
    }
    setBusy('');
  }

  async function deleteMessage(id) {
    if (!confirm('دڵنیایت لە سڕینەوەی ئەم نامەیە؟')) return;
    setBusy(id);
    const response = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    if (response.ok) setMessages((items) => items.filter((item) => item.id !== id));
    setBusy('');
  }

  async function saveProject(event) {
    event.preventDefault();
    setBusy('project-save'); setNotice('');
    const formData = new FormData(event.currentTarget);
    formData.set('is_published', formData.get('is_published') ? 'true' : 'false');
    const editing = Boolean(projectModal?.id);
    const response = await fetch(editing ? `/api/admin/projects/${projectModal.id}` : '/api/admin/projects', { method: editing ? 'PATCH' : 'POST', body: formData });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || 'هەڵەیەک ڕوویدا.'); setBusy(''); return;
    }
    if (editing) setProjects((items) => items.map((item) => item.id === result.project.id ? result.project : item));
    else setProjects((items) => [...items, result.project]);
    setProjects((items) => [...items].sort((a, b) => a.sort_order - b.sort_order));
    setProjectModal(null); setBusy('');
  }

  async function deleteProject(project) {
    if (!confirm(`دڵنیایت لە سڕینەوەی «${project.title_ku}»؟`)) return;
    setBusy(project.id);
    const response = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
    if (response.ok) setProjects((items) => items.filter((item) => item.id !== project.id));
    setBusy('');
  }

  function editProject(project) {
    setNotice('');
    setProjectModal({ ...project, tech: (project.tech || []).join(', ') });
  }

  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand"><span>W</span><strong>WATAN</strong></a>
        <nav>
          <button className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}><i className="bi bi-envelope-paper" />نامەکان{unread > 0 && <b>{unread}</b>}</button>
          <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}><i className="bi bi-grid-1x2" />پڕۆژەکان</button>
          <a href="/" target="_blank"><i className="bi bi-box-arrow-up-left" />بینینی پۆرتفۆلیۆ</a>
        </nav>
        <div className="admin-user"><div><i className="bi bi-person-circle" /></div><span><small>ئەدمین</small><strong>{userEmail}</strong></span></div>
        <button className="logout-button" onClick={logout}><i className="bi bi-box-arrow-right" />چوونەدەرەوە</button>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar"><div><span>داشبۆرد</span><h1>{tab === 'messages' ? 'بەڕێوەبردنی نامەکان' : 'بەڕێوەبردنی پڕۆژەکان'}</h1></div>{tab === 'projects' && <button className="admin-primary" onClick={() => { setNotice(''); setProjectModal(emptyProject); }}><i className="bi bi-plus-lg" />پڕۆژەی نوێ</button>}</header>

        <section className="admin-stats">
          <article><i className="bi bi-envelope" /><div><strong>{messages.length}</strong><span>هەموو نامەکان</span></div></article>
          <article><i className="bi bi-envelope-exclamation" /><div><strong>{unread}</strong><span>نەخوێندراوەکان</span></div></article>
          <article><i className="bi bi-window-stack" /><div><strong>{projects.length}</strong><span>هەموو پڕۆژەکان</span></div></article>
          <article><i className="bi bi-eye" /><div><strong>{projects.filter((item) => item.is_published).length}</strong><span>بڵاوکراوەکان</span></div></article>
        </section>

        {tab === 'messages' ? (
          <section className="admin-panel">
            <div className="panel-title"><h2>نامەکانی پەیوەندی</h2><span>{messages.length} نامە</span></div>
            <div className="messages-list">
              {messages.length ? messages.map((message) => (
                <article className={`message-card ${message.is_read ? '' : 'unread'}`} key={message.id}>
                  <div className="message-avatar">{message.name.slice(0, 1).toUpperCase()}</div>
                  <div className="message-main"><div className="message-head"><div><h3>{message.subject}</h3><p>{message.name} · <a href={`mailto:${message.email}`}>{message.email}</a></p></div><time>{new Date(message.created_at).toLocaleString('en-GB')}</time></div><div className="message-text">{message.message}</div></div>
                  <div className="message-actions"><a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`} title="وەڵامدانەوە"><i className="bi bi-reply" /></a><button onClick={() => toggleRead(message)} disabled={busy === message.id} title={message.is_read ? 'نەخوێندراوە' : 'خوێندراوە'}><i className={`bi ${message.is_read ? 'bi-envelope' : 'bi-envelope-open'}`} /></button><button className="danger" onClick={() => deleteMessage(message.id)} disabled={busy === message.id}><i className="bi bi-trash3" /></button></div>
                </article>
              )) : <div className="admin-empty"><i className="bi bi-inbox" /><h3>هیچ نامەیەک نییە</h3><p>کاتێک کەسێک فۆڕمی پەیوەندی پڕ بکاتەوە، لێرە دەردەکەوێت.</p></div>}
            </div>
          </section>
        ) : (
          <section className="admin-panel">
            <div className="panel-title"><h2>پڕۆژەکان</h2><span>وێنەکان لە Supabase Storage پارێزراون</span></div>
            <div className="admin-project-grid">
              {projects.length ? projects.map((project) => (
                <article className="admin-project-card" key={project.id}>
                  <div className="admin-project-image">{project.image_url ? <img src={project.image_url} alt={project.title_ku} /> : <i className="bi bi-image" />}<span className={project.is_published ? 'published' : 'draft'}>{project.is_published ? 'بڵاوکراوە' : 'ڕەشنووس'}</span></div>
                  <div className="admin-project-body"><small>ڕیزبەندی: {project.sort_order}</small><h3>{project.title_ku}</h3><p>{project.description_ku}</p><div>{(project.tech || []).map((item) => <span key={item}>{item}</span>)}</div><footer><button onClick={() => editProject(project)}><i className="bi bi-pencil-square" />دەستکاری</button><button className="danger" onClick={() => deleteProject(project)} disabled={busy === project.id}><i className="bi bi-trash3" />سڕینەوە</button></footer></div>
                </article>
              )) : <div className="admin-empty"><i className="bi bi-grid" /><h3>هێشتا پڕۆژە نییە</h3><p>لە دوگمەی «پڕۆژەی نوێ» وێنە و زانیاریی پڕۆژەکەت زیاد بکە.</p></div>}
            </div>
          </section>
        )}
      </main>

      {projectModal && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setProjectModal(null)}>
          <section className="admin-modal">
            <header><div><small>{projectModal.id ? 'دەستکاری' : 'زیادکردن'}</small><h2>{projectModal.id ? 'دەستکاری پڕۆژە' : 'پڕۆژەی نوێ'}</h2></div><button onClick={() => setProjectModal(null)}><i className="bi bi-x-lg" /></button></header>
            <form onSubmit={saveProject}>
              <div className="row g-3">
                <div className="col-md-6"><label>ناوی کوردی</label><input name="title_ku" defaultValue={projectModal.title_ku} required /></div>
                <div className="col-md-6"><label>English title</label><input name="title_en" dir="ltr" defaultValue={projectModal.title_en} required /></div>
                <div className="col-md-6"><label>وەسفی کوردی</label><textarea name="description_ku" rows="4" defaultValue={projectModal.description_ku} required /></div>
                <div className="col-md-6"><label>English description</label><textarea name="description_en" dir="ltr" rows="4" defaultValue={projectModal.description_en} required /></div>
                <div className="col-12"><label>تەکنەلۆژیاکان <small>(بە کۆما جیابکەرەوە)</small></label><input name="tech" dir="ltr" defaultValue={projectModal.tech} placeholder="Next.js, Supabase, Bootstrap" /></div>
                <div className="col-md-6"><label>لینکی پڕۆژە</label><input name="project_url" dir="ltr" type="url" defaultValue={projectModal.project_url || ''} placeholder="https://..." /></div>
                <div className="col-md-6"><label>لینکی GitHub</label><input name="github_url" dir="ltr" type="url" defaultValue={projectModal.github_url || ''} placeholder="https://github.com/..." /></div>
                <div className="col-md-8"><label>وێنەی پڕۆژە <small>(JPG/PNG/WebP تا 5MB)</small></label><input name="image" type="file" accept="image/jpeg,image/png,image/webp" />{projectModal.image_url && <p className="current-image-note"><i className="bi bi-check-circle" /> وێنەی ئێستا هەیە؛ تەنها بۆ گۆڕینی وێنە فایل هەڵبژێرە.</p>}</div>
                <div className="col-md-4"><label>ڕیزبەندی</label><input name="sort_order" type="number" defaultValue={projectModal.sort_order || 0} /></div>
                <div className="col-12"><label className="publish-check"><input name="is_published" type="checkbox" defaultChecked={projectModal.is_published} /> <span>پڕۆژەکە لە پۆرتفۆلیۆ پیشان بدرێت</span></label></div>
              </div>
              {notice && <div className="admin-error mt-3">{notice}</div>}
              <footer><button type="button" className="admin-secondary" onClick={() => setProjectModal(null)}>پاشگەزبوونەوە</button><button className="admin-primary" disabled={busy === 'project-save'}>{busy === 'project-save' ? 'چاوەڕوانبە...' : 'پاشەکەوتکردن'}<i className="bi bi-check2" /></button></footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
