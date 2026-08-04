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
 * "Pausar Animações" only stops CSS animations/transitions on its own
 * (styles.css .a11y-pause-animations rules) - animated GIFs and <video
 * autoplay> aren't CSS animations, so neither one was actually affected by
 * the setting. This module covers both:
 *
 * - <video>: paused directly via the media element API, and re-paused
 *   (event listener, capture phase - 'play' does not bubble) if anything
 *   tries to start one while still active, e.g. autoplay retrying or a
 *   user hitting play. Only videos *we* paused are resumed again on stop().
 * - Animated GIF <img>: there is no play/pause API for image formats.
 *   The standard workaround is drawing the image (which captures whatever
 *   frame the browser is currently displaying) onto a canvas and swapping
 *   the <img> to that frame as a static data URL - same element, same
 *   layout, no overlay positioning needed. Reverted to the original src
 *   (restarting the animation from frame 0) on stop().
 *
 * @module     local_a11y/pause_media
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

let active = false;
let playHandler = null;
const frozenGifSrc = new WeakMap();

/**
 * @param {HTMLImageElement} img
 * @return {Boolean}
 */
const isGif = (img) => /\.gif(\?|#|$)/i.test(img.currentSrc || img.src || '');

/**
 * @param {HTMLImageElement} img
 */
const freezeGif = (img) => {
    if (frozenGifSrc.has(img) || !img.naturalWidth) {
        return;
    }
    try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const frameUrl = canvas.toDataURL('image/png');
        frozenGifSrc.set(img, img.src);
        img.src = frameUrl;
    } catch (e) {
        // Cross-origin GIF served without CORS headers taints the canvas
        // (toDataURL throws) - leave that one animating rather than break
        // the rest of the page.
    }
};

/**
 * @param {HTMLImageElement} img
 */
const unfreezeGif = (img) => {
    const original = frozenGifSrc.get(img);
    if (original) {
        img.src = original;
        frozenGifSrc.delete(img);
    }
};

const freezeAllGifs = () => {
    document.querySelectorAll('#page img').forEach((img) => {
        if (!isGif(img)) {
            return;
        }
        if (img.complete) {
            freezeGif(img);
        } else {
            img.addEventListener('load', () => freezeGif(img), {once: true});
        }
    });
};

/**
 * @param {HTMLVideoElement} video
 */
const pauseVideo = (video) => {
    if (!video.paused) {
        video.dataset.a11yPausedByPlugin = '1';
        video.pause();
    }
};

const pauseAllVideos = () => document.querySelectorAll('#page video').forEach(pauseVideo);

const resumeAllVideos = () => {
    document.querySelectorAll('#page video[data-a11y-paused-by-plugin]').forEach((video) => {
        delete video.dataset.a11yPausedByPlugin;
        video.play().catch(() => {
            // Autoplay policies (or the video no longer being in the DOM)
            // can reject this - nothing to recover from, it just stays paused.
        });
    });
};

/**
 * Start pausing GIFs/videos, and keep pausing any that (re)start while active.
 */
export const start = () => {
    if (active) {
        return;
    }
    active = true;
    pauseAllVideos();
    freezeAllGifs();
    playHandler = (e) => {
        if (e.target.tagName === 'VIDEO' && e.target.closest('#page')) {
            pauseVideo(e.target);
        }
    };
    document.addEventListener('play', playHandler, true);
};

/**
 * Stop: resume whatever videos this module paused, unfreeze GIFs.
 */
export const stop = () => {
    if (!active) {
        return;
    }
    active = false;
    document.removeEventListener('play', playHandler, true);
    playHandler = null;
    resumeAllVideos();
    document.querySelectorAll('#page img').forEach(unfreezeGif);
};

/**
 * @param {Boolean} isActive
 */
export const sync = (isActive) => (isActive ? start() : stop());

export default {start, stop, sync};
