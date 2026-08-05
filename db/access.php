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
 * @description Capability definitions for local_a11y.
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
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
];
