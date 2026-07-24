// a11y-a11y-features.jsx — Screen Reader (TTS) overlay + Virtual Keyboard

/* ─────────────────────────────────────────────────────────────────────────
   SCREEN READER — click any text on the page to hear it read aloud
   ───────────────────────────────────────────────────────────────────────── */
const READABLE_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,a,button,li,td,th,span,label,figcaption,[data-a11y-readable]';

function ScreenReaderLayer({ active, language, accent }) {
  const [speaking, setSpeaking] = React.useState(false);
  const [currentText, setCurrentText] = React.useState('');
  const hoveredRef = React.useRef(null);

  React.useEffect(() => {
    if (!active) {
      if (hoveredRef.current) { hoveredRef.current.style.outline = ''; hoveredRef.current.style.outlineOffset = ''; hoveredRef.current.style.cursor = ''; }
      window.speechSynthesis && window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    function findTarget(e) {
      const el = e.target.closest(READABLE_SELECTOR);
      if (!el || el.closest('.a11y-panel-root') || el.closest('.a11y-fab')) return null;
      if (!el.closest('.moodle-shell')) return null;
      return el;
    }

    function onOver(e) {
      const el = findTarget(e);
      if (hoveredRef.current && hoveredRef.current !== el) {
        hoveredRef.current.style.outline = '';
        hoveredRef.current.style.outlineOffset = '';
        hoveredRef.current.style.cursor = '';
      }
      if (el) {
        el.style.outline = `2px solid ${accent}`;
        el.style.outlineOffset = '2px';
        el.style.cursor = 'pointer';
        hoveredRef.current = el;
      } else {
        hoveredRef.current = null;
      }
    }

    function onClick(e) {
      const el = findTarget(e);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const text = (el.innerText || el.textContent || '').trim();
      if (!text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === 'pt-BR' ? 'pt-BR' : 'en-US';
      u.rate = 1;
      u.onstart = () => { setSpeaking(true); setCurrentText(text); };
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    }

    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('click', onClick, true);
      if (hoveredRef.current) { hoveredRef.current.style.outline = ''; hoveredRef.current.style.outlineOffset = ''; hoveredRef.current.style.cursor = ''; }
      window.speechSynthesis && window.speechSynthesis.cancel();
      setSpeaking(false);
    };
  }, [active, language, accent]);

  if (!active) return null;

  const t = language === 'pt-BR'
    ? { hint: 'Leitor de tela ativo — clique em qualquer texto para ouvir', reading: 'Lendo…', stop: 'Parar' }
    : { hint: 'Screen reader active — click any text to hear it', reading: 'Reading…', stop: 'Stop' };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)',
      zIndex: 99986, background: 'white', border: '1px solid #e5e7eb',
      borderRadius: 999, boxShadow: '0 10px 30px -8px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.06)',
      padding: '10px 16px 10px 12px', display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#18181b',
      maxWidth: 480,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: accent + '18', color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="volume" size={15} />
      </div>
      {speaking ? (
        <>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{t.reading}</div>
            <div style={{ fontSize: 11.5, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
              {currentText}
            </div>
          </div>
          <button
            onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); }}
            style={{
              border: 0, background: '#fee2e2', color: '#b91c1c', fontWeight: 600,
              fontSize: 11.5, borderRadius: 999, padding: '6px 12px', cursor: 'pointer',
              fontFamily: 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Icon name="pause" size={11} /> {t.stop}
          </button>
        </>
      ) : (
        <span style={{ color: '#52525b' }}>{t.hint}</span>
      )}
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   VIRTUAL KEYBOARD — on-screen keyboard that types into the focused field
   ───────────────────────────────────────────────────────────────────────── */
const KB_ROWS_LETTERS = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];
const KB_ACCENTS = ['á','é','í','ó','ú','ã','õ','ç','â','ê'];

function isEditable(el) {
  if (!el) return false;
  if (el.closest && el.closest('.a11y-panel-root, .a11y-fab')) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (el.type || 'text').toLowerCase();
    return ['text','search','email','url','tel','password','number'].includes(type);
  }
  return false;
}

function insertText(el, text) {
  if (!el) return;
  const start = el.selectionStart != null ? el.selectionStart : el.value.length;
  const end = el.selectionEnd != null ? el.selectionEnd : el.value.length;
  const native = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value') ||
                 Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
  const setter = native && native.set;
  const newVal = el.value.slice(0, start) + text + el.value.slice(end);
  if (setter) setter.call(el, newVal); else el.value = newVal;
  el.selectionStart = el.selectionEnd = start + text.length;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.focus();
}

