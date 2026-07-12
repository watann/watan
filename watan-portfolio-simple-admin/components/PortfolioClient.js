'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { siteProfile, translations } from '@/lib/site-content';

const sections = ['home', 'about', 'skills', 'projects', 'contact'];

export default function PortfolioClient({ projects }) {
  const [lang, setLang] = useState('ku');
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [roleIndex, setRoleIndex] = useState(0);
  const [formState, setFormState] = useState({ status: 'idle', message: '' });
  const formStartedAt = useRef(Date.now());
  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('portfolio-language');
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedLang === 'ku' || savedLang === 'en') setLang(savedLang);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('portfolio-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = translations[lang].dir;
  }, [lang]);

  useEffect(() => {
    const interval = setInterval(() => setRoleIndex((current) => (current + 1) % t.roles.length), 2400);
    return () => clearInterval(interval);
  }, [t.roles.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.14 },
    );
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [lang, projects]);

  useEffect(() => {
    const onScroll = () => {
      const current = [...sections].reverse().find((id) => {
        const node = document.getElementById(id);
        return node && window.scrollY + 180 >= node.offsetTop;
      });
      if (current) setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const glow = document.querySelector('.cursor-glow');
    const move = (event) => {
      if (!glow) return;
      glow.style.transform = `translate3d(${event.clientX - 220}px, ${event.clientY - 220}px, 0)`;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const localizedProjects = useMemo(
    () => projects.map((project) => ({
      ...project,
      title: lang === 'ku' ? project.title_ku : project.title_en,
      description: lang === 'ku' ? project.description_ku : project.description_en,
    })),
    [lang, projects],
  );

  async function submitContact(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setFormState({ status: 'loading', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startedAt: formStartedAt.current }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed');
      form.reset();
      formStartedAt.current = Date.now();
      setFormState({ status: 'success', message: t.form.success });
    } catch {
      setFormState({ status: 'error', message: t.form.error });
    }
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className={`portfolio-shell ${lang === 'ku' ? 'font-rabar' : ''}`} lang={lang} dir={t.dir}>
      <div className="page-noise" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />

      <nav className="portfolio-nav fixed-top">
        <div className="container nav-inner">
          <button className="brand-mark" onClick={() => scrollTo('home')} aria-label="Home">
            <span>W</span><strong>{siteProfile.brand}</strong><i />
          </button>

          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            {sections.map((id, index) => (
              <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => scrollTo(id)}>
                {t.nav[index]}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <button className="nav-pill" onClick={() => setLang(lang === 'ku' ? 'en' : 'ku')}>
              <i className="bi bi-translate" /><span>{t.switchTo}</span>
            </button>
            <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} />
            </button>
            <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <div className="container position-relative">
            <div className="row align-items-center min-vh-100 g-5 pt-5">
              <div className="col-lg-6 order-2 order-lg-1">
                <div className="hero-copy reveal">
                  <div className="eyebrow-badge"><span />{t.heroBadge}</div>
                  <p className="hero-kicker">{t.hello}</p>
                  <h1>{t.name}<span>.</span></h1>
                  <div className="role-line"><small>{t.rolePrefix}</small><strong key={roleIndex}>{t.roles[roleIndex]}</strong></div>
                  <p className="hero-description">{t.heroText}</p>
                  <div className="hero-buttons">
                    <button className="primary-button" onClick={() => scrollTo('projects')}>{t.viewProjects}<i className={`bi ${t.dir === 'rtl' ? 'bi-arrow-left' : 'bi-arrow-right'}`} /></button>
                    <button className="ghost-button" onClick={() => scrollTo('contact')}><i className="bi bi-chat-dots" />{t.contactMe}</button>
                  </div>
                  <div className="availability"><i /><span>{t.available}</span></div>
                </div>
              </div>

              <div className="col-lg-6 order-1 order-lg-2">
                <div className="portrait-stage reveal">
                  <div className="portrait-halo" />
                  <div className="portrait-frame">
                    <img src="/images/profile.png" alt="Watan Hama portrait" />
                    <div className="portrait-scan" />
                    <div className="portrait-corner corner-a" /><div className="portrait-corner corner-b" />
                  </div>
                  <div className="floating-chip chip-code"><i className="bi bi-code-slash" /><span>Next.js</span></div>
                  <div className="floating-chip chip-secure"><i className="bi bi-shield-check" /><span>Secure</span></div>
                  <div className="portrait-signature">{siteProfile.handle}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-space about-section" id="about">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-5">
                <div className="section-heading reveal">
                  <span className="section-eyebrow">{t.aboutEyebrow}</span>
                  <h2>{t.aboutTitle}</h2>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="about-copy reveal"><p>{t.about1}</p><p>{t.about2}</p></div>
              </div>
            </div>
            <div className="stats-grid reveal">
              {t.stats.map(([number, label]) => <article key={label}><strong>{number}</strong><span>{label}</span></article>)}
            </div>
            <div className="quality-row reveal">
              {t.qualities.map((item, index) => <div key={item}><i className={`bi ${['bi-braces','bi-phone','bi-shield-check','bi-lightning-charge'][index]}`} />{item}</div>)}
            </div>
          </div>
        </section>

        <section className="section-space skills-section" id="skills">
          <div className="container">
            <div className="section-heading text-center mx-auto reveal">
              <span className="section-eyebrow">{t.skillsEyebrow}</span>
              <h2>{t.skillsTitle}</h2><p>{t.skillsText}</p>
            </div>
            <div className="row g-4 mt-3">
              {t.services.map(([icon, title, text], index) => (
                <div className="col-md-6 col-lg-4" key={title}>
                  <article className="service-card reveal" style={{ transitionDelay: `${index * 90}ms` }}>
                    <div className="service-icon"><i className={`bi ${icon}`} /></div><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p><div className="service-line" />
                  </article>
                </div>
              ))}
            </div>
            <div className="tech-marquee reveal" aria-label="Technologies"><div>{['HTML5','CSS3','JavaScript','Bootstrap','React','Next.js','Node.js','Supabase','PostgreSQL','GitHub','Vercel'].map((item) => <span key={item}>{item}<i /></span>)}</div></div>
          </div>
        </section>

        <section className="section-space projects-section" id="projects">
          <div className="container">
            <div className="section-heading reveal">
              <span className="section-eyebrow">{t.projectsEyebrow}</span><h2>{t.projectsTitle}</h2>
            </div>
            <div className="row g-4 mt-3">
              {localizedProjects.length ? localizedProjects.map((project, index) => (
                <div className="col-md-6 col-xl-4" key={project.id}>
                  <article className="project-card reveal" style={{ transitionDelay: `${index * 80}ms` }}>
                    <div className={`project-media media-${(index % 3) + 1}`}>
                      {project.image_url ? <img src={project.image_url} alt={project.title} /> : <div className="project-placeholder"><i className="bi bi-window-sidebar" /><span>{String(index + 1).padStart(2, '0')}</span></div>}
                      <div className="project-overlay" />
                    </div>
                    <div className="project-body">
                      <div className="project-number">{String(index + 1).padStart(2, '0')}</div><h3>{project.title}</h3><p>{project.description}</p>
                      <div className="project-tech">{(project.tech || []).map((item) => <span key={item}>{item}</span>)}</div>
                      <div className="project-links">
                        {project.project_url && project.project_url !== '#' && <a href={project.project_url} target="_blank" rel="noreferrer">{t.openProject}<i className="bi bi-box-arrow-up-right" /></a>}
                        {project.github_url && project.github_url !== '#' && <a href={project.github_url} target="_blank" rel="noreferrer">{t.sourceCode}<i className="bi bi-github" /></a>}
                      </div>
                    </div>
                  </article>
                </div>
              )) : <p className="empty-state">{t.noProjects}</p>}
            </div>
          </div>
        </section>

        <section className="section-space contact-section" id="contact">
          <div className="container">
            <div className="contact-panel reveal">
              <div className="row g-5 align-items-center">
                <div className="col-lg-5">
                  <span className="section-eyebrow">{t.contactEyebrow}</span><h2>{t.contactTitle}</h2><p>{t.contactText}</p>
                  <div className="contact-details">
                    <a href={`mailto:${siteProfile.email}`}><i className="bi bi-envelope" /><span><small>{t.emailLabel}</small><strong>{siteProfile.email}</strong></span></a>
                    <div><i className="bi bi-geo-alt" /><span><small>{t.location}</small><strong>{lang === 'ku' ? siteProfile.locationKu : siteProfile.locationEn}</strong></span></div>
                  </div>
                </div>
                <div className="col-lg-7">
                  <form className="contact-form" onSubmit={submitContact}>
                    <input type="text" name="website" className="d-none" tabIndex="-1" autoComplete="off" />
                    <div className="row g-3">
                      <div className="col-md-6"><label>{t.form.name}</label><input name="name" minLength="2" maxLength="120" required /></div>
                      <div className="col-md-6"><label>{t.form.email}</label><input name="email" type="email" maxLength="200" required /></div>
                      <div className="col-12"><label>{t.form.subject}</label><input name="subject" minLength="3" maxLength="180" required /></div>
                      <div className="col-12"><label>{t.form.message}</label><textarea name="message" rows="5" minLength="10" maxLength="5000" required /></div>
                      <div className="col-12"><button className="primary-button w-100 justify-content-center" disabled={formState.status === 'loading'}>{formState.status === 'loading' ? t.form.sending : t.form.send}<i className="bi bi-send" /></button></div>
                    </div>
                    {formState.message && <div className={`form-alert ${formState.status}`}>{formState.message}</div>}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer><div className="container"><div><strong>{siteProfile.brand}</strong><span>{t.footer}</span></div><p>© {new Date().getFullYear()} Watan Hama. {t.rights}</p></div></footer>
    </div>
  );
}
