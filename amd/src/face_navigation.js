// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Face Navigation via MediaPipe FaceLandmarker.
 *
 * Architecture (same as reading_guide.js / voice_commands.js pattern):
 *   - Module-level vars for all mutable state (no framework).
 *   - start() builds DOM, loads MediaPipe, gets webcam.
 *   - stop() tears everything down and releases the camera.
 *   - sync(active) calls start or stop.
 *   - MediaPipe is loaded via an injected <script type="module"> to avoid
 *     AMD/ES-module conflicts — the constructor refs are stored on window.__mp.
 *   - The detection rAF loop writes the cursor position directly to the DOM
 *     element's style — no framework re-render on every frame.
 *
 * @module     local_a11y/face_navigation
 * @description Face Navigation via MediaPipe FaceLandmarker.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

const MP_CDN   = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18';
const MP_WASM  = MP_CDN + '/wasm';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// sessionStorage: persists the captured neutral pose (and sensitivity) once
// the user has calibrated. Navigating to a new page (a fresh document) then
// re-opens the camera and restores this calibration WITHOUT recalibrating, so
// the feature keeps working seamlessly across pages. Cleared only when the
// user turns the feature off (so re-enabling requires a fresh calibration).
const CALIB_KEY = 'local_a11y_face_calibration';

const saveCalibration = () => {
    try {
        sessionStorage.setItem(CALIB_KEY, JSON.stringify({neutral, sensitivity}));
    } catch (e) {
        // sessionStorage unavailable (private mode etc.) - degrade gracefully.
    }
};
const loadCalibration = () => {
    try {
        const raw = sessionStorage.getItem(CALIB_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (parsed && parsed.neutral && typeof parsed.neutral.m8 === 'number') {
            return parsed;
        }
        return null;
    } catch (e) {
        return null;
    }
};
const clearCalibration = () => {
    try {
        sessionStorage.removeItem(CALIB_KEY);
    } catch (e) {
        // Ignore.
    }
};

// ── Module-level state ────────────────────────────────────────────────────────
let hud        = null;
let cursorEl   = null;
let videoEl    = null;
let stream     = null;
let landmarker = null;
let animFrame  = null;
let isRunning  = false;
let captureNext = false;
let neutral    = null;
let cursorPos  = {x: 0, y: 0};
let vel        = {vx: 0, vy: 0};
let jawDwell   = null;
let blinkDwell = null;
let jawActive  = false;
let blinkActive = false;
let sensitivity = 3;

// ── i18n — inline strings keyed by language ───────────────────────────────────
const STRINGS = {
    pt: {
        loading:  'Carregando modelo…',
        camHint:  'Olhe para a câmera em posição neutra e clique em Calibrar.',
        calibrate:'Calibrar',
        active:   'Câmera ativa',
        stop:     'Parar',
        sens:     'Velocidade do Cursor Virtual',
        error:    'Erro ao iniciar',
        click:    'Clique: Abrir a boca ou piscar com os dois olhos',
        scroll:   'Rolar página: Leve o cursor virtual até a borda superior ou inferior da página',
    },
    en: {
        loading:  'Loading model…',
        camHint:  'Look at the camera in a neutral position, then click Calibrate.',
        calibrate:'Calibrate',
        active:   'Camera active',
        stop:     'Stop',
        sens:     'Virtual Cursor Speed',
        error:    'Failed to start',
        click:    'Click: Open your mouth or blink both eyes',
        scroll:   'Scroll page: Move the virtual cursor to the top or bottom edge of the page',
    },
};

const t = (key) => {
    const lang = (document.documentElement.lang || 'en').startsWith('pt') ? 'pt' : 'en';
    return (STRINGS[lang] || STRINGS.en)[key];
};

// ── MediaPipe loader ──────────────────────────────────────────────────────────
// Injects a <script type="module"> that imports FaceLandmarker/FilesetResolver
// and stores them on window.__mp. Resolves via a DOM event. Idempotent.
const loadMediaPipe = () => {
    if (window.__mp) {
        return Promise.resolve(window.__mp);
    }
    return new Promise((resolve, reject) => {
        document.addEventListener('__mp_ready', () => resolve(window.__mp), {once: true});
        document.addEventListener('__mp_error', (e) => reject(new Error(e.detail)), {once: true});
        const s = document.createElement('script');
        s.type = 'module';
        s.textContent = [
            "import { FaceLandmarker, FilesetResolver }",
            "  from '" + MP_CDN + "/vision_bundle.mjs';",
            "window.__mp = { FaceLandmarker, FilesetResolver };",
            "document.dispatchEvent(new Event('__mp_ready'));",
        ].join('\n');
        s.onerror = () => document.dispatchEvent(
            new CustomEvent('__mp_error', {detail: 'Failed to load MediaPipe'})
        );
        document.head.appendChild(s);
    });
};

// ── Click helper ──────────────────────────────────────────────────────────────
// pointer-events:none on the cursor means elementFromPoint sees through it.
const syntheticClick = (x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el) {
        return;
    }
    el.focus({preventScroll: true});
    ['pointerdown', 'pointerup'].forEach((type) =>
        el.dispatchEvent(new PointerEvent(type, {bubbles: true, cancelable: true, clientX: x, clientY: y}))
    );
    el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, clientX: x, clientY: y}));
};

