<?php
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
 * Aggregate usage-stats report (D47). Read-only: shows one row per
 * accessibility option (site-wide activation counter + last update), or
 * an explanatory notice if collection is off / no data has been recorded
 * yet. Protected by local/a11y:viewstats (granted by default only to the
 * manager archetype - see db/access.php) via admin_externalpage_setup(),
 * which also handles require_login()/context/breadcrumbs, matching how
 * the rest of Moodle's own admin report pages are built.
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

require(__DIR__ . '/../../../config.php');
require_once($CFG->libdir . '/adminlib.php');

admin_externalpage_setup('local_a11y_stats');

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('statstitle', 'local_a11y'));
echo html_writer::tag('p', get_string('statsintro', 'local_a11y'));

if (!\local_a11y\config::collect_stats_enabled()) {
    echo $OUTPUT->notification(get_string('statsdisabled', 'local_a11y'), \core\output\notification::NOTIFY_INFO);
}

$rows = \local_a11y\stats::get_all();

if (empty($rows)) {
    echo $OUTPUT->notification(get_string('statsempty', 'local_a11y'), \core\output\notification::NOTIFY_INFO);
} else {
    $labels = [];
    foreach (\local_a11y\options::all() as $option) {
        $labels[$option['id']] = get_string($option['labelkey'], 'local_a11y');
    }

    $table = new html_table();
    $table->head = [
        get_string('statscol_feature', 'local_a11y'),
        get_string('statscol_counter', 'local_a11y'),
        get_string('statscol_lastupdated', 'local_a11y'),
    ];
    foreach ($rows as $row) {
        $label = $labels[$row->featureid] ?? $row->featureid;
        $table->data[] = [
            s($label),
            $row->counter,
            userdate($row->timemodified),
        ];
    }
    echo html_writer::table($table);
}

echo $OUTPUT->footer();
