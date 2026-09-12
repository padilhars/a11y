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
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
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
    $categories = [];
    foreach (\local_a11y\options::all() as $option) {
        $labels[$option['id']] = get_string($option['labelkey'], 'local_a11y');
        $categories[$option['id']] = $option['cat'];
    }

    // Charts, built from the same aggregate/anonymous rows as the table
    // below - no new data, no new privacy surface, purely a different view
    // of the same site-wide counters. core\chart_bar/chart_pie are used
    // (Moodle's own Chart.js-backed charting API) instead of a
    // third-party JS library, avoiding the CDN/licensing questions raised
    // by earlier audits of this plugin. render_chart()'s default
    // $withtable=true also gives every chart an accessible data-table
    // fallback for free, matching this plugin's own accessibility focus.
    $barlabels = [];
    $barvalues = [];
    $bycategory = [];
    foreach ($rows as $row) {
        $barlabels[] = $labels[$row->featureid] ?? $row->featureid;
        $barvalues[] = (int) $row->counter;

        $cat = $categories[$row->featureid] ?? null;
        if ($cat !== null) {
            $bycategory[$cat] = ($bycategory[$cat] ?? 0) + (int) $row->counter;
        }
    }

    $barchart = new core\chart_bar();
    $barchart->set_labels($barlabels);
    $barchart->add_series(new core\chart_series(get_string('statscol_counter', 'local_a11y'), $barvalues));
    echo $OUTPUT->heading(get_string('statschart_byoption', 'local_a11y'), 3);
    echo $OUTPUT->render($barchart);

    if (count($bycategory) > 1) {
        // A pie chart with a single slice is not a useful view - only
        // shown once activations span more than one category.
        arsort($bycategory);
        $catlabels = array_map(
            fn($cat) => get_string('cat_' . $cat, 'local_a11y'),
            array_keys($bycategory)
        );
        $piechart = new core\chart_pie();
        $piechart->set_labels($catlabels);
        $piechart->add_series(new core\chart_series(get_string('statscol_counter', 'local_a11y'), array_values($bycategory)));
        echo $OUTPUT->heading(get_string('statschart_bycategory', 'local_a11y'), 3);
        echo $OUTPUT->render($piechart);
    }

    // Trend over time, from the daily-bucketed local_a11y_stats_daily table
    // (added alongside this chart - see classes/stats.php). Still fully
    // aggregate/anonymous: a (featureid, day) counter, nothing that could
    // identify who triggered any individual activation. Existing sites
    // upgrading to this version have no daily history before today (the
    // old table only ever kept a single running total, which can't be
    // split back into days) - shown as an explicit "not enough data yet"
    // notice rather than an empty/broken-looking chart.
    $trenddays = 30;
    $dailyrows = \local_a11y\stats::get_daily_since($trenddays);

    echo $OUTPUT->heading(get_string('statschart_trend', 'local_a11y'), 3);

    if (empty($dailyrows)) {
        echo $OUTPUT->notification(get_string('statstrendempty', 'local_a11y'), \core\output\notification::NOTIFY_INFO);
    } else {
        $bydaycat = [];
        foreach ($dailyrows as $row) {
            $cat = $categories[$row->featureid] ?? null;
            if ($cat === null) {
                continue;
            }
            $bydaycat[$row->day][$cat] = ($bydaycat[$row->day][$cat] ?? 0) + (int) $row->counter;
        }

        // Every day in the window, oldest to newest, zero-filled - so a
        // quiet day shows as a real dip in the line, not a gap.
        $dayseq = [];
        for ($i = $trenddays - 1; $i >= 0; $i--) {
            $dayseq[] = (int) gmdate('Ymd', time() - $i * DAYSECS);
        }
        $trendlabels = array_map(function ($day) {
            $day = (string) $day;
            $ts = gmmktime(0, 0, 0, (int) substr($day, 4, 2), (int) substr($day, 6, 2), (int) substr($day, 0, 4));
            return userdate($ts, '%d/%m');
        }, $dayseq);

        $seencats = [];
        foreach ($bydaycat as $cats) {
            foreach (array_keys($cats) as $cat) {
                $seencats[$cat] = true;
            }
        }

        $trendchart = new core\chart_line();
        $trendchart->set_labels($trendlabels);
        foreach (array_keys($seencats) as $cat) {
            $series = [];
            foreach ($dayseq as $day) {
                $series[] = $bydaycat[$day][$cat] ?? 0;
            }
            $trendchart->add_series(new core\chart_series(get_string('cat_' . $cat, 'local_a11y'), $series));
        }
        echo html_writer::tag(
            'p',
            get_string('statschart_trend_desc', 'local_a11y', $trenddays),
            ['class' => 'text-muted small']
        );
        echo $OUTPUT->render($trendchart);
    }

    // Breakdown by account type (Moodle's Guest account vs. real
    // authenticated accounts), from local_a11y_stats_bytype (added
    // alongside this chart - see classes/stats.php). `guest` is a 0/1
    // role flag decided once per request, never a user id - this still
    // cannot identify who triggered any individual activation, only how
    // many came from each of the two groups in total. Existing sites have
    // no by-type history before this feature was added (see
    // stats::get_bytype()'s own docblock), shown as an explicit notice
    // rather than an empty-looking chart.
    $bytyperows = \local_a11y\stats::get_bytype();

    echo $OUTPUT->heading(get_string('statschart_bytype', 'local_a11y'), 3);

    if (empty($bytyperows)) {
        echo $OUTPUT->notification(get_string('statsbytypeempty', 'local_a11y'), \core\output\notification::NOTIFY_INFO);
    } else {
        $bytype = [];
        foreach ($bytyperows as $row) {
            $bytype[$row->featureid][(int) $row->guest] = (int) $row->counter;
        }
        // Sorted by total activations (both types combined), most first -
        // same convention as the "by option" bar chart above.
        uasort($bytype, fn($a, $b) => array_sum($b) <=> array_sum($a));

        $typelabels = [];
        $authseries = [];
        $guestseries = [];
        foreach ($bytype as $featureid => $counts) {
            $typelabels[] = $labels[$featureid] ?? $featureid;
            $authseries[] = $counts[0] ?? 0;
            $guestseries[] = $counts[1] ?? 0;
        }

        $typechart = new core\chart_bar();
        $typechart->set_stacked(true);
        $typechart->set_labels($typelabels);
        $typechart->add_series(new core\chart_series(get_string('statstype_authenticated', 'local_a11y'), $authseries));
        $typechart->add_series(new core\chart_series(get_string('statstype_guest', 'local_a11y'), $guestseries));
        echo html_writer::tag('p', get_string('statschart_bytype_desc', 'local_a11y'), ['class' => 'text-muted small']);
        echo $OUTPUT->render($typechart);
    }

    echo $OUTPUT->heading(get_string('statstable', 'local_a11y'), 3);

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
