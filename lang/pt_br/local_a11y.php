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
 * Portuguese (Brazil) strings for local_a11y.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'Acessibilidade (A11y)';

// Capabilities.
$string['a11y:view'] = 'Usar o painel de acessibilidade';
$string['a11y:configure'] = 'Configurar o plugin de acessibilidade';

// Privacy.
$string['privacy:metadata:preference:local_a11y_settings'] = 'As opções de acessibilidade escolhidas pelo usuário (tamanho do texto, contraste, perfil ativo, etc).';

// Panel chrome.
$string['panelname'] = 'Acessibilidade';
$string['fabopen'] = 'Abrir painel de acessibilidade';
$string['fabclose'] = 'Fechar painel de acessibilidade';
$string['paneltitle'] = 'Acessibilidade';
$string['panelsubtitle'] = 'Personalize sua experiência';
$string['profilestitle'] = 'Perfis de Acessibilidade';
$string['profilessubtitle'] = 'Ative configurações otimizadas com um clique';
$string['activecount'] = '{$a} opções ativas';
$string['activecountone'] = '1 opção ativa';
$string['noneactive'] = 'Nenhuma opção ativa';
$string['reset'] = 'Restaurar padrões';
$string['close'] = 'Fechar';
$string['search'] = 'Buscar opção…';
$string['searchclear'] = 'Limpar busca';
$string['activeprofile'] = 'Perfil ativo';
$string['on'] = 'Ativo';
$string['off'] = 'Inativo';
$string['savetitle'] = 'Desenvolvido com ❤️ pela <strong>CPTED</strong> para você.';
$string['keyboardhint'] = 'Atalho: Alt + A';

// Categories.
$string['cat_profiles'] = 'Perfis';
$string['cat_typography'] = 'Texto e Tipografia';
$string['cat_color'] = 'Cores e Contraste';
$string['cat_media'] = 'Mídia e Animação';
$string['cat_navigation'] = 'Foco e Navegação';
$string['cat_advanced'] = 'Recursos Avançados';

// Level labels (steppers).
$string['level_0'] = 'Padrão';
$string['level_1'] = 'Pequeno';
$string['level_2'] = 'Médio';
$string['level_3'] = 'Grande';
$string['level_4'] = 'Máximo';
$string['spacinglevel_0'] = 'Padrão';
$string['spacinglevel_1'] = 'Leve';
$string['spacinglevel_2'] = 'Médio';
$string['spacinglevel_3'] = 'Amplo';
$string['lineheightlevel_0'] = 'Padrão';
$string['lineheightlevel_1'] = '1.5×';
$string['lineheightlevel_2'] = '1.8×';
$string['lineheightlevel_3'] = '2.2×';
$string['cursorlevel_0'] = 'Padrão';
$string['cursorlevel_1'] = 'Grande preto';
$string['cursorlevel_2'] = 'Grande branco';
$string['contrastlevel_0'] = 'Padrão';
$string['contrastlevel_1'] = 'Escuro';
$string['contrastlevel_2'] = 'Claro';
$string['contrastlevel_3'] = 'Alto';
$string['colorchangelevel_0'] = 'Padrão';
$string['colorchangelevel_1'] = 'Protanopia';
$string['colorchangelevel_2'] = 'Deuteranopia';
$string['colorchangelevel_3'] = 'Tritanopia';
$string['saturationlevel_0'] = 'Normal';
$string['saturationlevel_1'] = 'Alta';
$string['saturationlevel_2'] = 'Baixa';
$string['saturationlevel_3'] = 'Mono';

// Options — labels.
$string['opt_readablefont'] = 'Fonte Legível';
$string['opt_readablefont_desc'] = 'Aplica Atkinson Hyperlegible';
$string['opt_dyslexicfont'] = 'Fonte para Dislexia';
$string['opt_dyslexicfont_desc'] = 'Fonte otimizada Lexend';
$string['opt_highlighttitles'] = 'Destacar Títulos';
$string['opt_highlightlinks'] = 'Destacar Links';
$string['opt_highlightbuttons'] = 'Destacar Botões';
$string['opt_textsize'] = 'Tamanho do Texto';
$string['opt_lineheight'] = 'Altura da Linha';
$string['opt_textspacing'] = 'Espaçamento do Texto';
$string['opt_contrast'] = 'Contraste';
$string['opt_invertcolors'] = 'Inverter Cores';
$string['opt_colorchange'] = 'Mudar Cores';
$string['opt_colorchange_desc'] = 'Filtros para daltonismo';
$string['opt_saturation'] = 'Saturação';
$string['opt_hideimages'] = 'Ocultar Imagens';
$string['opt_pauseanimations'] = 'Pausar Animações';
$string['opt_tooltips'] = 'Dicas de Ferramentas';
$string['opt_readingguide'] = 'Guia de Leitura';
$string['opt_readingmask'] = 'Máscara de Leitura';
$string['opt_cursor'] = 'Cursor';
$string['opt_focusmode'] = 'Modo Foco';
$string['opt_focusmode_desc'] = 'Esconde elementos não essenciais';
$string['opt_screenreader'] = 'Leitor de Tela';
$string['opt_screenreader_desc'] = 'Texto para fala';
$string['opt_virtualkeyboard'] = 'Teclado Virtual';
$string['opt_voicecommands'] = 'Comandos por Voz';

