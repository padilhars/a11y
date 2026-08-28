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
 * Bionic Reading: bolds the first portion of each word (proportional to its
 * length), like amd/src/tooltips.js manipulates the DOM directly rather
 * than toggling a body class - a body-class CSS effect can restyle
 * *existing* markup, but it cannot split a text node's own characters into
 * "bold part"/"rest" on its own; only real DOM changes can.
 *
 * The one hard constraint this design exists to satisfy (see DECISIONS.md
 * D53 for the investigation): wrapping part of a word's own text in an
 * element risks a screen reader announcing it as two separate words - text
 * concatenation across sibling inline nodes is not guaranteed by spec, and
 * real Bionic Reading browser extensions have documented reports of NVDA/
 * JAWS pausing audibly at the split point. The mitigation used here never
 * exposes the split markup to assistive tech at all: every processed text
 * node becomes two siblings - a `[aria-hidden="true"]` *decorative* copy
 * (bold/plain, the visual effect) and a visually-hidden-but-audible copy of
 * the *exact original, unmodified text* (see `.local-a11y-br-original` in
 * styles.css - `clip`-based, not `display:none`, so it stays in the
 * accessibility tree). A screen reader never sees a split word; it reads
 * precisely what it would have read before this option existed.
 *
 * @module     local_a11y/bionic_reading
 * @description Bolds the first portion of each word, proportional to its length.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

/**
 * Fraction of each word's characters to bold (rounded, minimum 1) - the
 * classic "Bionic Reading" heuristic. No exact ratio was specified in the
 * brief ("proporcionalmente ao tamanho dela") - 0.4 is the commonly used
 * value across existing implementations and reads as a clear-but-not-heavy
 * emphasis at both ends of the word-length range (1-letter words: the
 * whole letter; 10-letter words: the first 4).
 *
 * @type {Number}
 */
const BOLD_RATIO = 0.4;

/** @type {String} Wrapper element class - marks a text node this module has already processed. */
const WRAPPER_CLASS = 'local-a11y-br';
/** @type {String} Class on the visually-hidden-but-audible copy of a processed node's original text. */
const ORIGINAL_CLASS = 'local-a11y-br-original';

/**
 * Elements this module must never alter the contents of, even indirectly -
 * checked via `closest()` against every candidate text node's parent.
 * `input`/`textarea` never actually hold the kind of text-node children
 * this module walks (their content is the `value` property, not child text
 * nodes) but are listed anyway, verbatim from the brief, as defence in
 * depth against a future browser/Moodle change in that regard. `.que` is
 * the *whole* mod_quiz question block (stimulus text and response controls
 * together, both an in-progress attempt and a finished review) - see
 * DECISIONS.md D52 for why the wider block, not just the response area, is
 * excluded: getting this wrong in an assessment context is a serious bug,
 * not a cosmetic one. `.editor_atto`/`.tox-tinymce` are the Atto/TinyMCE
 * text editor; `.MathJax`/`mjx-container` is MathJax's own rendered output.
 * The plugin's own panel and the virtual keyboard need no entry here at
 * all - both mount directly on `document.body`, never inside `#page` (see
 * DECISIONS.md D51), and every walk below is rooted at `#page`.
 *
 * @type {String}
 */
const EXCLUDE_SELECTOR = 'input, textarea, code, pre, form, .que, .editor_atto, .tox-tinymce, .MathJax, mjx-container';

/**
 * Matches either a run of word characters (Unicode letters/numbers, so
 * accented Portuguese words count as one word) or a run of anything else
 * (whitespace/punctuation) - alternating, covers an entire string with no
 * gaps. The `u` flag is required for `\p{...}` to work at all.
 *
 * @type {RegExp}
 */
const SEGMENT_RE = /[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu;

/** @type {Boolean} Whether this module is currently active. */
let active = false;
/** @type {MutationObserver|null} Watches #page for dynamically-added content while active. */
let observer = null;
/** @type {Number|null} Debounce timer id for scheduleReprocess(). */
let debounceTimer = null;
/** @type {Boolean} Whether an idle-callback processing pass is currently running. */
let processing = false;
/** @type {Number|null} Handle for the currently-scheduled idle callback, if any. */
let idleHandle = null;

/**
 * requestIdleCallback with a same-signature setTimeout fallback (Safari has
 * never implemented it) - the fallback runs "soon" with a small fixed
 * timeRemaining() budget rather than yielding to real idle time, which is
 * the best a setTimeout-only environment can approximate. timeRemaining()
 * here has to compute a real, decreasing value from an actual start time -
 * an earlier version returned a hardcoded constant, which never reaches
 * zero, so processQueue()'s "stop this chunk once time runs out" loop
 * would never actually stop on this fallback path (every browser without
 * requestIdleCallback would have processed its *entire* queue in one
 * blocking chunk, the exact thing chunking exists to avoid - see
 * DECISIONS.md D53).
 *
 * @param {Function} callback Receives an IdleDeadline-shaped object ({timeRemaining, didTimeout}).
 * @return {Number} An id usable with cancelIdle().
 */
const requestIdle = (callback) => {
    if (typeof window.requestIdleCallback === 'function') {
        return window.requestIdleCallback(callback, {timeout: 300});
    }
    const budgetMs = 8;
    return window.setTimeout(() => {
        const start = performance.now();
        callback({
            timeRemaining: () => Math.max(0, budgetMs - (performance.now() - start)),
            didTimeout: true,
        });
    }, 16);
};

/**
 * Cancel a requestIdle() handle, whichever implementation produced it.
 *
 * @param {Number} handle The id returned by requestIdle().
 * @return {void}
 */
const cancelIdle = (handle) => {
    if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(handle);
    } else {
        window.clearTimeout(handle);
    }
};

