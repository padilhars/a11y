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
 * "Ocultar Imagem" used to just set `visibility: hidden` plus a striped
 * background-image on the <img>/<video> itself, reserving its layout space
 * (no jump) - but visibility:hidden hides the *whole* box a property
 * applies to, including that same element's own background, so the
 * striped placeholder never actually painted: the reserved space just
 * looked like a blank gap, with no indication an image used to be there.
 *
 * <img>/<video> are void/replaced elements and can't have their own
 * children, so the fix wraps each one in a small inline/block <span> (the
 * wrapper takes over sizing via normal shrink-wrap, so the reserved-space
 * behaviour is unaffected) and positions a real sibling badge - striped
 * background, icon, and a properly localised (get_string(), not baked
 * into a static CSS/SVG asset) "Imagem oculta" label - on top of it via
 * styles.css's .local-a11y-hidden-image-badge (inset:0 within the
 * wrapper).
 *
 * @module     local_a11y/hide_images
 * @description Wraps hidden images/videos with a localised placeholder badge.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

import {getString} from 'core/str';

const ICON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/>'
    + '<line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/>'
    + '<path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/>'
    + '<path d="M21 15V5a2 2 0 0 0-2-2H9"/></svg>';

let label = null;

/**
 * @param {HTMLElement} el
 */
const wrapMedia = async(el) => {
    if (el.closest('.local-a11y-root') || el.parentElement?.classList.contains('local-a11y-hidden-image-wrap')) {
        return;
    }
    if (!label) {
        label = await getString('hideimages_placeholder', 'local_a11y');
    }
    const wrapper = document.createElement('span');
    wrapper.className = 'local-a11y-root local-a11y-hidden-image-wrap';
    // Block-level images (the common case for course content, e.g.
    // Bootstrap's .img-fluid) need a block wrapper to keep filling their
    // parent's width the same way the image itself did; anything else
    // (inline icons, fixed-size thumbnails) shrink-wraps as inline-block.
    const display = getComputedStyle(el).display;
    wrapper.style.display = (display === 'block' || display === 'flex' || display === 'grid') ? 'block' : 'inline-block';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);

    const badge = document.createElement('span');
    badge.className = 'local-a11y-hidden-image-badge';
    badge.innerHTML = ICON_SVG + '<span class="local-a11y-hidden-image-badge__text"></span>';
    badge.querySelector('.local-a11y-hidden-image-badge__text').textContent = label;
    wrapper.appendChild(badge);
};

/**
 * @param {HTMLElement} el
 */
const unwrapMedia = (el) => {
    const wrapper = el.parentElement;
    if (!wrapper || !wrapper.classList.contains('local-a11y-hidden-image-wrap')) {
        return;
    }
    wrapper.parentNode.insertBefore(el, wrapper);
    wrapper.remove();
};

/**
 * Wrap every currently-present image/video in #page with a hidden-image badge.
 */
export const start = async() => {
    const items = document.querySelectorAll('#page img, #page video');
    await Promise.all(Array.from(items).map(wrapMedia));
};

/**
 * Undo start(): unwrap every image/video this module wrapped.
 */
export const stop = () => {
    document.querySelectorAll('#page img, #page video').forEach(unwrapMedia);
};

/**
 * @param {Boolean} active
 */
export const sync = (active) => (active ? start() : stop());

export default {start, stop, sync};
