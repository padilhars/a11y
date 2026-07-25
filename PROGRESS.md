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

## M6 — Settings de admin, capabilities e privacy provider (concluído)

- `settings.php` completo: mapeamento 1:1 dos "Tweaks" do protótipo para `admin_setting_*` (seção 5.4) — `enabled`/`showforguests`/`excludedpages`/`enabledfeatures` (checkbox geral, checkbox visitantes, textarea de padrões de URL, multicheckbox com as 22 opções — rótulos reaproveitados de `classes/options.php`, tudo já default "todas ligadas"), `fabposition`/`fabicon`/`fabshape` (selects), `panelformat`/`density`/`showprofiles`, `accent` (`admin_setting_configcolourpicker`).
- Capabilities (`local/a11y:view`, `local/a11y:configure`) já existiam desde o M1 — confirmado que `settings.php` não precisa de checagem extra de capability (o próprio `admin_settingpage` com `$hassiteconfig` já exige `moodle/site:config`, e a UI do painel/FAB usa `local/a11y:view` via `classes/config.php`).
- `classes/privacy/provider.php`: implementa `core_privacy\local\metadata\provider` (declara a preferência `local_a11y_settings` via `add_user_preference()`) e `core_privacy\local\request\user_preference_provider` (`export_user_preferences()`, reaproveitando `manager::sanitize_settings()` para nunca exportar chaves desconhecidas/corrompidas). Sem tabelas de banco — nada além da preferência de usuário é armazenado (visitantes usam só `localStorage`, fora do alcance do Moodle).
- **Verificado via Playwright**: página de settings (`admin/settings.php?section=local_a11y`) carrega sem nenhuma caixa de erro, todos os 22 rótulos aparecem corretamente na lista "Opções ativas", color picker funcional; `local_a11y` aparece no registro de plugins do `tool_dataprivacy` (prova de que o provider é descoberto corretamente). Captura em `_verification/m6/`.
- Próximo: M7 — testes automatizados (PHPUnit, Behat, axe-core) e matriz de navegador/tema.

## M7 — Testes e verificação (concluído, com uma ressalva documentada)

