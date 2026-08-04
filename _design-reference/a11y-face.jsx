// a11y-face.jsx — Face Navigation via MediaPipe FaceLandmarker
//
// Architecture:
//   - MediaPipe loaded once via injected <script type="module"> to bypass
//     Babel standalone's module transformation.
//   - Detection loop runs entirely in refs (no setState inside rAF) so the
//     30fps update path never triggers a React re-render.
//   - Virtual cursor position is written directly to the DOM element style.
//   - React state is only used for the HUD status machine and sensitivity UI.

/* ─────────────────────────────────────────────────────────────────────────
   MEDIAPIPE LOADER
   Injects a <script type="module"> that imports MediaPipe and stores the
   constructors globally, then resolves the returned Promise via a DOM event.
   Safe to call multiple times — caches the result on window.__mp.
   ───────────────────────────────────────────────────────────────────────── */
const MP_CDN   = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18';
const MP_WASM  = MP_CDN + '/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

function loadMediaPipe() {
  if (window.__mp) return Promise.resolve(window.__mp);
  return new Promise((resolve, reject) => {
    document.addEventListener('__mp_ready', () => resolve(window.__mp), { once: true });
    document.addEventListener('__mp_error', (e) => reject(new Error(e.detail)), { once: true });
    const s = document.createElement('script');
    s.type = 'module';
    // Inline module: imports MediaPipe and exposes constructors globally.
    s.textContent = [
      "import { FaceLandmarker, FilesetResolver }",
      "  from '" + MP_CDN + "/vision_bundle.mjs';",
      "window.__mp = { FaceLandmarker, FilesetResolver };",
      "document.dispatchEvent(new Event('__mp_ready'));",
    ].join('\n');
    s.onerror = () => document.dispatchEvent(
      new CustomEvent('__mp_error', { detail: 'Failed to load MediaPipe script' })
    );
    document.head.appendChild(s);
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   CLICK HELPER
   elementFromPoint skips pointer-events:none elements in Chrome, so the
   virtual cursor (pointer-events:none) is transparent to hit-testing.
   ───────────────────────────────────────────────────────────────────────── */
function syntheticClick(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return;
  el.focus({ preventScroll: true });
  ['pointerdown', 'pointerup'].forEach(type =>
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }))
  );
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
}

/* ─────────────────────────────────────────────────────────────────────────
   DWELL RING — SVG arc that fills over the dwell period for click feedback
   ───────────────────────────────────────────────────────────────────────── */
function DwellRing({ progress, size, accent }) {
  const r    = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      width={size} height={size}
      style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      aria-hidden="true"
    >
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={accent}
        strokeWidth={3}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - progress)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 60ms linear' }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FACE NAVIGATION LAYER
   ───────────────────────────────────────────────────────────────────────── */
