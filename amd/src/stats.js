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
 * Fire-and-forget aggregate usage-stat recording (D47): calls the
 * local_a11y_record_activation external function whenever an option
 * transitions from inactive to active (amd/src/main.js decides when -
 * this module only knows how to make the call). Never blocks the UI and
 * never throws: a failed/rejected call (network hiccup, usage-stat
 * collection disabled server-side, or a genuinely anonymous visitor who
 * never triggered even a guest login - external functions still run
 * through the standard AJAX pipeline, which requires *some* Moodle
 * session; see DECISIONS.md D47) is silently swallowed. This is an
 * optional, approximate, off-by-default counter - nothing else in the
 * plugin ever depends on it succeeding.
 *
 * @module     local_a11y/stats
 * @description Fire-and-forget aggregate usage-stat recording via the record_activation external function.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

import Ajax from 'core/ajax';

/**
 * Record one activation of the given option id. The server is the sole
 * authority on whether this actually gets persisted (config::
 * collect_stats_enabled(), re-checked in classes/stats.php regardless of
 * anything the client believes) - this call fires unconditionally
 * whenever amd/src/main.js decides an activation happened; callers that
 * want to skip the network request entirely when collection is known to
 * be off client-side should check that themselves first (see main.js's
 * own `statsEnabled` flag) - purely a network-efficiency choice, never a
 * security boundary.
 *
 * @param {String} featureId The option id being activated (e.g. "readableFont").
 * @return {void}
 */
export const recordActivation = (featureId) => {
    Ajax.call([{
        methodname: 'local_a11y_record_activation',
        args: {featureid: featureId},
    }])[0].catch(() => {
        // Best-effort only - never surface this to the user.
    });
};

export default {recordActivation};
