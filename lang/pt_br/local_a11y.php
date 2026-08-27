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
 * @description Portuguese (Brazil) strings for local_a11y.
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

$string['pluginname'] = 'Acessibilidade (A11y)';

// Capabilities.
$string['a11y:view'] = 'Usar o painel de acessibilidade';
$string['a11y:configure'] = 'Configurar o plugin de acessibilidade';
$string['a11y:viewstats'] = 'Ver o relatório agregado de estatísticas de uso da acessibilidade';

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
$string['on'] = 'Ativo';
$string['off'] = 'Inativo';
$string['savetitle'] = 'Desenvolvido com ❤️ pela <strong>UFPel</strong> para você.';
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
$string['wordspacinglevel_0'] = 'Padrão';
$string['wordspacinglevel_1'] = 'Leve';
$string['wordspacinglevel_2'] = 'Médio';
$string['wordspacinglevel_3'] = 'Amplo';
$string['alignlevel_0'] = 'Padrão';
$string['alignlevel_1'] = 'Esquerda';
$string['alignlevel_2'] = 'Centralizado';
$string['alignlevel_3'] = 'Direita';
$string['alignlevel_4'] = 'Justificado';
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
$string['bluelightlevel_0'] = 'Desligado';
$string['bluelightlevel_1'] = 'Sutil';
$string['bluelightlevel_2'] = 'Médio';
$string['bluelightlevel_3'] = 'Forte';

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
$string['opt_wordspacing'] = 'Espaçamento entre Palavras';
$string['opt_textalign'] = 'Alinhamento do Texto';
$string['opt_contrast'] = 'Contraste';
$string['opt_invertcolors'] = 'Inverter Cores';
$string['opt_colorchange'] = 'Mudar Cores';
$string['opt_colorchange_desc'] = 'Filtros para daltonismo';
$string['opt_saturation'] = 'Saturação';
$string['opt_bluelightfilter'] = 'Filtro de Luz Azul';
$string['opt_hideimages'] = 'Ocultar Imagens';
$string['opt_pauseanimations'] = 'Pausar Animações';
$string['opt_silencemedia'] = 'Silenciar Mídia';
$string['opt_silencemedia_desc'] = 'Silencia mídia com reprodução automática';
$string['opt_tooltips'] = 'Dicas de Ferramentas';
$string['opt_readingguide'] = 'Guia de Leitura';
$string['opt_readingmask'] = 'Máscara de Leitura';
$string['opt_magnifier'] = 'Lupa';
$string['opt_cursor'] = 'Cursor';
$string['opt_focusmode'] = 'Modo Foco';
$string['opt_focusmode_desc'] = 'Esconde elementos não essenciais';
$string['opt_screenreader'] = 'Leitor de Tela';
$string['opt_screenreader_desc'] = 'Texto para fala';
$string['opt_virtualkeyboard'] = 'Teclado Virtual';
$string['opt_voicecommands'] = 'Comandos por Voz';
$string['helpbtn'] = 'Ajuda';
$string['help_vc_intro'] = 'Diga um dos comandos abaixo:';
$string['help_vc_1'] = '"aumentar texto" — Aumenta o tamanho do texto';
$string['help_vc_2'] = '"diminuir texto" — Diminui o tamanho do texto';
$string['help_vc_3'] = '"alto contraste" — Ativa alto contraste';
$string['help_vc_4'] = '"modo escuro" — Ativa modo escuro';
$string['help_vc_5'] = '"restaurar" — Restaura todos os padrões';
$string['help_vc_6'] = '"fechar painel" — Fecha o painel';
$string['help_vc_7'] = '"abrir painel" — Abre o painel';
$string['help_vc_8'] = '"rolar para baixo" — Rola a página para baixo';
$string['help_vc_9'] = '"rolar para cima" — Rola a página para cima';
$string['help_vc_10'] = '"ir para o topo" — Vai ao topo da página';
$string['help_vc_11'] = '"ir para o final" — Vai ao final da página';
$string['help_vc_12'] = '"leitor de tela" — Ativa/desativa leitor de tela';
$string['help_fn_intro'] = 'Como usar:';
$string['help_fn_1'] = 'Ative a opção';
$string['help_fn_2'] = 'Olhe para o centro da tela e clique em <strong>Calibrar</strong>';
$string['help_fn_3'] = 'Mova a cabeça para mover o cursor virtual';
$string['help_fn_4'] = 'Abra a boca (~1 s) ou pisque os dois olhos (~1 s) para clicar — quando o anel em volta do cursor virtual se preencher, o clique é realizado';
$string['help_fn_5'] = 'Para rolar a página, leve o cursor até a borda superior ou inferior da tela';
$string['help_sr_intro'] = 'Como usar:';
$string['help_sr_1'] = 'Ative a opção — um indicador aparece no canto da tela';
$string['help_sr_2'] = 'Passe o mouse sobre qualquer texto da página para destacá-lo';
$string['help_sr_3'] = 'Clique no texto destacado para ouvi-lo em voz alta';
$string['help_sr_4'] = 'Use o botão "Parar" no indicador para interromper a leitura a qualquer momento';
$string['help_vk_intro'] = 'Como usar:';
$string['help_vk_1'] = 'Ative a opção — o teclado aparece fixo na parte inferior da tela';
$string['help_vk_2'] = 'Clique em um campo de texto da página para posicionar o cursor nele';
$string['help_vk_3'] = 'Toque nas teclas do teclado virtual para digitar naquele campo';
$string['help_vk_4'] = 'Toque em ⇧ para alternar entre minúsculas e maiúsculas; a fileira de acentos (á, é, í, ó, ú, ã, õ, ç, â, ê) fica sempre disponível';
$string['help_rg_intro'] = 'Como funciona:';
$string['help_rg_1'] = 'Uma linha horizontal acompanha o cursor do mouse verticalmente pela tela';
$string['help_rg_2'] = 'Ajuda a manter o lugar certo ao ler parágrafos longos, sem perder a linha';
$string['help_rg_3'] = 'A cor da linha pode ser personalizada pelo administrador do site, em Configurações';
$string['help_rm_intro'] = 'Como funciona:';
$string['help_rm_1'] = 'Uma faixa horizontal ao redor do cursor do mouse permanece visível; o restante da tela escurece';
$string['help_rm_2'] = 'Ajuda a focar em uma linha de cada vez, reduzindo a distração do resto da página';
$string['help_rm_3'] = 'Mova o mouse verticalmente para deslocar a faixa de leitura';
$string['help_sm_intro'] = 'Como funciona:';
$string['help_sm_1'] = 'Áudio com reprodução automática (ou já tocando) é silenciado e pausado';
$string['help_sm_2'] = 'Vídeo com reprodução automática (ou já tocando) é silenciado, mas continua tocando sem som — ative "Pausar Animações" também se quiser que ele pare';
$string['help_sm_3'] = 'Vídeos incorporados do YouTube e Vimeo também são silenciados, quando a página permite controlá-los';
$string['help_sm_4'] = 'Mídia adicionada à página depois — inclusive vídeos carregados sob demanda — também é silenciada enquanto a opção estiver ativa';
$string['help_sm_5'] = 'Desativar esta opção não volta a ligar o som sozinho: só evita silenciar mídia nova a partir daí';
$string['help_mag_intro'] = 'Como funciona:';
$string['help_mag_1'] = 'Uma lupa circular acompanha o ponteiro do mouse e amplia o conteúdo sob ela — texto, imagens e tabelas';
$string['help_mag_2'] = 'Use as setas do teclado para mover a lupa sem precisar do mouse';
$string['help_mag_3'] = 'Use + e - para aumentar ou diminuir o zoom (2x, 3x, 4x)';
$string['help_mag_4'] = 'Pressione Esc para desligar a lupa a qualquer momento';
$string['help_pa_intro'] = 'O que é pausado:';
$string['help_pa_1'] = 'Animações e transições CSS da página (banners, efeitos de hover, carrosséis)';
$string['help_pa_2'] = 'GIFs animados, congelados no quadro atual';
$string['help_pa_3'] = 'Vídeos com reprodução automática, ou que já estejam tocando';
$string['help_pa_4'] = 'Qualquer vídeo que tente começar a tocar sozinho enquanto a opção estiver ativa também é pausado';
$string['opt_facenavigation'] = 'Navegação por Face';
$string['opt_facenavigation_desc'] = 'Controle o cursor com movimentos da cabeça';
$string['face_loading'] = 'Carregando modelo…';
$string['face_camhint'] = 'Olhe para a câmera em posição neutra e clique em Calibrar.';
$string['face_calibrate'] = 'Calibrar';
$string['face_active'] = 'Câmera ativa';
$string['face_stop'] = 'Parar';
$string['face_sens'] = 'Velocidade do Cursor Virtual';
$string['face_error'] = 'Erro ao iniciar';
$string['face_click'] = 'Clique: Abrir a boca ou piscar com os dois olhos';
$string['face_scroll'] = 'Rolar página: Leve o cursor virtual até a borda superior ou inferior da página';

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
$string['settings_enabledfeatures_desc'] = 'Escolha quais das 28 opções de acessibilidade ficam disponíveis para os usuários.';
$string['settings_fab'] = 'Botão flutuante (FAB)';
$string['settings_fabposition'] = 'Posição';
$string['settings_fabposition_desc'] = 'Em qual canto da tela o botão flutuante fica fixo.';
$string['settings_fabicon'] = 'Ícone';
$string['settings_fabicon_desc'] = 'Ícone exibido dentro do botão flutuante.';
$string['settings_fabshape'] = 'Forma';
$string['settings_fabshape_desc'] = 'Contorno do botão flutuante.';
$string['settings_panel'] = 'Painel';
$string['settings_panelformat'] = 'Formato';
$string['settings_panelformat_desc'] = 'Como o painel se abre em telas de desktop: um pequeno popover ancorado no botão, uma gaveta lateral de altura total, ou um modal centralizado na tela. Em celulares e tablets pequenos o painel sempre abre no estilo gaveta, independente desta opção.';
$string['settings_density'] = 'Densidade';
$string['settings_density_desc'] = 'Quanto espaço cada linha de opção ocupa no painel. Compacta cabe mais opções na tela e oculta as descrições; Confortável espaça mais as opções, com ícones maiores; Regular é o padrão intermediário.';
$string['settings_showprofiles'] = 'Mostrar perfis';
$string['settings_showprofiles_desc'] = 'Mostrar a seção de perfis de acessibilidade no painel.';
$string['settings_footertext'] = 'Texto do rodapé do painel';
$string['settings_footertext_desc'] = 'Mensagem customizada exibida no rodapé do painel, abaixo das categorias de opções. Deixe em branco para usar a mensagem padrão ("Desenvolvido com ❤️ pela UFPel para você.").';
$string['settings_colors'] = 'Cores';
$string['settings_accent'] = 'Cor de acento';
$string['settings_accent_desc'] = 'Cor principal do botão flutuante, do painel e dos indicadores de opção ativa.';
$string['settings_highlighttitlescolor'] = 'Cor de destaque dos títulos';
$string['settings_highlighttitlescolor_desc'] = 'Cor usada pela opção "Destacar Títulos".';
$string['settings_highlightlinkscolor'] = 'Cor de destaque dos links';
$string['settings_highlightlinkscolor_desc'] = 'Cor usada pela opção "Destacar Links".';
$string['settings_highlightbuttonscolor'] = 'Cor de destaque dos botões';
$string['settings_highlightbuttonscolor_desc'] = 'Cor usada pela opção "Destacar Botões".';
$string['settings_readingguidecolor'] = 'Cor do guia de leitura';
$string['settings_readingguidecolor_desc'] = 'Cor da linha do "Guia de Leitura" que acompanha o mouse.';
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

