# PROGRESS.md

## M0 — Ambiente + import design + docs (concluído)

- Encontrado Moodle 5.2.1+ (branch 502) já instalado e rodando (Apache + PostgreSQL) em http://192.168.8.108 — nenhum provisionamento necessário.
- Instalado nodejs 22.22.1 / npm 9.2.0 (ausentes) para build AMD.
- Importados os 8 arquivos do projeto Claude Design "a11y for Moodle" via MCP (`Moodle A11y Plugin.html`, `a11y-data.jsx`, `a11y-effects.css`, `a11y-features.jsx`, `a11y-panel.jsx`, `app.jsx`, `moodle-page.jsx`, `tweaks-panel.jsx`) para `_design-reference/` (somente leitura).
- Criado repositório git em `/var/www/moodle/public/local/a11y/` com a estrutura de diretórios do plugin (`local/a11y/{db,classes,amd,templates,lang,pix,tests,fonts}`).
- Criados `CLAUDE.md`, `PLAN.md`, `DECISIONS.md`, `ENVIRONMENT.md`.
- Próximo: M1 — esqueleto instalável do plugin (`version.php`, `lang/en`, `db/hooks.php`, `db/access.php`, `settings.php` vazio), symlink para dentro do Moodle, `upgrade.php` limpo, curso de teste populado.

## M1 — Esqueleto instalável do plugin (concluído)

- `version.php` (`$plugin->component = 'local_a11y'`, `requires` estimado para o branch 5.0 — ver comentário no arquivo e DECISIONS.md D2), `settings.php` mínimo (página vazia registrada em `localplugins`).
- `db/access.php`: capabilities `local/a11y:view` (allow guest/user/frontpage/...) e `local/a11y:configure` (manager).
- `db/hooks.php`: registra `before_standard_head_html_generation` e `before_footer_html_generation` via Hooks API (não legado).
- `classes/hook_callbacks.php`, `classes/manager.php` (defaults + `is_active_on_current_page`), `classes/config.php` (leitura de settings com fallback), `classes/output/renderer.php` (stub, populado no M2).
- `lang/en/local_a11y.php` (canônico) e `lang/pt_br/local_a11y.php`, cobrindo todas as strings de UI, opções, perfis, admin settings e erros previstas nos marcos seguintes (evita retrabalho e strings hardcoded).
- Symlink `/var/www/moodle/public/local/a11y` → repo confirmado; `admin/cli/upgrade.php --non-interactive` completou com sucesso (plugin instalado, `mdl_config_plugins` mostra `local_a11y.version = 2026072400`); `purge_caches.php` ok.
- Verificado via `apache2_error.log` + curl: nenhum warning/notice relacionado a `local_a11y` em requisições após a instalação (os que apareciam nos logs eram de antes do `version.php` existir, de navegação concorrente de outro cliente na rede).
- Curso de teste `A11YWEB` ("Acessibilidade Web 2026.1") criado com 3 seções úteis e atividades (forum, page, assign, quiz) para validação visual dos próximos marcos; admin matriculado como editingteacher.
- Próximo: M2 — FAB + painel estáticos (templates Mustache, `styles.css`, fontes locais, `renderer.php` completo).

## M2 — FAB + painel estáticos com fidelidade visual (concluído)