/**
 * How many leading characters of `word` to bold - at least 1, never the
 * whole word for anything longer than 2 characters (bolding 100% of every
 * word would just be "bold text", not bionic reading).
 *
 * @param {String} word A single word-like segment (letters/numbers only).
 * @return {Number} Character count to bold, in [1, word.length].
 */
const boldLength = (word) => Math.max(1, Math.min(word.length, Math.round(word.length * BOLD_RATIO)));

/**
 * Build the decorative (bold-prefix) fragment for one text node's full
 * string content - alternates plain-text fragments (whitespace/punctuation,
 * and non-word segments) with `<b>` + plain-text pairs for each word-like
 * segment. Never the accessible copy - always appended under an
 * `aria-hidden="true"` wrapper by the caller.
 *
 * @param {String} text The full original text content of one text node.
 * @return {DocumentFragment}
 */
const buildDecorative = (text) => {
    const frag = document.createDocumentFragment();
    SEGMENT_RE.lastIndex = 0;
    let match;
    while ((match = SEGMENT_RE.exec(text)) !== null) {
        const segment = match[0];
        if (!/^[\p{L}\p{N}]/u.test(segment) || /^\p{N}+$/u.test(segment)) {
            // Punctuation/whitespace, or a pure number - bionic reading is
            // about words, not digits; leave both unstyled.
            frag.appendChild(document.createTextNode(segment));
            continue;
        }
        const n = boldLength(segment);
        const b = document.createElement('b');
        b.textContent = segment.slice(0, n);
        frag.appendChild(b);
        if (n < segment.length) {
            frag.appendChild(document.createTextNode(segment.slice(n)));
        }
    }
    return frag;
};

/**
 * Whether a candidate text node should be skipped entirely: empty/
 * whitespace-only, inside one of EXCLUDE_SELECTOR's elements, or already
 * inside a wrapper this module previously produced (defends against
 * double-processing if a pass is ever re-run over already-processed markup).
 *
 * @param {Text} node The candidate text node.
 * @return {Boolean}
 */
const shouldSkip = (node) => {
    if (!node.nodeValue || !node.nodeValue.trim()) {
        return true;
    }
    const parent = node.parentElement;
    if (!parent) {
        return true;
    }
    return Boolean(parent.closest(EXCLUDE_SELECTOR) || parent.closest('.' + WRAPPER_CLASS));
};

/**
 * Collect every eligible text node under `root`, in document order. A pure
 * read - no DOM mutation happens here, so this part is cheap even on a very
 * long page; the expensive part (building/inserting the replacement
 * markup) is deferred to processQueue()'s idle-time chunks.
 *
 * @param {HTMLElement} root The subtree to walk (always `#page`).
 * @return {Text[]}
 */
const collectTextNodes = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    let current = walker.nextNode();
    while (current) {
        nodes.push(current);
        current = walker.nextNode();
    }
    return nodes;
};

/**
 * Replace one text node with the two-sibling structure described in this
 * module's docblock: a decorative `aria-hidden` bold/plain copy, and a
 * visually-hidden-but-audible copy of the untouched original text.
 *
 * @param {Text} node The text node to replace.
 * @return {void}
 */
const wrapTextNode = (node) => {
    const text = node.nodeValue;
    const container = document.createElement('span');
    container.className = WRAPPER_CLASS;

    const decorative = document.createElement('span');
    decorative.setAttribute('aria-hidden', 'true');
    decorative.appendChild(buildDecorative(text));

    const original = document.createElement('span');
    original.className = ORIGINAL_CLASS;
    original.textContent = text;

    container.appendChild(decorative);
    container.appendChild(original);
    node.replaceWith(container);
};

/**
 * Process `queue` in requestIdleCallback-scheduled chunks, stopping each
 * chunk once the current idle deadline runs out (or, on the setTimeout
 * fallback, after its fixed small budget) rather than doing the whole page
 * in one blocking pass - see DECISIONS.md D53 for the measured cost this
 * exists to avoid.
 *
 * @param {Text[]} queue Text nodes still to process, consumed in place.
 * @return {void}
 */
