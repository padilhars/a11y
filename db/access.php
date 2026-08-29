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
 * Capability definitions for local_a11y.
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

$capabilities = [
    // Can see and use the accessibility FAB/panel. Allowed by default for
    // everyone, including guests, so the plugin is useful before login.
    'local/a11y:view' => [
        'captype' => 'read',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => [
            'guest' => CAP_ALLOW,
            'user' => CAP_ALLOW,
            'frontpage' => CAP_ALLOW,
            'student' => CAP_ALLOW,
            'teacher' => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager' => CAP_ALLOW,
        ],
    ],

    // DECISÃO: local/a11y:configure removido (dead-code/security audit) -
    // era declarada aqui mas nunca checada via has_capability() em nenhum
    // lugar do plugin; settings.php já é protegido pelo mecanismo padrão do
    // Moodle (admin tree / moodle/site:config), então a capability não
    // controlava nada e só confundiria um admin que a atribuísse esperando
    // algum efeito. Ver version.php - o bump de versão aqui é necessário
    // para o admin/cli/upgrade.php de fato remover a capability órfã do
    // banco (update_capabilities() só roda no upgrade quando a versão muda).

    // Can view the aggregate usage-stats report (admin/stats.php, D47).
    // Deliberately narrower than moodle/site:config: a pedido explícito,
    // concedida por padrão só ao arquétipo 'manager' - nem editingteacher
    // nem admin aparecem aqui de propósito (site admins sempre passam em
    // has_capability() de qualquer forma, via is_siteadmin(), então não
    // precisam de entrada própria).
    'local/a11y:viewstats' => [
        'captype' => 'read',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => [
            'manager' => CAP_ALLOW,
        ],
    ],
];