- **Mudança de arquitetura importante**: o repositório do plugin deixou de ser um symlink e passou a ser um diretório real dentro de `/var/www/moodle/public/local/a11y` — o build AMD do Moodle (`.grunt/babel-plugin-add-module-to-define.js`) resolve `realpath()` do arquivo-fonte antes de calcular o nome do módulo a partir do `cwd`, e isso quebra com o plugin fora da árvore do Moodle. Ver DECISIONS.md D1/D1b para o histórico completo da investigação e a decisão final. `ENVIRONMENT.md` e `CLAUDE.md` atualizados com os novos caminhos e permissões.
- `nodejs`/`npm` instalados; `npm ci` rodado em `/var/www/moodle`; `.eslintrc`/`.stylelintrc` copiados para a raiz do plugin (convenção do moodle-plugin-ci para repos standalone).
- Fontes Atkinson Hyperlegible (400/700) e Lexend (variável 400-600) baixadas uma única vez do Google Fonts e empacotadas em `fonts/*.woff2` — `styles.css` as referencia via `[[font:local_a11y|...]]`, resolvido por `theme/font.php` (não `[[pix:...]]`, que é só para imagens).
- `classes/icons.php`, `classes/options.php`, `classes/profiles.php`, `classes/tone_colors.php`: portas fiéis de `ICON_PATHS`/`OPTIONS`/`PROFILES`/`TONE_COLORS` de `a11y-data.jsx` (ver DECISIONS.md D9 sobre o subconjunto de ícones).
- `classes/output/fab.php` + `classes/output/panel.php` (renderable/templatable) e `classes/output/renderer.php` completo (`render_head_html()` injeta os filtros SVG de daltonismo; `render_footer_html()` renderiza FAB+painel e agenda `js_call_amd('local_a11y/main', 'init')`).
- `templates/fab.mustache`, `templates/panel.mustache`, `templates/option_toggle.mustache`, `templates/option_stepper.mustache`, `templates/profile_card.mustache`.
- `styles.css` completo: tokens `--a11y-*`, componentes FAB/painel/perfis/opções/stepper/switch/teclado virtual/leitor de tela, opt-out `.local-a11y-root`, e a tradução completa de `a11y-effects.css` para os seletores reais do Moodle (`#page`, `.navbar`, `footer#page-footer` em vez de `.moodle-shell`).
- `amd/src/main.js` + `amd/src/panel.js`: abrir/fechar painel, colapsar categorias, Alt+A, Esc — comportamento suficiente para inspeção visual; estado real das 22 opções fica para o M3.
- Corrigido bug em `classes/config.php`: `get_config()` retorna `false` (não `null`) quando a setting não existe, então `?? default` nunca acionava o fallback — trocado por checagem explícita `=== false`. Também corrigida a lógica de `allowed_for_current_user()`: usuários anônimos não têm nenhum papel atribuído em contexto de sistema neste site (login forçado), então `has_capability()` sempre retornava falso para eles — agora visitantes anônimos são controlados só pela config `showforguests`, e a capability só é checada para usuários autenticados.
- **Verificação visual real** com Playwright (Chromium headless, instalado via `npm i playwright` + `npx playwright install chromium`) logado como `admin` (senha resetada via CLI, ver ENVIRONMENT.md) no curso de teste `A11YWEB`: FAB fechado, painel aberto com perfis e opções, todas as categorias expandidas — capturas em `_verification/m2/`. Fidelidade visual ao protótipo confirmada (cores, raios, sombras, grid de perfis 3 colunas, steppers com pontos e rótulo de nível).
- Próximo: M3 — ligar o estado real das 22 opções (toggle/stepper realmente mudam valor), aplicar as classes `body.a11y-*`, persistir via preferência do usuário / localStorage, e no-FOUC de verdade.

## M3 — Estado, persistência e efeitos CSS das 22 opções (concluído)

