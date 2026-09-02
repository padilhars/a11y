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
 * Voice commands via the Web Speech API's SpeechRecognition, with graceful
 * fallback when unsupported (Firefox, most non-Chromium browsers). Not
 * present in _design-reference/a11y-features.jsx - the prototype declares
 * `voiceCommands` as a toggle option but implements no behaviour for it
 * (see DECISIONS.md) - so the exact command set here is this plugin's own
 * addition, built to match the hint string already shown in the panel
 * (lang string vc_hint: "aumentar texto", "alto contraste", "fechar painel").
 *
 * @module     local_a11y/voice_commands
 * @description Voice commands via the Web Speech API's SpeechRecognition.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

import {getString} from 'core/str';

let recognition = null;
let pill = null;
let listeningLabel = '';
let callbacks = {};

/**
 * @return {Function|null} The vendor-prefixed SpeechRecognition constructor, if any.
 */
const getSpeechRecognitionCtor = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;

// Security/privacy audit finding: in Chrome/Chromium, the SpeechRecognition
// implementation used above sends captured microphone audio to Google's own
// remote speech-recognition service to transcribe it (confirmed against
// MDN's documentation of the SpeechRecognition API) - this plugin has no
// control over that and previously never disclosed it anywhere, contrary to
// README.md's "no third-party API is loaded" claim (the two documented
// exceptions there were the MediaPipe CDN and the UN icon, neither of which
// covers this). See classes/privacy/provider.php for the Privacy API
// disclosure and README.md for the user-facing one. This constant/functions
// pair adds a one-time runtime notice, shown before the feature is ever
// actually activated for the first time on a given browser.
const PRIVACY_ACK_KEY = 'local_a11y_vc_privacy_ack';

/**
 * Whether the user has already acknowledged the privacy notice below, on
 * this browser.
 *
 * @return {Boolean}
 */
const hasAcknowledgedPrivacyNotice = () => {
    try {
        return window.localStorage && window.localStorage.getItem(PRIVACY_ACK_KEY) === '1';
    } catch (e) {
        return false;
    }
};

/**
 * Remember that the user acknowledged the privacy notice, so it is not
 * shown again on this browser.
 *
 * @return {void}
 */
const rememberPrivacyAck = () => {
    try {
        if (window.localStorage) {
            window.localStorage.setItem(PRIVACY_ACK_KEY, '1');
        }
    } catch (e) {
        // Storage unavailable (private browsing, etc.) - worst case, the
        // notice is shown again next time. Never blocks activation.
    }
};

/**
 * Build and append the status pill DOM element showing the given label.
 *
 * @param {String} label The text to show in the pill (e.g. "Ouvindo…").
 * @return {HTMLElement} The created pill container, already appended to <body>.
 */
const buildPill = (label) => {
    const el = document.createElement('div');
    el.className = 'local-a11y-root local-a11y-sr-pill';
    el.setAttribute('role', 'status');
    // Static, trusted markup only via innerHTML; the (currently always
    // static, but caller-supplied) label is set via textContent below so
    // this stays safe even if a future caller passes dynamic text.
    el.innerHTML = '<span class="local-a11y-sr-pill__icon">'
        + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" '
        + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>'
        + '<line x1="12" x2="12" y1="19" y2="22"/></svg></span>'
        + '<span class="local-a11y-sr-pill__hint" data-region="text"></span>';
    el.querySelector('[data-region="text"]').textContent = label;
    document.body.appendChild(el);
    return el;
};

// Briefly shows the recognized phrase in the pill, then restores the
// "Ouvindo…" label so the user knows the command was heard.
let feedbackTimer = null;
/**
 * Briefly show the recognized phrase in the pill, then restore the
 * "listening" label after a short delay.
 *
 * @param {String} phrase The recognized speech phrase to display.
 * @return {void}
 */
const showFeedback = (phrase) => {
    if (!pill) {
        return;
    }
    const el = pill.querySelector('[data-region="text"]');
    if (!el) {
        return;
    }
    if (feedbackTimer) {
        clearTimeout(feedbackTimer);
    }
    el.textContent = '“' + phrase + '”';
    feedbackTimer = setTimeout(() => {
        if (pill) {
            el.textContent = listeningLabel;
        }
        feedbackTimer = null;
    }, 2500);
};

/**
 * Match a recognized phrase against the full command set (pt-BR and en,
 * matched loosely via substring so partial phrases still work) and invoke
 * the matching callback. Shows brief feedback in the pill on any match.
 *
 * @param {String} phrase The recognized speech phrase.
 * @return {void}
 */
