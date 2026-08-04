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
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
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

/**
 * @param {String} label
 * @return {HTMLElement}
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
 * @param {String} phrase
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
 * SpeechRecognition support (graceful fallback, per the brief).
 *
 * @param {Object} cb Action callbacks, see `dispatch()` for the supported keys.
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
 * @param {Boolean} active
 * @param {Object} cb
 */
export const sync = (active, cb) => (active ? start(cb) : stop());

export default {start, stop, sync};