// ── DOM helpers ───────────────────────────────────────────────────────────────
const buildHud = () => {
    const el = document.createElement('div');
    el.className = 'local-a11y-root local-a11y-face-hud';
    el.style.cssText = [
        'position:fixed', 'bottom:20px', 'right:20px', 'z-index:99992',
        'width:200px', 'background:white', 'border:1px solid #e5e7eb',
        'border-radius:14px', 'box-shadow:0 10px 32px rgba(0,0,0,.14)',
        'font-family:Inter,system-ui,sans-serif', 'font-size:12px',
        'color:#18181b', 'overflow:hidden',
    ].join(';');
    document.body.appendChild(el);
    return el;
};

const CURSOR_SIZE = 40;
const RING_R = (CURSOR_SIZE - 4) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

const buildCursor = () => {
    const el = document.createElement('div');
    el.className = 'local-a11y-root local-a11y-face-cursor';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
        'position:fixed', 'pointer-events:none', 'z-index:999999',
        'width:' + CURSOR_SIZE + 'px', 'height:' + CURSOR_SIZE + 'px',
        'transform:translate(-50%,-50%)', 'display:none',
    ].join(';');
    // Dwell ring
    el.innerHTML = '<svg width="' + CURSOR_SIZE + '" height="' + CURSOR_SIZE + '" viewBox="0 0 ' +
        CURSOR_SIZE + ' ' + CURSOR_SIZE + '" style="position:absolute;top:0;left:0;transform:rotate(-90deg)" aria-hidden="true">' +
        '<circle cx="' + (CURSOR_SIZE / 2) + '" cy="' + (CURSOR_SIZE / 2) + '" r="' + RING_R + '"' +
        ' fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"' +
        ' stroke-dasharray="' + RING_CIRC + '" stroke-dashoffset="' + RING_CIRC + '"/></svg>' +
        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;' +
        'border-radius:50%;background:#3b82f6;box-shadow:0 0 0 3px white,0 2px 12px rgba(0,0,0,.5)"></div>';
    document.body.appendChild(el);
    return el;
};

const setDwellProgress = (pct) => {
    if (!cursorEl) {
        return;
    }
    const circle = cursorEl.querySelector('circle');
    if (circle) {
        circle.style.strokeDashoffset = String(RING_CIRC * (1 - pct));
    }
};

// ── HUD state renderers ───────────────────────────────────────────────────────
const renderLoading = () => {
    hud.innerHTML = '<style>@keyframes a11y-face-spin{to{transform:rotate(360deg)}}</style>' +
        '<div style="padding:12px;color:#6b7280;display:flex;align-items:center;gap:8px">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" style="animation:a11y-face-spin 1s linear infinite;flex-shrink:0">' +
        '<path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>' + t('loading') + '</div>';
};

