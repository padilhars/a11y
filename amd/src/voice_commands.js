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
let callbacks = {};

/**
 * @return {Function|null} The vendor-prefixed SpeechRecognition constructor, if any.
 */
const getSpeechRecognitionCtor = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;

/**
 * @param {String} listeningLabel
 * @return {HTMLElement}
 */
const buildPill = (listeningLabel) => {
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
    el.querySelector('[data-region="text"]').textContent = listeningLabel;
    document.body.appendChild(el);
    return el;
};

/**
 * Match a recognized phrase against the supported command set (pt-BR and
 * en, matched loosely via substring so partial phrases still work) and
 * invoke the matching callback.
 *
 * @param {String} phrase
 */
const dispatch = (phrase) => {
    const p = phrase.toLowerCase();

    const commands = [
        {patterns: ['abrir painel', 'open panel'], action: 'openPanel'},
        {patterns: ['fechar painel', 'close panel'], action: 'closePanel'},
        {patterns: ['aumentar texto', 'increase text', 'texto maior'], action: 'increaseTextSize'},
        {patterns: ['diminuir texto', 'decrease text', 'texto menor'], action: 'decreaseTextSize'},
        {patterns: ['alto contraste', 'high contrast'], action: 'highContrast'},
        {patterns: ['modo escuro', 'dark mode', 'modo noturno', 'night mode'], action: 'darkMode'},
        {patterns: ['restaurar', 'reset', 'limpar tudo'], action: 'reset'},
        {patterns: ['leitor de tela', 'screen reader'], action: 'toggleScreenReader'},
        {patterns: ['teclado virtual', 'virtual keyboard'], action: 'toggleVirtualKeyboard'},
    ];

    for (const command of commands) {
        if (command.patterns.some((pattern) => p.includes(pattern))) {
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

    pill = buildPill(await getString('vc_listening', 'local_a11y'));

    recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = document.documentElement.lang || 'en';

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
    if (recognition) {
        recognition.onend = null;
        recognition.stop();
        recognition = null;
    }
    if (pill) {
        pill.remove();
        pill = null;
    }
};

/**
 * @param {Boolean} active
 * @param {Object} cb
 */
export const sync = (active, cb) => (active ? start(cb) : stop());

export default {start, stop, sync};
