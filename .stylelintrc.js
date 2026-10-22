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
 * Stylelint override for local_a11y: extends the Moodle core root
 * .stylelintrc (so all ~60 of its rules still apply) and turns off only
 * "declaration-no-important", the one rule styles.css can never satisfy
 * (150 deliberate !important declarations, needed to beat the host
 * theme/Bootstrap's specificity).
 *
 * This is a .js config, not .json, because the moodle root's depth relative
 * to this plugin is NOT constant across supported Moodle branches - e.g.
 * MOODLE_500_STABLE installs plugins at "<root>/local/a11y" (2 levels up to
 * root), while 502/503_STABLE use "<root>/public/local/a11y" (3 levels up).
 * A fixed "extends": "../../../.stylelintrc" (first attempt, D105) broke
 * exactly the branch with a different depth. Walking up from this file's own
 * directory until an actual ".stylelintrc" is found works at any depth.
 *
 * @package    local_a11y
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

const fs = require('fs');
const path = require('path');

const findMoodleRootStylelintrc = (dir) => {
    const candidate = path.join(dir, '.stylelintrc');
    if (fs.existsSync(candidate)) {
        return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
        throw new Error('local_a11y/.stylelintrc.js: could not locate the Moodle root .stylelintrc');
    }
    return findMoodleRootStylelintrc(parent);
};

module.exports = {
    extends: findMoodleRootStylelintrc(__dirname),
    rules: {
        'declaration-no-important': null,
    },
};
