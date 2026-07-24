// app.jsx — root application, state, body-class effects, tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fabPosition": "bottom-right",
  "panelFormat": "popover",
  "density": "regular",
  "accent": "#3b82f6",
  "fabIconStyle": "accessibility",
  "fabShape": "circle",
  "showProfiles": true,
  "language": "pt-BR"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [settings, setSettings] = React.useState({ ...DEFAULT_SETTINGS });
  const [activeProfile, setActiveProfile] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const lastToggleRef = React.useRef(0);

  // Toggle, guarded against rapid double-fire (instrumentation echoes etc.)
  const toggleOpen = React.useCallback(() => {
    const now = Date.now();
    if (now - lastToggleRef.current < 250) return;
    lastToggleRef.current = now;
    setOpen(o => !o);
  }, []);

  const closePanel = React.useCallback(() => {
    lastToggleRef.current = Date.now();
    setOpen(false);
  }, []);

  // ── Apply settings to document body via classes ────────────────────────
  React.useEffect(() => {
    const body = document.body;
    // Remove all our classes first
    Array.from(body.classList).forEach(c => {
      if (c.startsWith('a11y-')) body.classList.remove(c);
    });

    // Toggle classes
    if (settings.readableFont) body.classList.add('a11y-readable-font');
    if (settings.dyslexicFont) body.classList.add('a11y-dyslexic-font');
    if (settings.highlightTitles) body.classList.add('a11y-highlight-titles');
    if (settings.highlightLinks) body.classList.add('a11y-highlight-links');
    if (settings.highlightButtons) body.classList.add('a11y-highlight-buttons');
    if (settings.hideImages) body.classList.add('a11y-hide-images');
    if (settings.pauseAnimations) body.classList.add('a11y-pause-animations');
    if (settings.tooltips) body.classList.add('a11y-tooltips');
    if (settings.invertColors) body.classList.add('a11y-invert');
    if (settings.focusMode) body.classList.add('a11y-focus-mode');

    // Steppers
    if (settings.textSize > 0)    body.classList.add('a11y-text-size-' + settings.textSize);
    if (settings.lineHeight > 0)  body.classList.add('a11y-line-height-' + settings.lineHeight);
    if (settings.textSpacing > 0) body.classList.add('a11y-text-spacing-' + settings.textSpacing);
    if (settings.contrast > 0)    body.classList.add('a11y-contrast-' + settings.contrast);
    if (settings.saturation > 0)  body.classList.add('a11y-saturation-' + settings.saturation);
    if (settings.colorChange > 0) body.classList.add('a11y-color-' + settings.colorChange);
    if (settings.cursor > 0)      body.classList.add('a11y-cursor-' + settings.cursor);
  }, [settings]);

  // ── Keyboard shortcut Alt+A ────────────────────────────────────────────
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        toggleOpen();
      }
      if (e.key === 'Escape' && open) closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggleOpen, closePanel]);

  const activeCount = countActive(settings);
  const kbLift = settings.virtualKeyboard ? 248 : 0;

  return (
    <>
      <MoodleShell />

      <A11yFAB
        open={open}
        onClick={toggleOpen}
        position={t.fabPosition}
        accent={t.accent}
        iconStyle={t.fabIconStyle}
        shape={t.fabShape}
        activeCount={activeCount}
        language={t.language}
        liftBottom={kbLift}
      />

      <A11yPanel
        open={open}
        onClose={closePanel}
        settings={settings}
        setSettings={setSettings}
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
        position={t.fabPosition}
        accent={t.accent}
        panelFormat={t.panelFormat}
        density={t.density}
        showProfiles={t.showProfiles}
        language={t.language}
        liftBottom={kbLift}
      />

      <ReadingGuide active={!!settings.readingGuide} />
      <ReadingMask active={!!settings.readingMask} />
      <ScreenReaderLayer active={!!settings.screenReader} language={t.language} accent={t.accent} />
      <VirtualKeyboard active={!!settings.virtualKeyboard} language={t.language} accent={t.accent} />

      <A11yTweaks t={t} setTweak={setTweak} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TWEAKS PANEL
   ───────────────────────────────────────────────────────────────────────── */
function A11yTweaks({ t, setTweak }) {
  const accents = [
    '#3b82f6', // blue (default)
    '#f97316', // moodle orange
    '#10b981', // green
    '#8b5cf6', // purple
    '#0f172a', // near-black neutral
  ];

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Botão Flutuante (FAB)" />
      <TweakRadio
        label="Posição"
        value={t.fabPosition}
        options={[
          { value: 'bottom-right', label: '↘' },
          { value: 'bottom-left',  label: '↙' },
          { value: 'middle-right', label: '→' },
          { value: 'middle-left',  label: '←' },
        ]}
        onChange={(v) => setTweak('fabPosition', v)}
      />
      <TweakRadio
        label="Ícone"
        value={t.fabIconStyle}
        options={[
          { value: 'accessibility', label: '♿' },
          { value: 'sparkles',      label: '✦' },
          { value: 'user',          label: '👤' },
        ]}
        onChange={(v) => setTweak('fabIconStyle', v)}
      />
      <TweakRadio
        label="Forma"
        value={t.fabShape}
        options={['circle', 'square']}
        onChange={(v) => setTweak('fabShape', v)}
      />

      <TweakSection label="Painel" />
      <TweakRadio
        label="Formato"
        value={t.panelFormat}
        options={['popover', 'drawer', 'modal']}
        onChange={(v) => setTweak('panelFormat', v)}
      />
      <TweakRadio
        label="Densidade"
        value={t.density}
        options={['compact', 'regular', 'comfortable']}
        onChange={(v) => setTweak('density', v)}
      />
      <TweakToggle
        label="Mostrar perfis"
        value={t.showProfiles}
        onChange={(v) => setTweak('showProfiles', v)}
      />

      <TweakSection label="Aparência" />
      <TweakColor
        label="Cor de acento"
        value={t.accent}
        options={accents}
        onChange={(v) => setTweak('accent', v)}
      />
      <TweakRadio
        label="Idioma"
        value={t.language}
        options={[
          { value: 'pt-BR', label: 'PT' },
          { value: 'en',    label: 'EN' },
        ]}
        onChange={(v) => setTweak('language', v)}
      />
    </TweaksPanel>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