// Estatísticas (D47 - contadores de uso agregados e anônimos).
$string['settings_stats'] = 'Estatísticas';
$string['settings_collectstats'] = 'Coletar estatísticas de uso';
$string['settings_collectstats_desc'] = 'Quando ativado, toda vez que qualquer usuário (inclusive visitantes) ativa uma opção de acessibilidade, um contador agregado e único dessa opção específica é incrementado, para o site inteiro. Só três coisas são armazenadas por opção: seu identificador, um contador total acumulado, e quando foi atualizado pela última vez — nada mais. Nenhum identificador de usuário, sessão, curso ou IP é registrado, e não é mantido nenhum registro de data/hora por evento individual, então não é possível reconstruir o comportamento de nenhuma pessoa específica a partir desses dados. Desativado por padrão. Veja o relatório em Administração do site → Plugins → Plugins locais → Acessibilidade (A11y) → Estatísticas de uso.';
$string['statstitle'] = 'Estatísticas de uso';
$string['statsintro'] = 'Contagens de ativação agregadas e anônimas por opção de acessibilidade — um total acumulado por opção, para o site inteiro. Nenhum dado de usuário, sessão, curso ou IP é coletado.';
$string['statsdisabled'] = 'A coleta de estatísticas de uso está desativada no momento ("Coletar estatísticas de uso" nas configurações do plugin) — os números abaixo, se houver, são de quando ela esteve ativada anteriormente.';
$string['statsempty'] = 'Nenhuma estatística de uso registrada ainda.';
$string['statscol_feature'] = 'Opção';
$string['statscol_counter'] = 'Ativações';
$string['statscol_lastupdated'] = 'Última atualização';

// Errors.
$string['error_invalidsettings'] = 'Payload de configurações de acessibilidade inválido.';
$string['error_invalidkey'] = 'Configuração de acessibilidade desconhecida: {$a}';
$string['error_invalidvalue'] = 'Valor inválido para a configuração de acessibilidade {$a}.';