function deleteBack(el) {
  if (!el) return;
  const start = el.selectionStart != null ? el.selectionStart : el.value.length;
  const end = el.selectionEnd != null ? el.selectionEnd : el.value.length;
  const native = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value') ||
                 Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
  const setter = native && native.set;
  let newVal, pos;
  if (start === end && start > 0) {
    newVal = el.value.slice(0, start - 1) + el.value.slice(end);
    pos = start - 1;
  } else {
    newVal = el.value.slice(0, start) + el.value.slice(end);
    pos = start;
  }
  if (setter) setter.call(el, newVal); else el.value = newVal;
  el.selectionStart = el.selectionEnd = pos;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.focus();
}

function VirtualKeyboard({ active, language, accent }) {
  const [target, setTarget] = React.useState(null);
  const [shift, setShift] = React.useState(false);
  const targetRef = React.useRef(null);

  React.useEffect(() => { targetRef.current = target; }, [target]);

  React.useEffect(() => {
    if (!active) return;
    function onFocusIn(e) {
      if (isEditable(e.target)) setTarget(e.target);
    }
    document.addEventListener('focusin', onFocusIn, true);
    // Auto-pick the page search field if nothing is focused yet
    if (!targetRef.current) {
      const fallback = document.querySelector('.moodle-shell input[type="text"], .moodle-shell input:not([type])');
      if (fallback) setTarget(fallback);
    }
    return () => document.removeEventListener('focusin', onFocusIn, true);
  }, [active]);

  if (!active) return null;

  const t = language === 'pt-BR'
    ? { typingIn: 'Digitando em', none: 'Clique em um campo de texto', space: 'espaço' }
    : { typingIn: 'Typing into', none: 'Click a text field', space: 'space' };

  const label = target ? (target.getAttribute('aria-label') || target.placeholder || target.name || 'campo de texto') : t.none;

  function press(ch) {
    const el = targetRef.current;
    if (!el) return;
    insertText(el, shift ? ch.toUpperCase() : ch);
    if (shift) setShift(false);
  }

  const rowsWithCase = shift
    ? KB_ROWS_LETTERS.map((row, i) => i === 0 ? row : row.map(c => c.toUpperCase()))
    : KB_ROWS_LETTERS;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0,
      zIndex: 99982, background: '#f4f4f5', borderTop: '1px solid #e2e2e5',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
      padding: '10px 14px 14px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        fontSize: 12, color: '#52525b',
      }}>
        <Icon name="keyboard" size={14} style={{ color: accent }} />
        <span>{t.typingIn}:</span>
        <span style={{ fontWeight: 600, color: target ? '#18181b' : '#9ca3af' }}>{label}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 760, margin: '0 auto' }}>
        {rowsWithCase.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {ri === 2 && <KbKey wide onClick={() => setShift(s => !s)} active={shift} accent={accent}><Icon name="chevronDown" size={14} style={{ transform: 'rotate(180deg)' }} /></KbKey>}
            {row.map(ch => (
              <KbKey key={ch} onClick={() => press(ch)} accent={accent}>{ch}</KbKey>
            ))}
            {ri === 2 && <KbKey wide onClick={() => deleteBack(targetRef.current)} accent={accent}><Icon name="close" size={14} /></KbKey>}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {KB_ACCENTS.map(ch => (
            <KbKey key={ch} small onClick={() => press(ch)} accent={accent}>{ch}</KbKey>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <KbKey wide onClick={() => press('.')} accent={accent}>.</KbKey>
          <KbKey wide onClick={() => press(',')} accent={accent}>,</KbKey>
          <button
            onClick={() => press(' ')}
            style={{
              flex: 1, maxWidth: 360, height: 42, borderRadius: 9, border: '1px solid #e5e7eb',
              background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5,
              color: '#52525b', fontWeight: 500,
            }}
          >
            {t.space}
          </button>
          <KbKey wide onClick={() => press('\n')} accent={accent}><Icon name="arrowRight" size={14} /></KbKey>
        </div>
      </div>
    </div>,
    document.body
  );
}

function KbKey({ children, onClick, wide, small, active, accent }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{
        width: small ? 34 : wide ? 52 : 40,
        height: small ? 34 : 42,
        borderRadius: 9,
        border: active ? `1.5px solid ${accent}` : '1px solid #e5e7eb',
        background: active ? accent + '14' : 'white',
        color: active ? accent : '#18181b',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: small ? 12 : 14,
        fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 100ms ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f4f4f5'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'white'; }}
    >
      {children}
    </button>
  );
}

// (entrance animation intentionally omitted — this preview environment can
// leave CSS keyframe animations stuck mid-run, which broke fixed positioning)


Object.assign(window, { ScreenReaderLayer, VirtualKeyboard });