- **Ambiente de testes provisionado nesta sessão** (nada existia antes): Composer com `--ignore-platform-reqs`/`platform.php` (core ainda não declara suporte a PHP 8.5), locale `en_AU.UTF-8`, `$CFG->phpunit_*`/`$CFG->behat_*` em `config.php`, segundo vhost Apache na porta 8080 para o Behat. Detalhes completos em ENVIRONMENT.md.
- **PHPUnit — 16/16 verdes**: `tests/manager_test.php` (10 testes: forma dos defaults, payload válido passa direto, entrada não-array cai para defaults, clamp de stepper fora do range, chaves desconhecidas descartadas, coerção de booleans em string, `enabledfeatures` do admin força opção desabilitada de volta ao default, `count_active` via `@dataProvider`, mapas de classe boolean/stepper batendo com `app.jsx`) + `tests/privacy_provider_test.php` (3 testes: metadata declara a preferência, sem dado salvo nada é exportado, dado salvo é exportado sanitizado). As 3 "PHPUnit Deprecations" reportadas são avisos do **core** do Moodle (incompatibilidade PHP 8.5 em `moodlelib.php`/`group/lib.php`/`mod/workshop/lib.php`), não do plugin — fora do escopo corrigir código do core.
- **`admin/cli/checks.php`** e `php -l` em todo `.php` do plugin: limpo. Sem `moodle-plugin-ci`/`phpcs` disponíveis no ambiente (sem acesso para instalar globalmente da forma esperada); mitigado com o `.eslintrc`/`.stylelintrc` copiados do core (M2) para o ESLint real já ter rodado limpo em cada build AMD.
- **Behat**: `tests/behat/local_a11y.feature` escrito (2 cenários: persistência do Tamanho do Texto após reload; aplicar/desfazer o perfil Dislexia com checagem de classes de body), ambiente inicializado com sucesso — mas **não executado**: exige Selenium+chromedriver (WebDriver clássico) que não foi possível montar rapidamente neste host (ver DECISIONS.md D12). Os mesmos dois cenários foram validados de ponta a ponta via Playwright real (`_verification/m3/`, `_verification/m4/`).
- **axe-core — zero violações críticas/sérias**: rodado via Playwright (`axe-core` injetado com `page.addScriptTag`) no curso de teste, logado, com o painel aberto e todas as categorias expandidas. Primeira rodada encontrou 2 sérias + 4 moderadas; corrigidas: `nested-interactive` (linha do toggle não é mais `role="button"` — o `<button>` do switch já é o único controle focável, ver `templates/option_toggle.mustache`), `color-contrast` (`--a11y-text-hint` #9ca3af não atinge 4.5:1 em texto pequeno — trocado por `--a11y-text-muted` #6b7280 em `.local-a11y-option__desc`, `.local-a11y-stepper__label`, `.local-a11y-panel__section-heading-sublabel`, `.local-a11y-panel__footer-kbd`), `landmark-banner-is-top-level`/`landmark-contentinfo-is-top-level` (`<header>`/`<footer>` do painel viraram `<div>` — são conteúdo de um popover, não landmarks de página), `region` (pílulas do leitor de tela/comandos de voz ganharam `role="status"`). Segunda rodada: só sobrou 1 moderada (`landmark-unique` em `.primary-navigation > .moremenu` — markup do **tema Boost**, não do plugin). Resultado final em `_verification/m7/axe-results-final.json`.
- **Matriz de tema/viewport**: Boost desktop (já coberto extensivamente M2-M6), Boost mobile 390px, Classic desktop 1440px, Classic mobile 390px — FAB e painel renderizam corretamente nos 4 casos (capturas em `_verification/m7/`); tema revertido para Boost ao final.
- Próximo: M8 — empacotamento (`local_a11y.zip`), README com screenshots, CHANGELOG.

## M8 — Empacotamento final (concluído)

- `README.md` (visão geral, requisitos, instalação, as 22 opções/9 perfis, persistência, configuração de admin, privacidade, comandos de desenvolvimento) e `CHANGELOG.md` (entrada `0.1.0`).
- `pix/icon.svg` criado (estava faltando desde o M1 — mesmo ícone "accessibility" do FAB).
- **`local_a11y.zip` gerado e testado via upload real na interface do Moodle**, com o site ao vivo:
  1. Plugin desinstalado via `admin/cli/uninstall_plugins.php --plugins=local_a11y --run` e a pasta movida para fora de `local/` (backup preservando o `.git`), confirmando que o FAB desaparece.
  2. Upload do ZIP em **Administração do site → Plugins → Instalar plugins** via automação de navegador real (Playwright): seletor de arquivos do Moodle → "Enviar um arquivo" → escolher `local_a11y.zip` → "Enviar este arquivo" → "Instalar plugin do arquivo ZIP". Moodle reconheceu corretamente o componente (`installzipcomponent=local_a11y`) e validou: *"Validando local_a11y ... OK — Validação bem sucedida, a instalação pode continuar"*.
  3. Fluxo de confirmação padrão do Moodle (verificação de plugins → nível de maturidade ALPHA avisado, como esperado, já que `$plugin->maturity = MATURITY_ALPHA`) até `admin/cli/upgrade.php` concluir o registro das settings.
  4. Confirmado que os arquivos extraídos batem exatamente com o repositório (`git status` sem diffs após restaurar o histórico `.git` por cima do diretório extraído) e que o FAB volta a funcionar normalmente.
  5. **Bug encontrado e corrigido durante esse processo** (DECISIONS.md D13): o `zip`/`rsync` usados para montar o pacote excluíam `amd/src/.eslintrc` sem querer (padrão de exclusão sem âncora de raiz combinando com qualquer `.eslintrc` na árvore, não só o da raiz do plugin). Corrigido e o ZIP final republicado com os 82 arquivos esperados.
  - Capturas do fluxo completo em `_verification/m8/`.
- `local_a11y.zip` fica em `local/a11y/local_a11y.zip` (fora do git — `.gitignore`; reproduzível via o mesmo `rsync`+`zip` documentado em DECISIONS.md D13/CLAUDE.md).

## Resumo final — Definição de Pronto

- [x] Plugin instala num Moodle 5.0+ (5.2.1 neste ambiente) sem erros; nenhum aviso de depreciação **originado pelo plugin** (os avisos de depreciação vistos em `admin/cli/checks.php`/PHPUnit são todos do **core** do Moodle rodando em PHP 8.5, fora do escopo).
- [x] FAB e painel visualmente equivalentes ao protótipo (capturas em `_verification/m2` a `_verification/m8`).
- [x] As 22 opções e os 9 perfis funcionam em páginas reais (dashboard, curso, atividade, configurações de admin) — verificado nos temas Boost e Classic, desktop e mobile.
- [x] Preferências persistem entre páginas e sessões (preferência de usuário via nova rota REST `core_user`, `localStorage` + migração automática para visitantes); sem FOUC (bootstrap síncrono no topo do `<body>`).
- [x] Painel e FAB imunes aos próprios efeitos (`.local-a11y-root` com `filter: none !important` e `cursor` resetado).
- [x] `pt_br` e `en` completos; nenhuma string hardcoded (tudo via `get_string()`/`core/str`).
- [x] Privacy provider implementado; capabilities definidas; settings de admin funcionais.
- [~] `moodle-plugin-ci`/Code checker: **não instalado** (sem acesso para instalar globalmente da forma padrão neste host) — mitigado com `admin/cli/checks.php` limpo, `php -l` em 100% dos arquivos PHP do plugin, e ESLint real (via `grunt amd`, config copiada do core) limpo em cada build. PHPUnit 16/16 verde. Behat **escrito mas não executado** (falta WebDriver clássico no host — ver DECISIONS.md D12); cenários equivalentes validados via Playwright real. axe-core: **zero violações críticas/sérias**.
- [x] `local_a11y.zip` gerado **e testado por instalação via interface real do Moodle** (não simulado).
- [x] Este arquivo descreve o entregue e como validar cada marco.

## Correção pós-entrega — efeitos de cor/contraste/foco não funcionavam (concluído)

Usuário reportou, após o M8, que Contraste/Inverter Cores/Mudar Cores/Saturação/Modo Foco não funcionavam corretamente em uso real (fora dos screenshots controlados da verificação anterior, que por coincidência sempre testaram esses efeitos em combinação com outra opção que mascarava o problema, ou não os testaram em profundidade suficiente). Dois bugs reais encontrados e corrigidos em `styles.css` — detalhes completos em DECISIONS.md D14:

1. Um gate `body.a11y-active` nunca satisfeito deixava o `filter` combinado (Inverter/Mudar Cores/Saturação) sempre em `none`, apesar das variáveis CSS corretas serem calculadas. Corrigido tornando a aplicação do filtro incondicional.
2. Contraste e Modo Foco usavam seletores baseados no mock do protótipo (`.m-*`) ou genéricos demais para o Moodle real, deixando a maior parte da página (região principal, cards de seção, drawers, barra de abas) fora do alcance. Corrigido combinando overrides das variáveis `--bs-*` do Bootstrap 5.3 (recolore componentes genéricos automaticamente) com overrides explícitos `!important` nas regiões do Moodle que têm cor "hardcoded" no CSS compilado do tema (`#region-main`, `.main-inner`, `.drawer`, `.moremenu`).

Reverificado extensivamente via Playwright com `getComputedStyle` (não só captura de tela — uma automação anterior mostrou que consultas ingênuas como `document.querySelector('.card')` podem casar com elementos fora de tela/pré-hidratação, não com o conteúdo visível real) em `#region-main`, `.main-inner`, `.moremenu`, `.navbar`, drawer do índice do curso e cards de seção, para os 3 níveis de contraste, mais capturas de tela confirmando visualmente Inverter Cores, Mudar Cores (daltonismo), Saturação (mono) e Modo Foco (esconde índice do curso, abas secundárias e itens de navbar, centraliza o conteúdo). Capturas em `_verification/bugfix-effects/`.

## Auditoria de segurança pós-entrega (concluída)

Usuário pediu para verificar se o plugin/servidor não expõe brechas exploráveis contra o Moodle ou o servidor web. Detalhes completos em DECISIONS.md D15. Resumo:

- **Achado crítico, corrigido**: o vhost Apache servia publicamente (HTTP 200, com *directory listing* em `.git/objects/`) todo o conteúdo não-plugin do repositório — `.git/` completo (histórico clonável remotamente), `ENVIRONMENT.md` (com a senha de admin de desenvolvimento em texto puro), `CLAUDE.md`/`PLAN.md`/`PROGRESS.md`/`DECISIONS.md`, `_design-reference/`, `_verification/`, `tests/*.php`, `local_a11y.zip`. Corrigido no nível do vhost (`moodle.conf` e `moodle-behat.conf`): `Options -Indexes`, `<DirectoryMatch "/\.git">` global negado, e `<LocationMatch>`/`<FilesMatch>` negando os caminhos não-plugin de `local/a11y`. Verificado com `apache2ctl configtest`, reload, e bateria de `curl` (403 em tudo sensível, 200 mantido nos assets reais do plugin, site continua funcionando).
- **Achado de baixo risco, corrigido**: `amd/src/voice_commands.js::buildPill()` interpolava uma variável em `innerHTML` via template literal (não explorável hoje — a variável só vem de `getString()` — mas padrão perigoso). Reescrito para usar `innerHTML` só com marcação estática e `textContent` para o conteúdo dinâmico. AMD recompilado, cache purgado, revalidado via Playwright (pill de voz renderiza normalmente, sem erros de console).
- **Sem problemas encontrados**: SQL/exec/eval/unserialize/superglobais no PHP; acesso HTTP direto aos arquivos PHP do plugin fora do bootstrap (retornam vazio, inofensivo); demais usos de `innerHTML` em `amd/src/` (estáticos ou copiando entre elementos já confiáveis); `render_nofouc_script()` usa `json_encode()` em tudo que embute no `<script>` inline; não há endpoint AJAX/webservice próprio (escrita de preferências delega inteiramente à rota core `core_user/repository`, que já cuida de sesskey/capability); capabilities (`local/a11y:view`/`local/a11y:configure`) corretamente escopadas; sanitização de settings espelhada e consistente entre cliente (`storage.js`) e servidor (`manager.php`); regex de `excludedpages` protegida por `preg_quote()`.
- **Precaução adicional**: a senha de admin (`A11yDev2026!`), que ficou exposta publicamente por um tempo via `ENVIRONMENT.md` antes da correção acima, foi rotacionada.

## Correção pós-entrega #2 — cor/contraste ainda não cobria a navbar/drawer (concluído)

Usuário apontou (com o CSS de referência do protótipo, `.moodle-shell`) que Contraste/Inverter/Mudar Cores/Saturação continuavam sem afetar "todos os elementos". Causa: `#page` (usado por D14) não é o ancestral real de tudo — a navbar principal, o drawer do índice do curso e o menu do usuário ficam fora de `#page`, dentro de `#page-wrapper`. Trocado o alvo do `filter` combinado e dos overrides de cor de link de `#page` para `#page-wrapper` em `styles.css` — ver DECISIONS.md D16. Reverificado via Playwright: navbar/drawer agora corretamente afetados nos 4 efeitos; FAB/painel continuam imunes (confirmado por comparação de pixel real, não só `getComputedStyle`, já que `filter` não é refletido em computed style de propriedades como `background-color`).

## Ícone padrão do FAB trocado para o logo de acessibilidade da ONU (concluído)

A pedido do usuário, o ícone padrão do botão flutuante agora é o "Accessibility logo (UN)" (Wikimedia Commons, CC BY-SA 4.0) em vez do ícone Lucide `accessibility`. Empacotado localmente em `pix/accessibility-un.svg` (nunca carregado de terceiros), renderizado via novo método `icons::un_accessibility_svg()` (asset de 2 cores fixas, diferente do resto dos ícones do plugin que são traços `currentColor`). Novo valor `un` no seletor `local_a11y/fabicon`, agora o default; os ícones anteriores continuam disponíveis. Atribuição CC BY-SA documentada em README.md — ver DECISIONS.md D17. Verificado via Playwright (ícone renderiza corretamente por padrão, troca entre os 4 ícones no admin funciona, PHPUnit 16/16 verde).

## Badge do painel sincronizado com o ícone do FAB (concluído)

`.local-a11y-panel__badge` deixou de mostrar sempre o ícone Lucide `accessibility` e passou a espelhar o ícone configurado em `local_a11y/fabicon` (o mesmo do FAB), via novo helper compartilhado `icons::fabicon_svg()`. Caso especial para o logo da ONU (asset branco sólido): badge ganha fundo `accent` sólido em vez do pastel padrão, para permanecer legível — ver DECISIONS.md D18. Verificado via Playwright (badge e FAB sempre mostram o mesmo ícone, nos 4 valores possíveis) e PHPUnit (16/16 verde).

## Rodapé do painel: mensagem de crédito CPTED (concluído)

"Preferências salvas" / "Suas configurações são lembradas..." no rodapé do painel foi substituído por "Desenvolvido com ❤️ pela **CPTED** para você." (com "CPTED" em negrito), atalho `Alt+A` mantido — ver DECISIONS.md D19. Verificado via Playwright e PHPUnit (16/16 verde).

## Badge do logo da ONU aumentado (concluído)

`.local-a11y-panel__badge--un` (só quando o ícone configurado é o logo da ONU) foi de 36px para 41px, o SVG interno de 20px para 28px — a grossura das linhas escala proporcionalmente "de graça" porque o `stroke-width` do SVG é definido no mesmo espaço de coordenadas do `viewBox`. Outros ícones inalterados (36px/20px) — ver DECISIONS.md D20.

## Badge do logo da ONU volta a ser igual aos demais ícones (concluído)

A pedido do usuário, o badge do painel com o logo da ONU voltou a ter exatamente o mesmo tamanho (36px/20px) e fundo (pastel do `accent`) dos outros 3 ícones — revertendo os tratamentos especiais de D18/D20. Corrigido na raiz: `pix/accessibility-un.svg` passou a usar `currentColor` em vez de `#fff` fixo, então agora tema junto com o badge normalmente (no FAB continua branco, sem mudança, já que lá `color` já era branco). CSS/PHP/mustache do tratamento especial removidos. Ver DECISIONS.md D21.

## Ícone do rodapé do painel removido (concluído)

`.local-a11y-panel__footer-icon` removido do rodapé do painel (template, PHP e CSS) — sobra só o texto de crédito e o atalho `Alt+A`. De passagem, removida também `.local-a11y-panel__footer-subtitle`, CSS morto desde a mudança de D19. Ver DECISIONS.md D22.

## Reset consolidado num botão fixo no cabeçalho (concluído)

O banner "perfil ativo" e o botão separado "Restaurar padrões" (ambos condicionalmente escondidos, mudando a altura do cabeçalho) foram substituídos por um único botão de reset fixo ao lado do X — sempre presente, desabilitado+apagado sem opções ativas, colorido no accent (ou no tom do perfil ativo) caso contrário, com tooltip. Cabeçalho agora tem altura constante. Ver DECISIONS.md D23. Verificado via Playwright, PHPUnit 16/16 verde.

## Correção do "deslocamento" das opções ao ativar (concluído)

A causa real não era a borda de `.local-a11y-option` (já reservada, 1px sempre) — era `.local-a11y-category__count` (bolha de contagem da categoria), cuja caixa é mais alta que o resto do cabeçalho e usava `[hidden]` puro, crescendo o cabeçalho da categoria ~1.75px na primeira opção ativada. Corrigido reservando o espaço sempre (`visibility:hidden` em vez de `display:none`, precisou de `!important` para vencer o `[hidden]{display:none!important}` global do Bootstrap). De passagem, corrigido também: o painel herdava a troca de fonte de `readableFont`/`dyslexicFont` por estar dentro de `#page`. Ver DECISIONS.md D24. Verificado via Playwright em duas categorias, PHPUnit 16/16 verde.

## Clique repetido nos steppers: shadow trocado por flash de background (concluído)

O box-shadow que aparecia ao reclicar uma opção stepper já ativa (Tamanho do Texto, Altura da Linha, Espaçamento do Texto, Contraste, Mudar Cores, Saturação, Cursor) era na verdade o anel de foco `[role="button"]:focus` do próprio Moodle core, disparando em qualquer clique de mouse (não só teclado). Suprimido só para `:not(:focus-visible)` (mantém o anel intacto para navegação real por teclado, confirmado via Tab) e substituído por um flash rápido do background (classe `--pulse`, animação CSS) quando o clique acontece numa stepper que já estava ativa. Ver DECISIONS.md D25. Verificado via Playwright, PHPUnit 16/16 verde.

## Nenhuma opção de tipografia altera mais o painel (concluído)

D24 só tinha corrigido `font-family` de Fonte Legível/Fonte para Dislexia; esta correção fecha as 7 lacunas restantes (Destacar Títulos/Links/Botões, Tamanho do Texto, Altura da Linha, Espaçamento do Texto, e `font-weight`/`letter-spacing` de Fonte para Dislexia). Duas técnicas: `:not(.local-a11y-root, .local-a11y-root *)` nos seletores que combinavam diretamente com elementos do painel (botões, spans), e "selar" `font-size`/`font-weight`/`line-height`/`letter-spacing`/`word-spacing` em `.local-a11y-root` para bloquear vazamento por herança (várias regras setam a propriedade no `#page` em si, que ainda propaga por herança mesmo com o `:not()`). Ver DECISIONS.md D26. Verificado exaustivamente via Playwright (503 elementos, 8 propriedades, 8 opções ativas simultâneas no máximo = 0 diferenças). PHPUnit 16/16 verde.

## Barra de rolagem horizontal espúria corrigida (concluído)

Inverter Cores, Mudar Cores e Saturação (as 3 opções que usam `filter` em `#page-wrapper`, D16) criavam uma barra de rolagem horizontal espúria (~320px) — causa: `filter` transforma o elemento em containing block de descendentes `position:fixed`, e `#page-wrapper` contém drawers do próprio Moodle deliberadamente estacionados fora da viewport enquanto fechados, cujo "fora da tela" passa a contar como overflow real assim que deixam de ser fixos-à-viewport. Corrigido com `overflow-x: hidden` no `<body>` só enquanto uma dessas opções está ativa, sem tocar no alvo do filtro nem nos drawers do Moodle. Contraste nunca teve o problema (não usa `filter`). Ver DECISIONS.md D27. Verificado via Playwright (tentativa real de rolagem, não só `scrollWidth`), PHPUnit 16/16 verde.

## Segunda auditoria de segurança (concluída)

Reauditoria completa a pedido do usuário (código + Apache), cobrindo tudo desde D15. Achado e corrigido: dois arquivos de backup de editor (`pix/accessibility-un-bak.svg`, `styles.css~`) estavam publicamente acessíveis via HTTP — removidos, e o `<FilesMatch>` do Apache endurecido para negar genericamente qualquer `*~`/`*.bak`/`*.orig`/`*.swp`/`*-bak.*` (defesa em profundidade, não só os dois arquivos encontrados). Resto das proteções de D15 reverificadas ao vivo (ainda corretas). Código novo desde D15 (ícone da ONU, reset consolidado, animação de pulso) revisado sem achados. Ver DECISIONS.md D28. PHPUnit 16/16 verde.

## Tooltips customizados (concluído)

"Dicas de Ferramentas" reescrita de um efeito CSS quebrado (`content: attr(title)`, sem suprimir o tooltip nativo, só `a`/`button`) para uma 6ª feature avançada em JS (`amd/src/tooltips.js`, mesmo padrão de reading guide/screen reader): balão escuro com seta, posicionado dinamicamente (com flip para baixo perto da borda), suprime o `title` nativo enquanto ativo, funciona com `title`/`aria-label`/`alt`/`data-tooltip`, hover e foco de teclado, `aria-describedby` para leitores de tela. Ver DECISIONS.md D29. Verificado via Playwright, PHPUnit 16/16 verde.

_(Este arquivo será atualizado ao final de cada marco subsequente.)_