function FaceNavigationLayer({ active, language, accent }) {
  // ── UI state (drives HUD re-renders only) ─────────────────────────────
  const [status, setStatus]           = React.useState('idle');
  const [errorMsg, setErrorMsg]       = React.useState('');
  const [sensitivity, setSensitivity] = React.useState(3);
  const [dwellSrc, setDwellSrc]       = React.useState(null); // 'jaw'|'blink'|null
  const [dwellPct, setDwellPct]       = React.useState(0);

  // ── Refs (hot path — no React re-renders) ─────────────────────────────
  const videoRef       = React.useRef(null);
  const cursorElRef    = React.useRef(null);
  const landmarkerRef  = React.useRef(null);
  const streamRef      = React.useRef(null);
  const animRef        = React.useRef(null);
  const isRunningRef   = React.useRef(false);
  const captureNextRef = React.useRef(false);
  const neutralRef     = React.useRef(null);
  const cursorRef      = React.useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const velRef         = React.useRef({ vx: 0, vy: 0 });
  const sensitivityRef = React.useRef(3);
  const jawDwellRef    = React.useRef(null);
  const blinkDwellRef  = React.useRef(null);
  const jawActiveRef   = React.useRef(false);
  const blinkActiveRef = React.useRef(false);
  // Mirror dwellSrc in a ref so detect() can read it without stale closure
  const dwellSrcRef    = React.useRef(null);

  React.useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);
  React.useEffect(() => { dwellSrcRef.current = dwellSrc; }, [dwellSrc]);

  // ── Lifecycle ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!active) { stopAll(); return; }
    startFaceNav();
    return stopAll;
  }, [active]);

  // ── STOP ALL ──────────────────────────────────────────────────────────
  function stopAll() {
    isRunningRef.current = false;
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (landmarkerRef.current) {
      try { landmarkerRef.current.close(); } catch (_) {}
      landmarkerRef.current = null;
    }
    neutralRef.current     = null;
    jawDwellRef.current    = null;
    blinkDwellRef.current  = null;
    jawActiveRef.current   = false;
    blinkActiveRef.current = false;
    setStatus('idle');
    setDwellSrc(null);
    setDwellPct(0);
  }

  // ── START — Promise chain (no async/await for Babel standalone compat) ──
  function startFaceNav() {
    setStatus('loading');
    setErrorMsg('');

    var mp, vision, landmarker, stream;

    loadMediaPipe()
      .then(function(result) {
        mp = result;
        return mp.FilesetResolver.forVisionTasks(MP_WASM);
      })
      .then(function(v) {
        vision = v;
        return mp.FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MP_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });
      })
      .then(function(lm) {
        landmarkerRef.current = lm;
        return navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
      })
      .then(function(s) {
        stream = s;
        streamRef.current = stream;
        // Switch to 'calibrating' first so the <video> element is rendered
        // and videoRef.current becomes available before we attach the stream.
        setStatus('calibrating');
        return new Promise(function(res) {
          // Give React one tick to commit the <video> element to the DOM.
          setTimeout(function() {
            var vid = videoRef.current;
            if (!vid) { res(); return; }
            vid.srcObject = stream;
            vid.onloadedmetadata = function() { vid.play(); res(); };
            // If metadata already loaded (unlikely), resolve immediately.
            if (vid.readyState >= 1) { vid.play(); res(); }
          }, 0);
        });
      })
      .then(function() {
        // Status already set to 'calibrating' above.
      })
      .catch(function(e) {
        setErrorMsg(e.message || String(e));
        setStatus('error');
      });
  }

  // ── CALIBRATE ─────────────────────────────────────────────────────────
  function calibrate() {
    captureNextRef.current = true;
    cursorRef.current      = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    velRef.current         = { vx: 0, vy: 0 };
    isRunningRef.current   = true;
    setStatus('active');
    animRef.current = requestAnimationFrame(detect);
  }

  // ── DETECTION LOOP ─────────────────────────────────────────────────────
  function detect() {
    if (!isRunningRef.current) return;

    const video = videoRef.current;
    const lm    = landmarkerRef.current;
    if (!lm || !video || video.readyState < 2) {
      animRef.current = requestAnimationFrame(detect);
      return;
    }

    const results     = lm.detectForVideo(video, performance.now());
    const matrices    = results.facialTransformationMatrixes;
    const blendshapes = results.faceBlendshapes;

    if (matrices && matrices.length > 0 && blendshapes && blendshapes.length > 0) {
      const m   = matrices[0].data;
      const bsl = blendshapes[0].categories;
      const bs  = (name) => (bsl.find(b => b.categoryName === name) || {}).score || 0;

      const jawOpen  = bs('jawOpen');
      const eyeL     = bs('eyeBlinkLeft');
      const eyeR     = bs('eyeBlinkRight');
      const eyeBlink = (eyeL + eyeR) / 2;

      // ── CALIBRATION CAPTURE ───────────────────────────────────────────
      if (captureNextRef.current) {
        neutralRef.current     = { m8: m[8], m9: m[9], jaw: jawOpen, blink: eyeBlink };
        captureNextRef.current = false;
      }

      if (neutralRef.current) {
        const n   = neutralRef.current;
        const spd = sensitivityRef.current * 5;
        const DZ  = 0.018;

        // ── JOYSTICK VELOCITY ─────────────────────────────────────────
        // m[8] = X component of face Z-axis in camera space → yaw control
        // m[9] = Y component of face Z-axis in camera space → pitch control (inverted)
        const dyaw   = m[8] - n.m8;
        const dpitch = m[9] - n.m9;
        const tvx    = Math.abs(dyaw)   > DZ ? dyaw    * spd * 8 : 0;
        const tvy    = Math.abs(dpitch) > DZ ? -dpitch * spd * 8 : 0;

        const ALPHA = 0.25;
        const vel   = velRef.current;
        vel.vx = ALPHA * tvx + (1 - ALPHA) * vel.vx;
        vel.vy = ALPHA * tvy + (1 - ALPHA) * vel.vy;

        const pos = cursorRef.current;
        pos.x = Math.max(0, Math.min(window.innerWidth  - 1, pos.x + vel.vx));
        pos.y = Math.max(0, Math.min(window.innerHeight - 1, pos.y + vel.vy));

        if (cursorElRef.current) {
          cursorElRef.current.style.left = pos.x + 'px';
          cursorElRef.current.style.top  = pos.y + 'px';
        }

        // ── JAW CLICK (400ms dwell) ───────────────────────────────────
        const JAW_T = Math.min(0.90, n.jaw + 0.25);
        const now   = performance.now();

        if (jawOpen > JAW_T) {
          if (!jawActiveRef.current) {
            if (!jawDwellRef.current) {
              jawDwellRef.current = now;
            } else {
              const elapsed = now - jawDwellRef.current;
              setDwellSrc('jaw');
              setDwellPct(Math.min(1, elapsed / 400));
              if (elapsed >= 400) {
                syntheticClick(pos.x, pos.y);
                jawActiveRef.current = true;
                jawDwellRef.current  = null;
                setDwellSrc(null);
                setDwellPct(0);
              }
            }
          }
        } else {
          jawDwellRef.current  = null;
          jawActiveRef.current = false;
          if (dwellSrcRef.current === 'jaw') { setDwellSrc(null); setDwellPct(0); }
        }

        // ── BLINK CLICK (500ms dwell) ─────────────────────────────────
        const BLINK_T = Math.min(0.90, n.blink + 0.30);

        if (eyeBlink > BLINK_T) {
          if (!blinkActiveRef.current) {
            if (!blinkDwellRef.current) {
              blinkDwellRef.current = now;
            } else {
              const elapsed = now - blinkDwellRef.current;
              setDwellSrc('blink');
              setDwellPct(Math.min(1, elapsed / 500));
              if (elapsed >= 500) {
                syntheticClick(pos.x, pos.y);
                blinkActiveRef.current = true;
                blinkDwellRef.current  = null;
                setDwellSrc(null);
                setDwellPct(0);
              }
            }
          }
        } else {
          blinkDwellRef.current  = null;
          blinkActiveRef.current = false;
          if (dwellSrcRef.current === 'blink') { setDwellSrc(null); setDwellPct(0); }
        }
      }
    }

    animRef.current = requestAnimationFrame(detect);
  }

  // ── i18n ──────────────────────────────────────────────────────────────
  const T = language === 'pt-BR' ? {
    loading:     'Carregando modelo…',
    camHint:     'Olhe para a câmera em posição neutra e clique em Calibrar.',
    calibrate:   'Calibrar',
    active:      'Câmera ativa',
    stop:        'Parar',
    sensitivity: 'Sensibilidade',
    error:       'Erro ao iniciar',
    jawHint:     'Abrir boca → clicar',
    blinkHint:   'Piscar → clicar',
  } : {
    loading:     'Loading model…',
    camHint:     'Look at the camera in a neutral position, then click Calibrate.',
    calibrate:   'Calibrate',
    active:      'Camera active',
    stop:        'Stop',
    sensitivity: 'Sensitivity',
    error:       'Failed to start',
    jawHint:     'Open mouth → click',
    blinkHint:   'Blink → click',
  };

  // ── RENDER ────────────────────────────────────────────────────────────
  if (!active && status === 'idle') return null;

  const CURSOR_SIZE = 40;

  return ReactDOM.createPortal(
    <>
      {/* ── VIRTUAL CURSOR ── */}
      {status === 'active' && (
        <div
          ref={cursorElRef}
          aria-hidden="true"
          style={{
            position:      'fixed',
            left:          cursorRef.current.x,
            top:           cursorRef.current.y,
            width:         CURSOR_SIZE,
            height:        CURSOR_SIZE,
            transform:     'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex:        999999,
          }}
        >
          {dwellSrc && <DwellRing progress={dwellPct} size={CURSOR_SIZE} accent={accent} />}
          <div style={{
            position:     'absolute',
            top:          '50%',
            left:         '50%',
            transform:    'translate(-50%, -50%)',
            width:        14,
            height:       14,
            borderRadius: '50%',
            background:   accent,
            boxShadow:    '0 0 0 3px white, 0 2px 12px rgba(0,0,0,0.5)',
          }} />
        </div>
      )}

      {/* ── HUD ── */}
      <div style={{
        position:     'fixed',
        bottom:       20,
        right:        20,
        zIndex:       99992,
        width:        200,
        background:   'white',
        border:       '1px solid #e5e7eb',
        borderRadius: 14,
        boxShadow:    '0 10px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
        fontFamily:   "'Inter', system-ui, sans-serif",
        fontSize:     12,
        color:        '#18181b',
        overflow:     'hidden',
      }}>

        {/* Camera preview — always mounted so videoRef is available during loading */}
        <div style={{
          position:   'relative',
          background: '#000',
          lineHeight: 0,
          display:    status === 'loading' || status === 'error' ? 'none' : 'block',
        }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{
              display:     'block',
              width:       '100%',
              aspectRatio: '4/3',
              objectFit:   'cover',
              transform:   'scaleX(-1)',
            }}
          />
          {status === 'active' && (
            <span style={{
              position:     'absolute',
              top:          8,
              left:         8,
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   '#22c55e',
              boxShadow:    '0 0 0 2px white',
              display:      'block',
            }} />
          )}
        </div>

        <div style={{ padding: '10px 12px 12px' }}>

          {/* LOADING */}
          {status === 'loading' && (
            <>
              <style>{`@keyframes a11y-spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" style={{ animation: 'a11y-spin 1s linear infinite', flexShrink: 0 }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                {T.loading}
              </div>
            </>
          )}

          {/* ERROR */}
          {status === 'error' && (
            <div>
              <div style={{ fontWeight: 600, color: '#b91c1c', marginBottom: 2 }}>{T.error}</div>
              <div style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-word' }}>{errorMsg}</div>
            </div>
          )}

          {/* CALIBRATING */}
          {status === 'calibrating' && (
            <>
              <p style={{ margin: '0 0 8px', color: '#52525b', lineHeight: 1.45 }}>{T.camHint}</p>
              <button
                onClick={calibrate}
                style={{
                  width: '100%', padding: '7px 0', borderRadius: 8, border: 0,
                  background: accent, color: 'white', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {T.calibrate}
              </button>
            </>
          )}

          {/* ACTIVE */}
          {status === 'active' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>●</span>
                <span style={{ fontWeight: 500 }}>{T.active}</span>
              </div>

              <div style={{ color: '#6b7280', marginBottom: 10, lineHeight: 1.6 }}>
                <div>👄 {T.jawHint}</div>
                <div>👁 {T.blinkHint}</div>
              </div>

              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                {T.sensitivity}: {sensitivity}
              </label>
              <input
                type="range" min="1" max="5" step="1"
                value={sensitivity}
                onChange={e => setSensitivity(Number(e.target.value))}
                style={{ width: '100%', accentColor: accent, cursor: 'pointer' }}
              />

              <button
                onClick={stopAll}
                style={{
                  marginTop: 10, width: '100%', padding: '7px 0', borderRadius: 8,
                  border: '1px solid #fecaca', background: '#fee2e2', color: '#b91c1c',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {T.stop}
              </button>
            </>
          )}

        </div>
      </div>
    </>,
    document.body
  );
}

Object.assign(window, { FaceNavigationLayer });