- `classes/manager.php`: `sanitize_settings()` (merge/validação/clamp/coerção, ignora chaves desconhecidas e opções desabilitadas pelo admin), `count_active()`, `get_current_user_settings()` (servidor, só para usuários logados não-guest), `get_boolean_class_map()`/`get_stepper_class_prefix_map()` — porte fiel e explícito das linhas `if (settings.x) body.classList.add(...)` de `app.jsx` (nota: `invertColors` → `a11y-invert`, não `a11y-invert-colors`; `colorChange` → prefixo `a11y-color-`, não `a11y-color-change-`; e os 5 booleanos `readingGuide/readingMask/screenReader/virtualKeyboard/voiceCommands` **não** viram classe de body — no protótipo eles só controlam overlays React sempre-montados, replicados em JS no M5).
- **Descoberta importante**: `user_preference_allow_ajax_update()` foi removida nesta versão do Moodle (MDL-79124) — substituída por registro de definição de preferência via `lib.php::local_a11y_user_preferences()`, consumida pela nova rota REST `core_user`. Ver DECISIONS.md D10 (inclui o traceback do HTTP 400 que motivou a investigação).
- `amd/src/storage.js`: `getSettings()`/`saveSettings()` via `core_user/repository` (usuários logados) ou `localStorage` (visitantes), com migração automática de `localStorage` → preferência do usuário no primeiro login (conforme briefing seção 3).
- `amd/src/effects.js`: `apply(settings)` — remove todas as classes `a11y-*` e reaplica a partir do estado atual (idempotente), usando os mesmos mapas booleano/stepper do `manager.php` (hardcoded em espelho, documentado para manter sincronizado).
- `classes/output/renderer.php::render_nofouc_script()`: script inline síncrono no topo do `<body>` (novo hook `before_standard_top_of_body_html_generation`, registrado em `db/hooks.php` — o único ponto onde `document.body` já existe mas nada abaixo pintou ainda), lê a preferência já resolvida no PHP (usuários logados) ou instrui o próprio script a ler `localStorage` (visitantes), sem FOUC.
- `amd/src/panel.js` reescrito: delegação de cliques real para toggles/steppers/reset, `renderOption()`/`renderHeader()`/`renderCategoryCount()` para refletir o estado no DOM (switch `aria-pressed`, pontos/rótulo do stepper, contadores por categoria, badge do FAB, texto de status do cabeçalho).
- `amd/src/main.js` reescrito: dono do estado (`settings`), constrói o mapa de metadados das opções a partir do próprio DOM renderizado pelo servidor (evita duplicar a lista de opções uma terceira vez em JS), orquestra `storage` + `effects` + `panel` a cada mudança.
- `classes/output/fab.php`/`panel.php`: agora renderizam o estado **real** do usuário no HTML inicial (contagem de opções ativas, switches/steppers já no valor certo, badge do FAB) — não apenas o estado zerado.
- **Verificado via Playwright**: alternar "Fonte Legível" e avançar "Tamanho do Texto" duas vezes aplica `a11y-readable-font a11y-text-size-2` imediatamente; **após reload completo da página**, as mesmas classes reaparecem (persistência via preferência do usuário confirmada, sem FOUC); cabeçalho mostra "2 opções ativas"; badge do FAB visível com "2"; "Restaurar padrões" limpa tudo corretamente. Capturas em `_verification/m3/`.
- Também corrigido: modo debug do Moodle foi temporariamente elevado para diagnosticar o 400 e depois restaurado a 0/desligado.
- Próximo: M4 — aplicar perfis (9 presets), busca com filtro nas opções, focus trap WCAG no painel, refinar Alt+A (já funcional desde M2, revisar acessibilidade completa).

## M4 — Perfis, busca, contador, reset, atalho, focus trap (concluído)