const renderError = (msg) => {
    hud.innerHTML = '<div style="padding:12px"><div style="font-weight:600;color:#b91c1c;margin-bottom:2px">' +
        t('error') + '</div><div style="font-size:11px;color:#6b7280;word-break:break-word">' +
        String(msg).replace(/</g, '&lt;') + '</div></div>';
};

const attachVideoStream = () => {
    if (videoEl && stream) {
        videoEl.srcObject = stream;
        videoEl.play().catch(() => {});
    }
};

const renderCalibrating = () => {
    hud.innerHTML = '';

    const preview = document.createElement('div');
    preview.style.cssText = 'position:relative;background:#000;line-height:0';
    videoEl = document.createElement('video');
    videoEl.muted = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.style.cssText = 'display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1)';
    preview.appendChild(videoEl);
    hud.appendChild(preview);
    attachVideoStream();

    const body = document.createElement('div');
    body.style.cssText = 'padding:10px 12px 12px';
    const hint = document.createElement('p');
    hint.style.cssText = 'margin:0 0 8px;color:#52525b;line-height:1.45';
    hint.textContent = t('camHint');
    body.appendChild(hint);

    const btn = document.createElement('button');
    btn.textContent = t('calibrate');
    btn.style.cssText = 'width:100%;padding:7px 0;border-radius:8px;border:0;background:#3b82f6;' +
        'color:white;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer';
    btn.addEventListener('click', calibrate);
    body.appendChild(btn);
    hud.appendChild(body);
};

const renderActive = () => {
    hud.innerHTML = '';

    const preview = document.createElement('div');
    preview.style.cssText = 'position:relative;background:#000;line-height:0';
    videoEl = document.createElement('video');
    videoEl.muted = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.style.cssText = 'display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1)';
    const dot = document.createElement('span');
    dot.style.cssText = 'position:absolute;top:8px;left:8px;width:8px;height:8px;border-radius:50%;' +
        'background:#22c55e;box-shadow:0 0 0 2px white;display:block';
    preview.appendChild(videoEl);
    preview.appendChild(dot);
    hud.appendChild(preview);
    attachVideoStream();

    const body = document.createElement('div');
    body.style.cssText = 'padding:10px 12px 12px';

    const statusRow = document.createElement('div');
    statusRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:8px';
    statusRow.innerHTML = '<span style="color:#22c55e;font-weight:700">●</span>' +
        '<span style="font-weight:500">' + t('active') + '</span>';
    body.appendChild(statusRow);

    const hints = document.createElement('div');
    hints.style.cssText = 'color:#6b7280;margin-bottom:10px;line-height:1.6';
    hints.innerHTML = '<div style="margin-bottom:4px">🖱️ ' + t('click') + '</div>'
        + '<div>↕️ ' + t('scroll') + '</div>';
    body.appendChild(hints);

    const sensLabel = document.createElement('label');
    sensLabel.style.cssText = 'display:block;margin-bottom:4px;font-weight:500';
    const sensSpan = document.createElement('span');
    sensSpan.id = 'a11y-face-sens-val';
    sensSpan.textContent = String(sensitivity);
    sensLabel.textContent = t('sens') + ': ';
    sensLabel.appendChild(sensSpan);
    body.appendChild(sensLabel);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '5';
    slider.step = '1';
    slider.value = String(sensitivity);
    slider.style.cssText = 'width:100%;cursor:pointer;accent-color:#3b82f6';
    slider.addEventListener('input', (e) => {
        sensitivity = Number(e.target.value);
        if (sensSpan) {
            sensSpan.textContent = String(sensitivity);
        }
    });
    body.appendChild(slider);

    const stopBtn = document.createElement('button');
    stopBtn.textContent = t('stop');
    stopBtn.style.cssText = 'margin-top:10px;width:100%;padding:7px 0;border-radius:8px;' +
        'border:1px solid #fecaca;background:#fee2e2;color:#b91c1c;' +
        'font-family:inherit;font-size:12px;font-weight:600;cursor:pointer';
    // Explicit Stop is a deliberate user action: ask main.js to switch the
    // Face Navigation option OFF entirely (it persists the preference,
    // updates the panel toggle, and calls sync(false) -> clearCalibration +
    // stop for us). Dispatched as an event to keep this module decoupled from
    // the panel/settings state.
    stopBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('local_a11y/face-disable'));
    });
    body.appendChild(stopBtn);
    hud.appendChild(body);
};

