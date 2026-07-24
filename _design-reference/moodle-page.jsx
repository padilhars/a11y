// moodle-page.jsx — realistic Moodle 5.0 course page mockup

function MoodleShell() {
  const [openSection, setOpenSection] = React.useState(1);

  return (
    <div className="moodle-shell" style={moodleStyles.shell}>
      <MoodleHeader />
      <div style={moodleStyles.body}>
        <MoodleSidebar />
        <main className="m-main" style={moodleStyles.main}>
          <MoodleBreadcrumb />
          <MoodleCourseBanner />
          <div style={moodleStyles.layout}>
            <div className="m-content" style={moodleStyles.content}>
              <MoodleSection
                index={0}
                title="Apresentação da Disciplina"
                desc="Materiais introdutórios e regras de avaliação."
                open={openSection === 0}
                onToggle={() => setOpenSection(openSection === 0 ? -1 : 0)}
                activities={[
                  { type: 'fileText', label: 'Plano de Ensino — 2026.1', meta: 'PDF · 348 KB' },
                  { type: 'video',    label: 'Vídeo de boas-vindas',     meta: 'Vídeo · 4:12' },
                  { type: 'messageSquare', label: 'Fórum de apresentações', meta: '12 tópicos · 38 respostas' },
                ]}
              />
              <MoodleSection
                index={1}
                title="Unidade 1 — Fundamentos da Acessibilidade Web"
                desc="Princípios WCAG 2.2, semântica HTML e ARIA na prática."
                open={openSection === 1}
                onToggle={() => setOpenSection(openSection === 1 ? -1 : 1)}
                activities={[
                  { type: 'fileText',  label: 'Aula 01 — Introdução a WCAG 2.2',  meta: 'PDF · 1.2 MB', done: true },
                  { type: 'video',     label: 'Videoaula: Semântica HTML5',        meta: 'Vídeo · 22:48', done: true },
                  { type: 'edit',      label: 'Tarefa: Auditoria de um site público', meta: 'Entrega em 2 dias', highlight: true },
                  { type: 'clipboard', label: 'Quiz — Critérios de Sucesso', meta: '10 questões · até 09/06' },
                  { type: 'folder',    label: 'Material complementar', meta: '5 arquivos' },
                ]}
              />
              <MoodleSection
                index={2}
                title="Unidade 2 — Conteúdo Multimídia Acessível"
                desc="Legendas, audiodescrição, transcrições e alternativas textuais."
                open={openSection === 2}
                onToggle={() => setOpenSection(openSection === 2 ? -1 : 2)}
                activities={[
                  { type: 'video',     label: 'Videoaula: Legendagem acessível',  meta: 'Vídeo · 18:02' },
                  { type: 'fileText',  label: 'Artigo: Audiodescrição em LIBRAS', meta: 'PDF · 540 KB' },
                  { type: 'edit',      label: 'Projeto: Vídeo institucional acessível', meta: 'Entrega em 12 dias' },
                ]}
              />
              <MoodleSection
                index={3}
                title="Unidade 3 — Avaliação e Conformidade"
                desc="Ferramentas automatizadas e avaliação manual de acessibilidade."
                open={openSection === 3}
                onToggle={() => setOpenSection(openSection === 3 ? -1 : 3)}
                activities={[
                  { type: 'fileText', label: 'Guia de auditoria com WAVE e axe', meta: 'PDF · 980 KB' },
                  { type: 'clipboard', label: 'Avaliação Final', meta: '20 questões · 16/07' },
                ]}
              />
            </div>
            <MoodleAside />
          </div>
        </main>
      </div>
    </div>
  );
}