- `amd/src/profiles.js`: porte fiel dos 9 presets `apply` de `PROFILES` (só os dados de comportamento — ícone/tom/rótulo continuam só no servidor, lidos do próprio DOM pelo `panel.js`, sem triplicar dados).
- `main.js`: `onProfileSelect(id)` — aplica `{...DEFAULTS, ...preset}` (reset antes de aplicar, como `applyProfile()` do protótipo); clicar no perfil já ativo desfaz (chama `onReset()`); qualquer edição manual de uma opção individual limpa o perfil ativo (`activeProfileId = null`), igual ao protótipo. Estado do perfil ativo é efêmero (não persistido), fiel ao `useState` do protótipo — só os valores resultantes em `settings` persistem.
- `panel.js`: `renderActiveProfile(id)` — atualiza o banner "Perfil ativo" no cabeçalho e o estado visual dos cards (`aria-pressed`, borda/check) lendo ícone/tom/rótulo diretamente do próprio card já renderizado pelo servidor (sem duplicar dados de perfil uma segunda vez em JS).
- `filterOptions(query)`: busca filtra as linhas de opção por texto do rótulo, força todas as categorias com resultado abertas (desabilitando o toggle manual enquanto busca, como no protótipo), esconde a seção de perfis durante a busca, e restaura o estado de expansão anterior de cada categoria ao limpar a busca.
- Focus trap WCAG 2.2: `Tab`/`Shift+Tab` ciclam apenas entre os elementos focáveis visíveis dentro do painel; `Esc` fecha e devolve o foco ao FAB (já existia desde o M2); atalho `Alt+A` (já existia desde o M2, confirmado funcional integrado ao novo estado).
- **Verificado via Playwright**: selecionar o perfil "Dislexia" aplica `a11y-dyslexic-font a11y-line-height-2 a11y-text-spacing-2` (fonte Lexend visivelmente aplicada em toda a página no screenshot), mostra banner "Perfil ativo / Dislexia" com o tom violeta correto e badge "4"; clicar de novo desfaz tudo; buscar "contraste" mostra só a opção "Contraste" e esconde os perfis; limpar a busca restaura tudo; 40 TABs seguidos nunca saem do painel; Esc devolve foco ao FAB. Capturas em `_verification/m4/`.
- Próximo: M5 — leitor de tela (TTS), teclado virtual, comandos de voz, guia e máscara de leitura (os 5 booleanos que não viram classe de body, ver M3).

## M5 — Recursos avançados (concluído)

- `amd/src/reading_guide.js` / `reading_mask.js`: portes diretos de `ReadingGuide`/`ReadingMask` (`a11y-panel.jsx`) — overlay que segue o mouse verticalmente.
- `amd/src/screen_reader.js`: porte de `ScreenReaderLayer` (`a11y-features.jsx`) — hover destaca texto legível dentro de `#page` (nunca dentro do painel/FAB), clique fala via `SpeechSynthesis`, pílula flutuante "Lendo…/Parar".
- `amd/src/virtual_keyboard.js`: porte de `VirtualKeyboard` — QWERTY + acentos pt-BR + shift + backspace + espaço + enter, digita no campo focado (via setter nativo do `<input>`/`<textarea>`, disparando `input` para frameworks reativos), desloca FAB/painel para cima (`--local-a11y-lift`, 248px) enquanto aberto. Ver DECISIONS.md D11 sobre não usar um template Mustache aqui.
- `amd/src/voice_commands.js`: **não existe no protótipo** (`voiceCommands` é um toggle sem comportamento em `a11y-features.jsx`) — implementação própria usando `SpeechRecognition`/`webkitSpeechRecognition` com fallback gracioso (mensagem "não suportado" se a API não existir), comandos em pt-BR/en batendo com a dica já exibida no rodapé (`vc_hint`): abrir/fechar painel, aumentar/diminuir texto, alto contraste, modo escuro, restaurar, ligar leitor de tela/teclado virtual. Ver DECISIONS.md e comentário no topo do arquivo.
- `main.js`: `syncAdvancedFeatures()` inicia/para os 5 módulos a cada mudança de estado (init e `commit()`), e `voiceCallbacks` conecta os comandos de voz às mesmas funções de mutação de estado usadas pela UI manual (`setStepperValue`, `onToggle`, `onReset`, `Panel.open/close`).
- **Verificado via Playwright**: teclado virtual aparece com o layout completo (dígitos, QWERTY, acentos, shift/backspace/espaço/enter) e digita corretamente no campo focado; FAB visivelmente deslocado para cima acima do teclado; guia de leitura e máscara de leitura aparecem e seguem o mouse; pílula do leitor de tela aparece e permanece visível mesmo com o painel fechado (overlay de página, não do painel); teclado/guia/máscara desaparecem completamente ao desligar a opção. Capturas em `_verification/m5/`.
- Próximo: M6 — settings de administração (mapeando os "Tweaks" do protótipo), capabilities (já criadas no M1) e privacy provider.

_(Este arquivo será atualizado ao final de cada marco subsequente.)_