// ── Enter the live "active" state ───────────────────────────────────────────────
// recapture=true  -> capture a fresh neutral pose on the next frame (Calibrate)
// recapture=false -> keep the (restored) neutral pose (resume after navigation)
const enterActive = (recapture) => {
    captureNext = recapture;
    cursorPos = {x: window.innerWidth / 2, y: window.innerHeight / 2};
    vel = {vx: 0, vy: 0};
    isRunning = true;
    if (cursorEl) {
        cursorEl.style.left = cursorPos.x + 'px';
        cursorEl.style.top = cursorPos.y + 'px';
        cursorEl.style.display = 'block';
    }
    renderActive();
    animFrame = requestAnimationFrame(detect);
};

const calibrate = () => enterActive(true);

// ── Detection loop ────────────────────────────────────────────────────────────
const detect = () => {
    if (!isRunning) {
        return;
    }
    if (!landmarker || !videoEl || videoEl.readyState < 2) {
        animFrame = requestAnimationFrame(detect);
        return;
    }

    const results = landmarker.detectForVideo(videoEl, performance.now());
    const matrices = results.facialTransformationMatrixes;
    const bsList   = results.faceBlendshapes;

    if (matrices && matrices.length > 0 && bsList && bsList.length > 0) {
        const m   = matrices[0].data;
        const bsl = bsList[0].categories;
        const bs  = (name) => (bsl.find((b) => b.categoryName === name) || {}).score || 0;

        const jawOpen  = bs('jawOpen');
        const eyeBlink = (bs('eyeBlinkLeft') + bs('eyeBlinkRight')) / 2;

        // Capture neutral on first frame after calibrate() call, then persist
        // it so navigating to another page can resume without recalibrating.
        if (captureNext) {
            neutral = {m8: m[8], m9: m[9], jaw: jawOpen, blink: eyeBlink};
            captureNext = false;
            saveCalibration();
        }

        if (neutral) {
            // ── Joystick velocity ──────────────────────────────────────────
            // The webcam preview is mirrored (scaleX(-1)) but MediaPipe reports
            // unmirrored coordinates, so the X (yaw) axis is negated to match
            // what the user sees: turning the head right moves the cursor right.
            const spd = sensitivity * 6;
            const DZ  = 0.03;
            const tvx = Math.abs(m[8] - neutral.m8) > DZ ? -(m[8] - neutral.m8) * spd : 0;
            const tvy = Math.abs(m[9] - neutral.m9) > DZ ? -(m[9] - neutral.m9) * spd : 0;

            vel.vx = 0.2 * tvx + 0.8 * vel.vx;
            vel.vy = 0.2 * tvy + 0.8 * vel.vy;
            cursorPos.x = Math.max(0, Math.min(window.innerWidth  - 1, cursorPos.x + vel.vx));
            cursorPos.y = Math.max(0, Math.min(window.innerHeight - 1, cursorPos.y + vel.vy));

            if (cursorEl) {
                cursorEl.style.left = cursorPos.x + 'px';
                cursorEl.style.top  = cursorPos.y + 'px';
            }

            // ── Edge scrolling ─────────────────────────────────────────────
            // When the cursor reaches the top/bottom band of the viewport, the
            // page scrolls in that direction, with speed proportional to how
            // deep into the band it is. Lets the user scroll purely by tilting
            // the head up/down (moving the cursor to the screen edges).
            const edge = Math.max(70, window.innerHeight * 0.09);
            const SCROLL_MAX = 20;
            let scrollAmt = 0;
            if (cursorPos.y < edge) {
                scrollAmt = -SCROLL_MAX * (1 - cursorPos.y / edge);
            } else if (cursorPos.y > window.innerHeight - edge) {
                scrollAmt = SCROLL_MAX * (1 - (window.innerHeight - cursorPos.y) / edge);
            }
            if (scrollAmt !== 0) {
                window.scrollBy(0, scrollAmt);
            }

            // ── Jaw click (400ms dwell) ────────────────────────────────────
            const now   = performance.now();
            const jawT  = Math.min(0.9, neutral.jaw + 0.25);
            if (jawOpen > jawT) {
                if (!jawActive) {
                    if (!jawDwell) {
                        jawDwell = now;
                    } else {
                        const elapsed = now - jawDwell;
                        setDwellProgress(Math.min(1, elapsed / 400));
                        if (elapsed >= 400) {
                            syntheticClick(cursorPos.x, cursorPos.y);
                            jawActive = true;
                            jawDwell  = null;
                            setDwellProgress(0);
                        }
                    }
                }
            } else {
                jawDwell  = null;
                jawActive = false;
                setDwellProgress(0);
            }

            // ── Blink click (500ms dwell) ──────────────────────────────────
            const blinkT = Math.min(0.9, neutral.blink + 0.30);
            if (eyeBlink > blinkT) {
                if (!blinkActive) {
                    if (!blinkDwell) {
                        blinkDwell = now;
                    } else {
                        const elapsed = now - blinkDwell;
                        setDwellProgress(Math.min(1, elapsed / 500));
                        if (elapsed >= 500) {
                            syntheticClick(cursorPos.x, cursorPos.y);
                            blinkActive = true;
                            blinkDwell  = null;
                            setDwellProgress(0);
                        }
                    }
                }
            } else {
                blinkDwell  = null;
                blinkActive = false;
            }
        }
    }

    animFrame = requestAnimationFrame(detect);
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start face navigation. Idempotent.
 */
export const start = () => {
    if (hud) {
        return;
    }

    hud      = buildHud();
    cursorEl = buildCursor();
    renderLoading();

    loadMediaPipe()
        .then((mp) => mp.FilesetResolver.forVisionTasks(MP_WASM).then((vision) => ({mp, vision})))
        .then(({mp, vision}) => mp.FaceLandmarker.createFromOptions(vision, {
            baseOptions: {modelAssetPath: MP_MODEL, delegate: 'GPU'},
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
        }))
        .then((lm) => {
            landmarker = lm;
            return navigator.mediaDevices.getUserMedia(
                {video: {width: 640, height: 480, facingMode: 'user'}}
            );
        })
        .then((s) => {
            stream = s;
            const calib = loadCalibration();
            if (calib) {
                // Already calibrated before navigating: restore the saved
                // neutral pose and go straight to the live state - no manual
                // Calibrate step and no recalibration needed.
                neutral = calib.neutral;
                if (typeof calib.sensitivity === 'number') {
                    sensitivity = calib.sensitivity;
                }
                enterActive(false);
            } else {
                renderCalibrating();
            }
        })
        .catch((e) => {
            renderError(e.message || String(e));
        });
};

/**
 * Stop face navigation and release the camera. Idempotent.
 */
export const stop = () => {
    isRunning = false;
    if (animFrame) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
    }
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
    }
    if (landmarker) {
        try { landmarker.close(); } catch (_) {}
        landmarker = null;
    }
    if (hud) { hud.remove(); hud = null; }
    if (cursorEl) { cursorEl.remove(); cursorEl = null; }
    videoEl     = null;
    neutral     = null;
    jawDwell    = blinkDwell = null;
    jawActive   = blinkActive = false;
    captureNext = false;
};

/**
 * @param {Boolean} active
 */
export const sync = (active) => {
    if (active) {
        start();
    } else {
        // Turning the feature off is deliberate: drop the saved calibration so
        // re-enabling later starts with a fresh Calibrate step.
        clearCalibration();
        stop();
    }
};

export default {start, stop, sync};