function MoodleHeader() {
  return (
    <header className="m-header" style={moodleStyles.header}>
      <div style={moodleStyles.headerLeft}>
        <button className="m-icon-btn" style={moodleStyles.iconBtn} aria-label="Menu">
          <Icon name="menu" size={20} />
        </button>
        <div style={moodleStyles.logo}>
          <div style={moodleStyles.logoMark}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M2 12L7 6h3l-1 5h3l1-5h3l-1 5h3l-1 5h-3l1-5h-3l-1 5H7l1-5H5z" fill="#f98012"/>
            </svg>
          </div>
          <span style={moodleStyles.logoText}>moodle</span>
          <span style={moodleStyles.logoBadge}>5.0</span>
        </div>
      </div>
      <div className="m-search" style={moodleStyles.search}>
        <Icon name="search" size={16} style={{ color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Buscar cursos, atividades, fóruns…"
          style={moodleStyles.searchInput}
        />
        <kbd style={moodleStyles.kbd}>⌘K</kbd>
      </div>
      <div className="m-header-actions" style={moodleStyles.headerRight}>
        <button className="m-icon-btn" style={moodleStyles.iconBtn} aria-label="Notificações">
          <Icon name="bell" size={18} />
          <span style={moodleStyles.notifDot} />
        </button>
        <button className="m-icon-btn" style={moodleStyles.iconBtn} aria-label="Mensagens">
          <Icon name="messageSquare" size={18} />
        </button>
        <button className="m-icon-btn" style={moodleStyles.iconBtn} aria-label="Configurações">
          <Icon name="settings" size={18} />
        </button>
        <div style={moodleStyles.userChip}>
          <div style={moodleStyles.avatar}>MR</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>Marina Rocha</span>
            <span className="m-text-muted" style={{ fontSize: 11, color: '#6b7280' }}>Estudante</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function MoodleSidebar() {
  const items = [
    { icon: 'home', label: 'Início', active: false },
    { icon: 'graduationCap', label: 'Meus cursos', active: true },
    { icon: 'calendar', label: 'Calendário', badge: '3' },
    { icon: 'fileText', label: 'Atividades' },
    { icon: 'award', label: 'Notas' },
    { icon: 'messageSquare', label: 'Mensagens' },
  ];
  const recent = [
    { label: 'Acessibilidade Web 2026.1', color: '#3b82f6', active: true },
    { label: 'Design de Interação', color: '#ec4899' },
    { label: 'Front-end Avançado', color: '#10b981' },
    { label: 'Pesquisa em IHC', color: '#f59e0b' },
  ];
  return (
    <aside className="m-sidebar" style={moodleStyles.sidebar}>
      <div className="m-nav-section">
        <div style={moodleStyles.sidebarLabel}>Navegação</div>
        {items.map((it, i) => (
          <button
            key={i}
            className="m-nav-item"
            style={{ ...moodleStyles.navItem, ...(it.active ? moodleStyles.navItemActive : {}) }}
          >
            <Icon name={it.icon} size={18} style={{ color: it.active ? '#f98012' : '#52525b' }} />
            <span>{it.label}</span>
            {it.badge && <span style={moodleStyles.navBadge}>{it.badge}</span>}
          </button>
        ))}
      </div>
      <div className="m-nav-section" style={{ marginTop: 24 }}>
        <div style={moodleStyles.sidebarLabel}>Cursos recentes</div>
        {recent.map((c, i) => (
          <button
            key={i}
            className="m-nav-item"
            style={{ ...moodleStyles.navItem, ...(c.active ? moodleStyles.navItemActive : {}) }}
          >
            <span style={{ ...moodleStyles.courseDot, background: c.color }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function MoodleBreadcrumb() {
  return (
    <nav className="m-breadcrumb" style={moodleStyles.breadcrumb}>
      <a href="#" style={moodleStyles.crumb}>Início</a>
      <Icon name="chevronRight" size={14} style={{ color: '#9ca3af' }} />
      <a href="#" style={moodleStyles.crumb}>Meus cursos</a>
      <Icon name="chevronRight" size={14} style={{ color: '#9ca3af' }} />
      <a href="#" style={moodleStyles.crumb}>2026.1</a>
      <Icon name="chevronRight" size={14} style={{ color: '#9ca3af' }} />
      <span style={moodleStyles.crumbCurrent}>Acessibilidade Web</span>
    </nav>
  );
}

function MoodleCourseBanner() {
  return (
    <section className="m-banner" style={moodleStyles.banner}>
      <div
        className="m-banner-img"
        style={moodleStyles.bannerImg}
      >
        <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="bannerGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a"/>
              <stop offset="50%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#6366f1"/>
            </linearGradient>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" opacity="0.18"/>
            </pattern>
          </defs>
          <rect width="800" height="200" fill="url(#bannerGrad)"/>
          <rect width="800" height="200" fill="url(#dots)"/>
          <circle cx="650" cy="100" r="80" fill="white" opacity="0.06"/>
          <circle cx="720" cy="80" r="40" fill="white" opacity="0.08"/>
        </svg>
      </div>
      <div style={moodleStyles.bannerOverlay}>
        <div style={moodleStyles.bannerTags}>
          <span style={moodleStyles.bannerTag}>Graduação · 2026.1</span>
          <span style={moodleStyles.bannerTag}>60h · 4 créditos</span>
        </div>
        <h1 className="m-course-title m-page-title" style={moodleStyles.bannerTitle}>
          Acessibilidade Web
        </h1>
        <p style={moodleStyles.bannerSubtitle}>
          Princípios, técnicas e ferramentas para construir interfaces inclusivas conforme as diretrizes WCAG 2.2.
        </p>
        <div style={moodleStyles.bannerMeta}>
          <span style={moodleStyles.bannerMetaItem}>
            <Icon name="users" size={14} /> 34 estudantes
          </span>
          <span style={moodleStyles.bannerMetaItem}>
            <Icon name="user" size={14} /> Prof. Helena Couto
          </span>
          <span style={moodleStyles.bannerMetaItem}>
            <Icon name="clock" size={14} /> Atualizado hoje
          </span>
        </div>
      </div>
    </section>
  );
}

function MoodleSection({ title, desc, activities, open, onToggle, index }) {
  return (
    <section className="m-section m-card" style={{ ...moodleStyles.section, ...(open ? moodleStyles.sectionOpen : {}) }}>
      <button onClick={onToggle} style={moodleStyles.sectionHead} aria-expanded={open}>
        <div style={moodleStyles.sectionHeadLeft}>
          <span style={moodleStyles.sectionIndex}>{String(index).padStart(2, '0')}</span>
          <div>
            <h2 className="m-section-title" style={moodleStyles.sectionTitle}>{title}</h2>
            <p className="m-text-muted" style={moodleStyles.sectionDesc}>{desc}</p>
          </div>
        </div>
        <div style={moodleStyles.sectionHeadRight}>
          <span className="m-text-muted" style={moodleStyles.sectionMeta}>{activities.length} itens</span>
          <span style={{ ...moodleStyles.chevWrap, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
            <Icon name="chevronDown" size={18} />
          </span>
        </div>
      </button>
      {open && (
        <div style={moodleStyles.sectionBody}>
          {activities.map((a, i) => (
            <MoodleActivity key={i} {...a} />
          ))}
        </div>
      )}
    </section>
  );
}

function MoodleActivity({ type, label, meta, done, highlight }) {
  const palette = {
    fileText: { bg: '#fef3c7', fg: '#b45309' },
    video: { bg: '#fee2e2', fg: '#b91c1c' },
    edit: { bg: '#dbeafe', fg: '#1d4ed8' },
    clipboard: { bg: '#dcfce7', fg: '#15803d' },
    folder: { bg: '#f3e8ff', fg: '#7c3aed' },
    messageSquare: { bg: '#ffe4e6', fg: '#be123c' },
  }[type] || { bg: '#f4f4f5', fg: '#52525b' };

  return (
    <div className="m-activity" style={{ ...moodleStyles.activity, ...(highlight ? moodleStyles.activityHighlight : {}) }}>
      <div style={{ ...moodleStyles.activityIcon, background: palette.bg, color: palette.fg }}>
        <Icon name={type} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={moodleStyles.activityTop}>
          <a href="#" style={moodleStyles.activityLabel}>{label}</a>
          {done && (
            <span style={moodleStyles.doneBadge}>
              <Icon name="check" size={12} /> Concluído
            </span>
          )}
          {highlight && (
            <span style={moodleStyles.dueBadge}>
              <Icon name="clock" size={12} /> Prazo
            </span>
          )}
        </div>
        <div className="m-text-muted" style={moodleStyles.activityMeta}>{meta}</div>
      </div>
      <button className="m-btn" style={moodleStyles.activityBtn} aria-label="Abrir">
        <Icon name="arrowRight" size={16} />
      </button>
    </div>
  );
}

function MoodleAside() {
  return (
    <aside className="m-aside" style={moodleStyles.aside}>
      <div className="m-aside-card" style={moodleStyles.asideCard}>
        <div style={moodleStyles.asideCardHead}>
          <h3 className="m-section-title" style={moodleStyles.asideTitle}>Progresso do curso</h3>
        </div>
        <div style={moodleStyles.progressRing}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="10"
              strokeDasharray="314.16" strokeDashoffset="172" strokeLinecap="round"
              transform="rotate(-90 60 60)"/>
          </svg>
          <div style={moodleStyles.progressNum}>45%</div>
        </div>
        <div className="m-text-muted" style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
          7 de 16 atividades concluídas
        </div>
      </div>

      <div className="m-aside-card" style={moodleStyles.asideCard}>
        <div style={moodleStyles.asideCardHead}>
          <h3 className="m-section-title" style={moodleStyles.asideTitle}>Próximas entregas</h3>
        </div>
        {[
          { label: 'Auditoria de site público', due: 'Em 2 dias', tone: 'danger' },
          { label: 'Quiz WCAG 2.2', due: 'Em 5 dias', tone: 'warning' },
          { label: 'Vídeo acessível', due: 'Em 12 dias', tone: 'normal' },
        ].map((d, i) => (
          <div key={i} style={moodleStyles.dueItem}>
            <div style={{ ...moodleStyles.dueDot, background: d.tone === 'danger' ? '#ef4444' : d.tone === 'warning' ? '#f59e0b' : '#10b981' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#18181b' }}>{d.label}</div>
              <div className="m-text-muted" style={{ fontSize: 12, color: '#6b7280' }}>{d.due}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="m-aside-card" style={moodleStyles.asideCard}>
        <div style={moodleStyles.asideCardHead}>
          <h3 className="m-section-title" style={moodleStyles.asideTitle}>Anúncios recentes</h3>
        </div>
        <div style={{ ...moodleStyles.announcement }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={moodleStyles.miniAvatar}>HC</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#18181b' }}>Helena Couto</div>
            <div className="m-text-muted" style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>2h</div>
          </div>
          <div style={{ fontSize: 13, color: '#3f3f46', lineHeight: 1.5 }}>
            Lembrete: a entrega da auditoria foi estendida em mais 48 horas. Detalhes no fórum.
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const moodleStyles = {
  shell: {
    minHeight: '100vh',
    background: '#f4f5f7',
    color: '#18181b',
    fontSize: 14,
    lineHeight: 1.5,
  },
  body: {
    display: 'flex',
    alignItems: 'stretch',
  },
  main: {
    flex: 1,
    minWidth: 0,
    padding: '20px 32px 80px',
  },
  // Header
  header: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 20px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8, border: '1px solid transparent',
    background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#52525b', position: 'relative',
    transition: 'all 150ms ease',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8, width: 7, height: 7,
    background: '#ef4444', borderRadius: '50%', border: '2px solid white',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 32, height: 32, borderRadius: 8, background: '#fef3c7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: 700, color: '#18181b', letterSpacing: '-0.02em' },
  logoBadge: {
    fontSize: 10, fontWeight: 600, color: '#f98012', background: '#fff7ed',
    border: '1px solid #fed7aa', padding: '2px 6px', borderRadius: 4,
  },
  search: {
    flex: 1, maxWidth: 520, height: 38, display: 'flex', alignItems: 'center',
    background: '#f4f4f5', border: '1px solid transparent', borderRadius: 10,
    padding: '0 12px', gap: 8, transition: 'all 150ms ease',
  },
  searchInput: {
    flex: 1, border: 0, background: 'transparent', outline: 0,
    fontSize: 14, color: '#18181b', fontFamily: 'inherit',
  },
  kbd: {
    fontSize: 11, fontFamily: 'inherit', color: '#9ca3af',
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4,
    padding: '2px 5px',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 4px 4px',
    borderRadius: 999, marginLeft: 6,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: '#3b82f6',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600,
  },

  // Sidebar
  sidebar: {
    width: 240, flexShrink: 0, padding: '20px 12px',
    background: '#fff', borderRight: '1px solid #e5e7eb',
    minHeight: 'calc(100vh - 60px)',
    position: 'sticky', top: 60,
    alignSelf: 'flex-start',
  },
  sidebarLabel: {
    fontSize: 11, fontWeight: 600, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '0 8px 8px',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    padding: '9px 10px', borderRadius: 8, border: 0, background: 'transparent',
    cursor: 'pointer', fontSize: 13.5, color: '#3f3f46', fontFamily: 'inherit',
    textAlign: 'left', transition: 'background 150ms ease',
  },
  navItemActive: {
    background: '#fff7ed', color: '#9a3412', fontWeight: 600,
  },
  navBadge: {
    marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#dc2626',
    background: '#fee2e2', padding: '1px 7px', borderRadius: 999,
  },
  courseDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },

  // Breadcrumb
  breadcrumb: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0 16px',
    fontSize: 13,
  },
  crumb: { color: '#6b7280', textDecoration: 'none' },
  crumbCurrent: { color: '#18181b', fontWeight: 500 },

  // Banner
  banner: {
    position: 'relative', borderRadius: 16, overflow: 'hidden',
    minHeight: 200, background: '#1e3a8a',
    marginBottom: 24,
  },
  bannerImg: {
    position: 'absolute', inset: 0,
  },
  bannerOverlay: {
    position: 'relative', padding: '32px 36px', color: 'white',
    background: 'linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
    minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
  },
  bannerTags: { display: 'flex', gap: 8, marginBottom: 12 },
  bannerTag: {
    fontSize: 11, fontWeight: 600, color: 'white', textTransform: 'uppercase',
    letterSpacing: '0.06em', background: 'rgba(255,255,255,0.18)',
    padding: '4px 10px', borderRadius: 999, backdropFilter: 'blur(8px)',
  },
  bannerTitle: {
    fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: '-0.02em',
    color: 'white',
  },
  bannerSubtitle: {
    fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '8px 0 0',
    maxWidth: 640, lineHeight: 1.55,
  },
  bannerMeta: { display: 'flex', gap: 20, marginTop: 16 },
  bannerMetaItem: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
    color: 'rgba(255,255,255,0.85)', fontWeight: 500,
  },

  // Layout split
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    gap: 24,
    alignItems: 'flex-start',
  },
  content: { display: 'flex', flexDirection: 'column', gap: 14 },

  // Section card
  section: {
    background: 'white', borderRadius: 14, border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  sectionOpen: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
  sectionHead: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16, padding: '18px 20px', background: 'transparent', border: 0,
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  },
  sectionHeadLeft: { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 },
  sectionIndex: {
    width: 36, height: 36, borderRadius: 10, background: '#f4f4f5',
    color: '#52525b', fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: 600, margin: 0, color: '#18181b',
    letterSpacing: '-0.01em',
  },
  sectionDesc: { fontSize: 13, color: '#6b7280', margin: '2px 0 0' },
  sectionHeadRight: { display: 'flex', alignItems: 'center', gap: 14 },
  sectionMeta: { fontSize: 12, color: '#9ca3af', fontWeight: 500 },
  chevWrap: { display: 'flex', alignItems: 'center', color: '#9ca3af', transition: 'transform 200ms ease' },
  sectionBody: {
    display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px 12px',
    borderTop: '1px solid #f4f4f5',
  },

  // Activity row
  activity: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px',
    borderRadius: 10, transition: 'background 150ms ease',
  },
  activityHighlight: {
    background: '#fffbeb',
    border: '1px solid #fed7aa',
  },
  activityIcon: {
    width: 38, height: 38, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  activityTop: { display: 'flex', alignItems: 'center', gap: 8 },
  activityLabel: {
    fontSize: 14, fontWeight: 500, color: '#18181b', textDecoration: 'none',
  },
  activityMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  doneBadge: {
    fontSize: 10, fontWeight: 600, color: '#15803d', background: '#dcfce7',
    padding: '2px 7px', borderRadius: 999, display: 'inline-flex',
    alignItems: 'center', gap: 4, letterSpacing: '0.02em',
  },
  dueBadge: {
    fontSize: 10, fontWeight: 600, color: '#b45309', background: '#fef3c7',
    padding: '2px 7px', borderRadius: 999, display: 'inline-flex',
    alignItems: 'center', gap: 4, letterSpacing: '0.02em',
  },
  activityBtn: {
    width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
    background: 'white', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#6b7280',
    flexShrink: 0, transition: 'all 150ms ease',
  },

  // Aside (right column)
  aside: { display: 'flex', flexDirection: 'column', gap: 16 },
  asideCard: {
    background: 'white', borderRadius: 14, border: '1px solid #e5e7eb',
    padding: 18,
  },
  asideCardHead: { marginBottom: 12 },
  asideTitle: {
    fontSize: 14, fontWeight: 600, margin: 0, color: '#18181b',
    letterSpacing: '-0.01em',
  },
  progressRing: {
    position: 'relative', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '6px auto 12px',
    width: 120, height: 120,
  },
  progressNum: {
    position: 'absolute', fontSize: 28, fontWeight: 700, color: '#18181b',
    fontVariantNumeric: 'tabular-nums',
  },
  dueItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    borderBottom: '1px solid #f4f4f5',
  },
  dueDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  announcement: {
    padding: 12, background: '#f8fafc', borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  miniAvatar: {
    width: 24, height: 24, borderRadius: '50%', background: '#ec4899',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 600,
  },
};

window.MoodleShell = MoodleShell;
