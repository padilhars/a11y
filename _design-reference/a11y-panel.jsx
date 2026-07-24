// a11y-panel.jsx — the accessibility plugin (FAB + popover)

/* ─────────────────────────────────────────────────────────────────────────
   FLOATING ACTION BUTTON
   ───────────────────────────────────────────────────────────────────────── */
function A11yFAB({ open, onClick, position, accent, iconStyle, activeCount, language, liftBottom }) {
  const t = STRINGS[language];
  const pos = { ...(FAB_POSITIONS[position] || FAB_POSITIONS['bottom-right']) };
  if (liftBottom && typeof pos.bottom === 'number') pos.bottom += liftBottom;

  const iconNames = {
    accessibility: 'accessibility',
    sparkles: 'sparkles',
    user: 'user',
  };

  return (
    <button
      className="a11y-fab"
      onClick={onClick}
      aria-label={t.panelTitle}
      aria-expanded={open}
      style={{
        position: 'fixed',
        ...pos,
        width: 56,
        height: 56,
        borderRadius: iconStyle === 'square' ? 16 : '50%',
        border: 0,
        background: accent,
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 24px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08)',
        transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease, background 150ms ease',
        zIndex: 99990,
      }}
    >
      <Icon name={iconNames[iconStyle] || 'accessibility'} size={26} stroke={2} />
      {activeCount > 0 && !open && (
        <span style={{
          position: 'absolute',
          top: -4,
          right: -4,
          minWidth: 22,
          height: 22,
          padding: '0 6px',
          borderRadius: 999,
          background: 'white',
          color: accent,
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {activeCount}
        </span>
      )}
    </button>
  );
}

const FAB_POSITIONS = {
  'bottom-right': { bottom: 24, right: 24 },
  'bottom-left':  { bottom: 24, left: 24 },
  'middle-right': { top: '50%', right: 24, transform: 'translateY(-50%)' },
  'middle-left':  { top: '50%', left: 24, transform: 'translateY(-50%)' },
};

const PANEL_POSITIONS = {
  'bottom-right': { bottom: 92, right: 24, transformOrigin: 'bottom right' },
  'bottom-left':  { bottom: 92, left: 24,  transformOrigin: 'bottom left' },
  'middle-right': { top: '50%', right: 92, transform: 'translateY(-50%)', transformOrigin: 'right center' },
  'middle-left':  { top: '50%', left: 92,  transform: 'translateY(-50%)', transformOrigin: 'left center' },
};

/* ─────────────────────────────────────────────────────────────────────────
   PANEL CONTAINER
   ───────────────────────────────────────────────────────────────────────── */
function A11yPanel({ open, onClose, settings, setSettings, position, accent, panelFormat, density, itemStyle, showProfiles, language, activeProfile, setActiveProfile, liftBottom }) {
  const t = STRINGS[language];
  const [activeCategory, setActiveCategory] = React.useState('profiles');
  const [search, setSearch] = React.useState('');

  if (!open) return null;

  const activeCount = countActive(settings);

  // Reset everything
  function reset() {
    setSettings({ ...DEFAULT_SETTINGS });
    setActiveProfile(null);
  }

  // Apply a profile preset
  function selectProfile(p) {
    if (activeProfile === p.id) {
      reset();
      return;
    }
    setSettings({ ...DEFAULT_SETTINGS, ...p.apply });
    setActiveProfile(p.id);
  }

  // Update a single setting (clears active profile)
  function updateSetting(id, value) {
    setSettings(prev => ({ ...prev, [id]: value }));
    setActiveProfile(null);
  }

  // Cycle stepper
  function cycleStepper(opt) {
    const cur = settings[opt.id] || 0;
    const next = (cur + 1) % (opt.max + 1);
    updateSetting(opt.id, next);
  }

  // Filter by search
  const filteredOptions = OPTIONS.filter(o =>
    !search || (o.label[language] || o.label['pt-BR']).toLowerCase().includes(search.toLowerCase())
  );

  const containerStyle = panelFormat === 'drawer'
    ? {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 400,
        transformOrigin: 'right center',
      }
    : panelFormat === 'modal'
    ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(520px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 64px)',
        transformOrigin: 'center center',
      }
    : {  // popover (default)
        position: 'fixed',
        ...PANEL_POSITIONS[position],
        width: 380,
        maxHeight: liftBottom ? `calc(100vh - 120px - ${liftBottom}px)` : 'calc(100vh - 120px)',
      };
  if (panelFormat !== 'drawer' && panelFormat !== 'modal' && liftBottom && typeof containerStyle.bottom === 'number') {
    containerStyle.bottom += liftBottom;
  }

  return (
    <>
      {(panelFormat === 'modal' || panelFormat === 'drawer') && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.32)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 99988,
          }}
        />
      )}
      <div
        className="a11y-panel-root"
        style={{
          ...containerStyle,
          background: '#ffffff',
          borderRadius: panelFormat === 'drawer' ? 0 : 18,
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.20), 0 8px 24px -8px rgba(0,0,0,0.08), 0 1px 0 0 rgba(255,255,255,0.6) inset',
          border: '1px solid #e5e7eb',
          zIndex: 99989,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        role="dialog"
        aria-label={t.panelTitle}
      >
        <PanelHeader
          accent={accent}
          activeCount={activeCount}
          activeProfile={activeProfile}
          onClose={onClose}
          onReset={reset}
          t={t}
          language={language}
        />

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          <PanelSearch
            value={search}
            onChange={setSearch}
            placeholder={t.search}
          />

          {showProfiles && !search && (
            <ProfilesSection
              activeProfile={activeProfile}
              onSelect={selectProfile}
              language={language}
              density={density}
            />
          )}

          <OptionsSections
            options={filteredOptions}
            settings={settings}
            onToggle={(id, v) => updateSetting(id, v)}
            onCycle={cycleStepper}
            language={language}
            accent={accent}
            density={density}
            itemStyle={itemStyle}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            search={search}
            t={t}
          />
        </div>

        <PanelFooter t={t} accent={accent} />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PANEL — HEADER
   ───────────────────────────────────────────────────────────────────────── */
function PanelHeader({ accent, activeCount, activeProfile, onClose, onReset, t, language }) {
  const profile = activeProfile && PROFILES.find(p => p.id === activeProfile);
  return (
    <header style={{
      position: 'relative',
      padding: '18px 20px 14px',
      borderBottom: '1px solid #f4f4f5',
      background: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent + '14',
          color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="accessibility" size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#18181b', letterSpacing: '-0.01em' }}>
            {t.panelTitle}
          </div>
          <div style={{
            fontSize: 12, color: '#6b7280', marginTop: 1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {activeCount > 0
              ? <>
                  <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />
                  {t.activeCount(activeCount)}
                </>
              : t.noneActive
            }
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t.close}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid #e5e7eb', background: 'white',
            color: '#6b7280', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f5'; e.currentTarget.style.color = '#18181b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {profile && (
        <div style={{
          marginTop: 12, padding: '8px 12px', borderRadius: 8,
          background: TONE_COLORS[profile.tone].bg,
          border: `1px solid ${TONE_COLORS[profile.tone].border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ color: TONE_COLORS[profile.tone].icon, display: 'flex' }}>
            <Icon name={profile.icon} size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: TONE_COLORS[profile.tone].text, lineHeight: 1 }}>
              {t.activeProfile}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TONE_COLORS[profile.tone].text, marginTop: 2 }}>
              {profile.label[language] || profile.label['pt-BR']}
            </div>
          </div>
          <button onClick={onReset} style={{
            border: 0, background: 'transparent', color: TONE_COLORS[profile.tone].text,
            fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            padding: '6px 10px', borderRadius: 6, transition: 'background 150ms ease',
          }}>
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {activeCount > 0 && !profile && (
        <button
          onClick={onReset}
          style={{
            marginTop: 12, width: '100%', padding: '9px 12px', borderRadius: 8,
            border: '1px dashed #e5e7eb', background: 'transparent',
            color: '#52525b', fontSize: 12.5, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f5'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          <Icon name="refresh" size={13} />
          {t.reset}
        </button>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PANEL — SEARCH
   ───────────────────────────────────────────────────────────────────────── */
function PanelSearch({ value, onChange, placeholder }) {
  return (
    <div style={{
      padding: '14px 20px 8px',
      position: 'sticky', top: 0,
      background: 'linear-gradient(180deg, white 80%, transparent)',
      zIndex: 5,
    }}>
      <div style={{
        height: 38,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px',
        background: '#f4f4f5',
        border: '1px solid transparent',
        borderRadius: 10,
        transition: 'all 150ms ease',
      }}>
        <Icon name="search" size={15} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 0, background: 'transparent', outline: 0,
            fontSize: 13, color: '#18181b', fontFamily: 'inherit', minWidth: 0,
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              border: 0, background: 'transparent', color: '#9ca3af',
              cursor: 'pointer', padding: 0, display: 'flex',
            }}
            aria-label="Limpar busca"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PROFILES SECTION
   ───────────────────────────────────────────────────────────────────────── */
function ProfilesSection({ activeProfile, onSelect, language, density }) {
  const t = STRINGS[language];
  return (
    <section style={{ padding: '6px 20px 4px' }}>
      <SectionHeading
        icon="sparkles"
        label={t.categories.profiles}
        sublabel={t.profilesSubtitle}
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginBottom: 18,
      }}>
        {PROFILES.map(p => (
          <ProfileCard
            key={p.id}
            profile={p}
            active={activeProfile === p.id}
            onClick={() => onSelect(p)}
            language={language}
          />
        ))}
      </div>
    </section>
  );
}

function ProfileCard({ profile, active, onClick, language }) {
  const tone = TONE_COLORS[profile.tone];
  return (
    <button
      onClick={onClick}
      title={profile.desc[language] || profile.desc['pt-BR']}
      style={{
        position: 'relative',
        padding: '10px 8px',
        borderRadius: 12,
        border: active ? `1.5px solid ${tone.icon}` : '1px solid #e5e7eb',
        background: active ? tone.bg : 'white',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6,
        transition: 'all 150ms ease',
        textAlign: 'center',
        minHeight: 78,
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafafa'; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; } }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: active ? 'white' : tone.bg,
        color: tone.icon,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={profile.icon} size={17} />
      </div>
      <span style={{
        fontSize: 11.5, fontWeight: 600,
        color: active ? tone.text : '#18181b',
        lineHeight: 1.2,
      }}>
        {profile.label[language] || profile.label['pt-BR']}
      </span>
      {active && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 14, height: 14, borderRadius: '50%',
          background: tone.icon, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={9} stroke={3} />
        </div>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   OPTIONS SECTIONS — collapsible per category
   ───────────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'typography', icon: 'typography', defaultOpen: true },
  { id: 'color',      icon: 'palette', defaultOpen: false },
  { id: 'media',      icon: 'media', defaultOpen: false },
  { id: 'navigation', icon: 'navigation', defaultOpen: false },
  { id: 'advanced',   icon: 'tools', defaultOpen: false },
];

function OptionsSections({ options, settings, onToggle, onCycle, language, accent, density, itemStyle, search, t }) {
  // Open all categories during search; otherwise initial defaults
  const [openMap, setOpenMap] = React.useState(() => {
    const m = {};
    CATEGORIES.forEach(c => m[c.id] = c.defaultOpen);
    return m;
  });

  const isSearching = !!search;

  return (
    <div style={{ padding: '4px 20px 12px' }}>
      {CATEGORIES.map(cat => {
        const opts = options.filter(o => o.cat === cat.id);
        if (opts.length === 0) return null;
        const isOpen = isSearching || openMap[cat.id];
        const activeInCat = opts.filter(o => settings[o.id] !== DEFAULT_SETTINGS[o.id]).length;

        return (
          <div key={cat.id} style={{ marginBottom: 6 }}>
            <button
              onClick={() => !isSearching && setOpenMap(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
              disabled={isSearching}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 10px 10px', background: 'transparent', border: 0,
                cursor: isSearching ? 'default' : 'pointer', fontFamily: 'inherit',
                color: '#3f3f46', textAlign: 'left',
                borderRadius: 8,
              }}
            >
              <Icon name={cat.icon} size={15} style={{ color: '#52525b' }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>
                {t.categories[cat.id]}
              </span>
              {activeInCat > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: accent,
                  background: accent + '14',
                  padding: '2px 7px', borderRadius: 999,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {activeInCat}
                </span>
              )}
              {!isSearching && (
                <span style={{ color: '#9ca3af', display: 'flex', transition: 'transform 200ms ease', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  <Icon name="chevronDown" size={14} />
                </span>
              )}
            </button>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: density === 'compact' ? 1 : 2, marginBottom: 8 }}>
                {opts.map(o => (
                  <OptionRow
                    key={o.id}
                    option={o}
                    value={settings[o.id]}
                    onToggle={(v) => onToggle(o.id, v)}
                    onCycle={() => onCycle(o)}
                    language={language}
                    accent={accent}
                    density={density}
                    itemStyle={itemStyle}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   OPTION ROW — toggle or stepper
   ───────────────────────────────────────────────────────────────────────── */
function OptionRow({ option, value, onToggle, onCycle, language, accent, density, itemStyle, t }) {
  const isActive = value !== DEFAULT_SETTINGS[option.id];
  const label = option.label[language] || option.label['pt-BR'];
  const desc = option.desc && (option.desc[language] || option.desc['pt-BR']);

  const padding = density === 'compact' ? '8px 10px' : density === 'comfortable' ? '14px 12px' : '11px 12px';

  return (
    <div
      onClick={() => option.kind === 'toggle' ? onToggle(!value) : onCycle()}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding, borderRadius: 10,
        cursor: 'pointer',
        background: isActive ? accent + '0a' : 'transparent',
        border: isActive ? `1px solid ${accent}33` : '1px solid transparent',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#fafafa'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: isActive ? accent : '#f4f4f5',
        color: isActive ? 'white' : '#52525b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 150ms ease',
      }}>
        <Icon name={option.icon} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 500, color: '#18181b',
          letterSpacing: '-0.005em',
        }}>
          {label}
        </div>
        {desc && density !== 'compact' && (
          <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 1, lineHeight: 1.3 }}>
            {desc}
          </div>
        )}
      </div>
      {option.kind === 'toggle'
        ? <Switch value={!!value} onChange={onToggle} accent={accent} />
        : <Stepper option={option} value={value || 0} onCycle={onCycle} accent={accent} language={language} />
      }
    </div>
  );
}

function Switch({ value, onChange, accent }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(!value); }}
      aria-pressed={value}
      style={{
        width: 36, height: 20, borderRadius: 999,
        background: value ? accent : '#d4d4d8',
        border: 0, cursor: 'pointer', padding: 0,
        position: 'relative', flexShrink: 0,
        transition: 'background 200ms ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: value ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'left 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </button>
  );
}

function Stepper({ option, value, onCycle, accent, language }) {
  const t = STRINGS[language];
  const labels = option.stringsKey ? t[option.stringsKey] : null;
  const currentLabel = labels && labels[value];
  const isActive = value > 0;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onCycle(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}
    >
      {currentLabel && (
        <span style={{
          fontSize: 11.5, fontWeight: 600,
          color: isActive ? accent : '#9ca3af',
          minWidth: 56, textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {currentLabel}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {Array.from({ length: option.max + 1 }).map((_, i) => (
          <span key={i} style={{
            width: i === value ? 14 : 6,
            height: 6,
            borderRadius: 999,
            background: i <= value && i > 0 ? accent : i === 0 && value === 0 ? '#a1a1aa' : '#e5e7eb',
            transition: 'all 200ms ease',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SECTION HEADING (used by profiles)
   ───────────────────────────────────────────────────────────────────────── */
function SectionHeading({ icon, label, sublabel }) {
  return (
    <div style={{ padding: '10px 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={15} style={{ color: '#52525b' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 1, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────────────────────────────────── */
function PanelFooter({ t, accent }) {
  return (
    <footer style={{
      padding: '12px 20px',
      borderTop: '1px solid #f4f4f5',
      background: '#fafafa',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: accent + '14', color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name="check" size={14} stroke={2.5} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#18181b', lineHeight: 1.2 }}>
          {t.saveTitle}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4, marginTop: 1 }}>
          {t.saveSubtitle}
        </div>
      </div>
      <kbd style={{
        fontSize: 10, fontFamily: 'inherit',
        color: '#9ca3af', background: 'white',
        border: '1px solid #e5e7eb', borderRadius: 4,
        padding: '2px 5px', whiteSpace: 'nowrap',
      }}>
        Alt+A
      </kbd>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   READING GUIDE + MASK (overlays following the mouse)
   ───────────────────────────────────────────────────────────────────────── */
function ReadingGuide({ active }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!active) return;
    if (ref.current) ref.current.style.transform = `translateY(${window.innerHeight / 2}px)`;
    const onMove = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translateY(${e.clientY - 1.5}px)`;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [active]);
  if (!active) return null;
  return ReactDOM.createPortal(<div ref={ref} className="a11y-reading-guide" />, document.body);
}

function ReadingMask({ active }) {
  const topRef = React.useRef(null);
  const bottomRef = React.useRef(null);
  React.useEffect(() => {
    if (!active) return;
    const onMove = (e) => {
      const h = window.innerHeight;
      const y = e.clientY;
      const stripe = 110;
      if (topRef.current) topRef.current.style.height = Math.max(0, y - stripe / 2) + 'px';
      if (bottomRef.current) bottomRef.current.style.height = Math.max(0, h - y - stripe / 2) + 'px';
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [active]);
  if (!active) return null;
  return ReactDOM.createPortal(
    <>
      <div ref={topRef} className="a11y-reading-mask-top" />
      <div ref={bottomRef} className="a11y-reading-mask-bottom" />
    </>,
    document.body
  );
}

// Inject FAB hover styles once
(function injectAnims() {
  if (document.getElementById('a11y-keyframes')) return;
  const s = document.createElement('style');
  s.id = 'a11y-keyframes';
  s.textContent = `
    .a11y-fab:hover {
      box-shadow: 0 10px 32px rgba(0,0,0,0.22), 0 3px 10px rgba(0,0,0,0.1) !important;
      filter: brightness(1.08);
    }
    .a11y-fab:active {
      filter: brightness(0.94);
    }
  `;
  document.head.appendChild(s);
})();

Object.assign(window, { A11yFAB, A11yPanel });