const processQueue = (queue) => {
    processing = true;
    const step = (deadline) => {
        // `deadline.didTimeout` means "the browser never gave this an idle
        // slot within requestIdle()'s own timeout, so it's running now
        // anyway" - it does NOT mean "ignore the time budget and finish
        // everything". An earlier version used `|| deadline.didTimeout` as
        // the loop condition, which measured out to a single 506ms blocking
        // task on a long (~6000 text node) page under load (see DECISIONS.md
        // D53): once didTimeout was true, the loop's own condition stayed
        // true for the rest of that pass and drained the *entire* remaining
        // queue in one go, exactly the kind of blocking chunk this function
        // exists to prevent. Guaranteeing only forward progress (process at
        // least one node so an always-busy browser can never starve this
        // entirely) instead of an unbounded drain fixes it - confirmed via
        // the same long-page measurement afterwards: zero long tasks.
        let processedThisStep = 0;
        while (queue.length && (deadline.timeRemaining() > 0 || processedThisStep === 0)) {
            wrapTextNode(queue.pop());
            processedThisStep++;
        }
        if (queue.length && active) {
            idleHandle = requestIdle(step);
        } else {
            processing = false;
            idleHandle = null;
        }
    };
    idleHandle = requestIdle(step);
};

/**
 * Whether every added/removed node in a single MutationRecord is something
 * this module itself just produced - either a plain text node (the
 * teardown() replacement, or the node wrapTextNode() just removed) or a
 * WRAPPER_CLASS span. A mutation observer watching the same subtree it
 * writes to would otherwise re-trigger itself on every one of its own
 * edits, forming an infinite loop; real external changes (Moodle loading
 * more activities, a collapsible section expanding, ...) add/remove
 * *other* kinds of elements (`<li>`, `<div>`, `<img>`, ...), so this
 * heuristic tells the two apart without needing to disconnect/reconnect
 * the observer around every single edit (which would risk missing a real
 * mutation that happens to land in that same window).
 *
 * @param {MutationRecord} mutation One mutation record.
 * @return {Boolean}
 */
const isOwnMutation = (mutation) => {
    const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
    if (nodes.length === 0) {
        return true;
    }
    return nodes.every((n) => n.nodeType === Node.TEXT_NODE
        || (n.nodeType === Node.ELEMENT_NODE && n.classList && n.classList.contains(WRAPPER_CLASS)));
};

/**
 * Run one full processing pass over #page: collect eligible text nodes,
 * hand them to processQueue(). No-op while a previous pass is still
 * running (the observer callback below debounces, so in practice this
 * mostly matters for the very first call from start()).
 *
 * @return {void}
 */
const runPass = () => {
    if (!active || processing) {
        return;
    }
    const root = document.getElementById('page');
    if (!root) {
        return;
    }
    const queue = collectTextNodes(root);
    if (queue.length) {
        processQueue(queue);
    }
};

/**
 * MutationObserver callback: ignore self-caused mutations (see
 * isOwnMutation()), debounce everything else into a single reprocessing
 * pass so a burst of DOM changes (e.g. a whole activity list rendering in)
 * only triggers one pass, not one per node.
 *
 * @param {MutationRecord[]} mutations
 * @return {void}
 */
const onMutations = (mutations) => {
    if (!mutations.some((m) => !isOwnMutation(m))) {
        return;
    }
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(() => {
        debounceTimer = null;
        runPass();
    }, 400);
};

/**
 * Undo every change this module has made under #page: replace each wrapper
 * span with a plain text node holding its stashed original text (read
 * straight back out of the DOM's own `.local-a11y-br-original` copy - no
 * separate page-wide record of "what changed" is ever kept in memory), then
 * normalize() once at the #page root so adjacent text nodes that were only
 * ever split by a now-removed wrapper merge back into one, exactly as they
 * were before this module touched anything.
 *
 * @return {void}
 */
const teardown = () => {
    const root = document.getElementById('page');
    if (!root) {
        return;
    }
    root.querySelectorAll('.' + WRAPPER_CLASS).forEach((container) => {
        const original = container.querySelector('.' + ORIGINAL_CLASS);
        container.replaceWith(document.createTextNode(original ? original.textContent : ''));
    });
    root.normalize();
};

/**
 * Start bionic reading: process #page now, then keep watching it for new
 * content. Idempotent.
 *
 * @return {void}
 */
export const start = () => {
    if (active) {
        return;
    }
    active = true;
    runPass();
    const root = document.getElementById('page');
    if (root) {
        observer = new MutationObserver(onMutations);
        observer.observe(root, {childList: true, subtree: true});
    }
};

/**
 * Stop bionic reading: cancel any pending idle/debounce work, disconnect
 * the observer, and undo every change made so far. Idempotent.
 *
 * @return {void}
 */
export const stop = () => {
    if (!active) {
        return;
    }
    active = false;
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    if (idleHandle !== null) {
        cancelIdle(idleHandle);
        idleHandle = null;
    }
    processing = false;
    teardown();
};

/**
 * Toggle bionic reading on/off.
 *
 * @param {Boolean} isActive Whether bionic reading should be on.
 * @return {void}
 */
export const sync = (isActive) => (isActive ? start() : stop());

export default {start, stop, sync};
