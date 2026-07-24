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

_(Este arquivo será atualizado ao final de cada marco subsequente.)_