// Profiles.
$string['profile_lowvision'] = 'Baixa Visão';
$string['profile_lowvision_desc'] = 'Texto maior, alto contraste, cursor destacado';
$string['profile_colorblind'] = 'Daltonismo';
$string['profile_colorblind_desc'] = 'Filtro de cores e links destacados';
$string['profile_dyslexia'] = 'Dislexia';
$string['profile_dyslexia_desc'] = 'Fonte amigável, espaçamento e guia de leitura';
$string['profile_adhd'] = 'TDAH / Foco';
$string['profile_adhd_desc'] = 'Máscara de leitura, modo foco e animações pausadas';
$string['profile_senior'] = 'Idoso / Sênior';
$string['profile_senior_desc'] = 'Fonte legível, texto maior, botões destacados';
$string['profile_epilepsy'] = 'Epilepsia';
$string['profile_epilepsy_desc'] = 'Sem movimento, saturação baixa, ambiente calmo';
$string['profile_motor'] = 'Deficiência Motora';
$string['profile_motor_desc'] = 'Cursor grande, botões destacados e dicas';
$string['profile_cognitive'] = 'Cognitivo';
$string['profile_cognitive_desc'] = 'Modo foco, fonte legível, sem distrações';
$string['profile_night'] = 'Modo Noturno';
$string['profile_night_desc'] = 'Contraste escuro e baixa saturação';

// Screen reader overlay.
$string['sr_hint'] = 'Leitor de tela ativo — clique em qualquer texto para ouvir';
$string['sr_reading'] = 'Lendo…';
$string['sr_stop'] = 'Parar';

// Virtual keyboard.
$string['vk_typinginto'] = 'Digitando em';
$string['vk_none'] = 'Clique em um campo de texto';
$string['vk_space'] = 'espaço';
$string['vk_textfield'] = 'campo de texto';

// Voice commands.
$string['vc_listening'] = 'Ouvindo…';
$string['vc_notsupported'] = 'Comandos de voz não são suportados neste navegador.';
$string['vc_hint'] = 'Diga um comando, ex.: "aumentar texto", "alto contraste", "fechar painel"';

// Admin settings.
$string['settings_general'] = 'Geral';
$string['settings_enabled'] = 'Ativar plugin';
$string['settings_enabled_desc'] = 'Liga ou desliga o botão e o painel de acessibilidade em todo o site.';
$string['settings_showforguests'] = 'Mostrar para visitantes';
$string['settings_showforguests_desc'] = 'Mostrar o botão de acessibilidade para usuários não autenticados.';
$string['settings_excludedpages'] = 'Páginas excluídas';
$string['settings_excludedpages_desc'] = 'Um padrão de URL por linha (aceita * como coringa). O plugin não será carregado nas páginas correspondentes.';
$string['settings_enabledfeatures'] = 'Opções ativas';
$string['settings_enabledfeatures_desc'] = 'Escolha quais das 22 opções de acessibilidade ficam disponíveis para os usuários.';
$string['settings_fab'] = 'Botão flutuante (FAB)';
$string['settings_fabposition'] = 'Posição';
$string['settings_fabicon'] = 'Ícone';
$string['settings_fabshape'] = 'Forma';
$string['settings_panel'] = 'Painel';
$string['settings_panelformat'] = 'Formato';
$string['settings_density'] = 'Densidade';
$string['settings_showprofiles'] = 'Mostrar perfis';
$string['settings_showprofiles_desc'] = 'Mostrar a seção de perfis de acessibilidade no painel.';
$string['settings_appearance'] = 'Aparência';
$string['settings_accent'] = 'Cor de acento';
$string['position_bottomright'] = 'Inferior direita';
$string['position_bottomleft'] = 'Inferior esquerda';
$string['position_middleright'] = 'Meio direita';
$string['position_middleleft'] = 'Meio esquerda';
$string['icon_un'] = 'Logo de acessibilidade da ONU';
$string['icon_accessibility'] = 'Acessibilidade';
$string['icon_sparkles'] = 'Estrelas';
$string['icon_user'] = 'Usuário';
$string['shape_circle'] = 'Círculo';
$string['shape_square'] = 'Quadrado';
$string['format_popover'] = 'Popover';
$string['format_drawer'] = 'Gaveta';
$string['format_modal'] = 'Modal';
$string['density_compact'] = 'Compacta';
$string['density_regular'] = 'Regular';
$string['density_comfortable'] = 'Confortável';

// Errors.
$string['error_invalidsettings'] = 'Payload de configurações de acessibilidade inválido.';
$string['error_invalidkey'] = 'Configuração de acessibilidade desconhecida: {$a}';
$string['error_invalidvalue'] = 'Valor inválido para a configuração de acessibilidade {$a}.';