const dispatch = (phrase) => {
    const p = phrase.toLowerCase();

    const commands = [
        // --- Panel ---
        {patterns: ['abrir painel', 'open panel', 'painel acessibilidade'], action: 'openPanel'},
        {patterns: ['fechar painel', 'close panel'], action: 'closePanel'},

        // --- Text size ---
        {patterns: ['aumentar texto', 'increase text', 'texto maior', 'fonte maior'], action: 'increaseTextSize'},
        {patterns: ['diminuir texto', 'decrease text', 'texto menor', 'fonte menor'], action: 'decreaseTextSize'},

        // --- Line height ---
        {patterns: ['aumentar altura de linha', 'mais altura de linha', 'increase line height'], action: 'increaseLineHeight'},
        {patterns: ['diminuir altura de linha', 'menos altura de linha', 'decrease line height'], action: 'decreaseLineHeight'},

        // --- Text spacing ---
        {patterns: ['mais espaçamento entre letras', 'increase text spacing'], action: 'increaseTextSpacing'},
        {patterns: ['menos espaçamento entre letras', 'decrease text spacing'], action: 'decreaseTextSpacing'},

        // --- Text alignment ---
        {patterns: ['alinhar à esquerda', 'texto à esquerda', 'align left'], action: 'alignLeft'},
        {patterns: ['centralizar texto', 'texto centralizado', 'center text'], action: 'alignCenter'},
        {patterns: ['alinhar à direita', 'texto à direita', 'align right'], action: 'alignRight'},
        {patterns: ['justificar texto', 'texto justificado', 'justify text'], action: 'alignJustify'},
        {patterns: ['alinhamento padrão', 'alinhamento normal', 'default alignment'], action: 'alignDefault'},

        // --- Contrast ---
        {patterns: ['alto contraste', 'high contrast'], action: 'highContrast'},
        {patterns: ['modo escuro', 'dark mode', 'modo noturno', 'night mode'], action: 'darkMode'},
        {patterns: ['contraste claro', 'light contrast'], action: 'lightContrast'},
        {patterns: ['sem contraste', 'contraste padrão', 'no contrast'], action: 'noContrast'},

        // --- Colors ---
        {patterns: ['inverter cores', 'invert colors'], action: 'toggleInvertColors'},
        {patterns: ['filtro protanopia', 'protanopia'], action: 'colorProtanopia'},
        {patterns: ['filtro deuteranopia', 'deuteranopia'], action: 'colorDeuteranopia'},
        {patterns: ['filtro tritanopia', 'tritanopia'], action: 'colorTritanopia'},
        {patterns: ['sem filtro de cor', 'cor padrão', 'no color filter'], action: 'colorDefault'},

        // --- Saturation ---
        {patterns: ['saturação alta', 'mais saturação', 'high saturation'], action: 'saturationHigh'},
        {patterns: ['saturação baixa', 'menos saturação', 'low saturation'], action: 'saturationLow'},
        {patterns: ['escala de cinza', 'preto e branco', 'grayscale', 'monocromático'], action: 'saturationMono'},
        {patterns: ['saturação normal', 'sem saturação', 'normal saturation'], action: 'saturationNormal'},

        // --- Cursor ---
        {patterns: ['cursor preto grande', 'cursor grande preto', 'big black cursor'], action: 'cursorBigBlack'},
        {patterns: ['cursor branco grande', 'cursor grande branco', 'big white cursor'], action: 'cursorBigWhite'},
        {patterns: ['cursor padrão', 'cursor normal', 'default cursor'], action: 'cursorDefault'},

        // --- Font ---
        {patterns: ['fonte legível', 'readable font', 'fonte de leitura'], action: 'toggleReadableFont'},
        {patterns: ['fonte para dislexia', 'fonte disléxica', 'dyslexic font'], action: 'toggleDyslexicFont'},

        // --- Highlights ---
        {patterns: ['destacar títulos', 'highlight titles', 'realçar títulos'], action: 'toggleHighlightTitles'},
        {patterns: ['destacar links', 'highlight links', 'realçar links'], action: 'toggleHighlightLinks'},
        {patterns: ['destacar botões', 'highlight buttons', 'realçar botões'], action: 'toggleHighlightButtons'},

        // --- Media & motion ---
        {patterns: ['ocultar imagens', 'hide images', 'esconder imagens'], action: 'toggleHideImages'},
        {patterns: ['pausar animações', 'pause animations', 'parar animações'], action: 'togglePauseAnimations'},
        {patterns: ['dicas de ferramentas', 'ativar dicas', 'show tooltips'], action: 'toggleTooltips'},

        // --- Focus & navigation tools ---
        {patterns: ['guia de leitura', 'reading guide'], action: 'toggleReadingGuide'},
        {patterns: ['máscara de leitura', 'reading mask'], action: 'toggleReadingMask'},
        {patterns: ['modo foco', 'focus mode', 'modo de foco'], action: 'toggleFocusMode'},
        {patterns: ['leitor de tela', 'screen reader'], action: 'toggleScreenReader'},
        {patterns: ['teclado virtual', 'virtual keyboard'], action: 'toggleVirtualKeyboard'},

        // --- Reset ---
        {patterns: ['restaurar', 'reset', 'limpar tudo'], action: 'reset'},

        // --- Moodle navigation ---
        {patterns: ['ir para o painel', 'meu painel', 'dashboard', 'página inicial do moodle'], action: 'goToDashboard'},
        {patterns: ['meus cursos', 'my courses', 'ver cursos'], action: 'goToCourses'},
        {patterns: ['ir para o calendário', 'ver calendário', 'open calendar'], action: 'goToCalendar'},
        {patterns: ['ver mensagens', 'minhas mensagens', 'open messages'], action: 'goToMessages'},
        {patterns: ['meu perfil', 'my profile', 'ver perfil', 'abrir perfil'], action: 'goToProfile'},
        {patterns: ['voltar', 'go back'], action: 'goBack'},
        {patterns: ['avançar', 'go forward'], action: 'goForward'},

        // --- Page scroll ---
        {patterns: ['rolar para baixo', 'scroll down', 'descer página'], action: 'scrollDown'},
        {patterns: ['rolar para cima', 'scroll up', 'subir página'], action: 'scrollUp'},
        {patterns: ['ir para o topo', 'topo da página', 'scroll to top'], action: 'scrollTop'},
        {patterns: ['ir para o final', 'final da página', 'scroll to bottom'], action: 'scrollBottom'},
    ];

    for (const command of commands) {
        if (command.patterns.some((pattern) => p.includes(pattern))) {
            showFeedback(phrase);
            if (callbacks[command.action]) {
                callbacks[command.action]();
            }
            return;
        }
    }
};

/**
 * Start listening. Idempotent; silently does nothing if the browser has no
 * SpeechRecognition support (graceful fallback, per the brief). The first
 * time this actually runs on a given browser, shows a blocking privacy
 * notice (vc_privacynotice) first - see PRIVACY_ACK_KEY above; if declined,
 * calls `cb.declineActivation()` (so the caller can turn the option's
 * toggle back off) and returns without starting anything.
 *
 * @param {Object} cb Action callbacks: speech-command keys, see `dispatch()`
 *        for those, plus `declineActivation` (called if the privacy notice
 *        above is declined).
 * @return {Promise<void>}
 */
export const start = async(cb) => {
    if (recognition) {
        return;
    }
    callbacks = cb || {};

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
        pill = buildPill(await getString('vc_notsupported', 'local_a11y'));
        return;
    }

    if (!hasAcknowledgedPrivacyNotice()) {
        const notice = await getString('vc_privacynotice', 'local_a11y');
        // window.confirm(): a native, zero-dependency, always-available
        // blocking dialog - the right tool for a one-time consent gate that
        // must never silently proceed if declined. Not shown again once
        // acknowledged (rememberPrivacyAck()). Deliberate use, despite the
        // eslint no-alert warning it triggers (quality audit): the
        // alternative, Moodle's core/modal_factory, is async/non-blocking
        // by design, which would let start() race ahead before the user
        // answers - a native confirm() is the only synchronous option
        // without adding a new dependency for a one-time gate.
        // eslint-disable-next-line no-alert
        if (!window.confirm(notice)) {
            if (callbacks.declineActivation) {
                callbacks.declineActivation();
            }
            return;
        }
        rememberPrivacyAck();
    }

    listeningLabel = await getString('vc_listening', 'local_a11y');
    pill = buildPill(listeningLabel);

    recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    // Moodle Brazilian Portuguese packs may emit the generic 'pt' tag; map it
    // to 'pt-BR' so the Speech API transcribes with the correct dialect.
    const pageLang = document.documentElement.lang || 'en';
    recognition.lang = pageLang.toLowerCase() === 'pt' ? 'pt-BR' : pageLang;

    recognition.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        if (last && last.isFinal) {
            dispatch(last[0].transcript);
        }
    };
    // Some browsers stop recognition after a period of silence; restart
    // automatically while the feature is still toggled on.
    recognition.onend = () => {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                // Already starting/started - ignore.
            }
        }
    };
    recognition.onerror = () => {
        // Non-fatal (e.g. no-speech timeout) - onend will restart it.
    };

    try {
        recognition.start();
    } catch (e) {
        // Already running - ignore.
    }
};

/**
 * Stop listening and remove the overlay. Idempotent.
 *
 * @return {void}
 */
export const stop = () => {
    if (feedbackTimer) {
        clearTimeout(feedbackTimer);
        feedbackTimer = null;
    }
    if (recognition) {
        recognition.onend = null;
        recognition.stop();
        recognition = null;
    }
    if (pill) {
        pill.remove();
        pill = null;
    }
    listeningLabel = '';
};

/**
 * Toggle voice command recognition on/off.
 *
 * @param {Boolean} active Whether voice recognition should be listening.
 * @param {Object} cb Action callbacks, forwarded to start() when activating.
 * @return {Promise<void>|void}
 */
export const sync = (active, cb) => (active ? start(cb) : stop());

export default {start, stop, sync};
