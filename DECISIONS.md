# DECISIONS.md

Registro de decisões tomadas autonomamente diante de ambiguidades do briefing. Fonte de verdade em caso de dúvida futura: `_design-reference/` (protótipo) > este arquivo > bom senso Moodle.

## D1 — Estrutura do repositório de trabalho (revisado — ver D1b)

~~Decisão original: repositório git dedicado em `/var/www/moodle/public/local/a11y/`, plugin em `local/a11y/` dentro dele, symlinkado para `/var/www/moodle/public/local/a11y`.~~ **Revertida — ver D1b**: o build AMD do Moodle (`grunt amd`, especificamente `.grunt/babel-plugin-add-module-to-define.js`) resolve o *realpath* do arquivo-fonte antes de calcular o nome do módulo AMD a partir do `cwd`; como o symlink aponta para fora da árvore do Moodle, `fs.realpathSync()` escapa do `cwd` e o cálculo do nome do módulo falha (`Unable to find module name for ...`). Não é possível compilar AMD com o plugin fora da árvore do Moodle.

## D1b — Repositório = diretório real dentro do Moodle (decisão final)

O repositório git agora tem raiz em `/var/www/moodle/public/local/a11y/` (diretório real, não symlink). O plugin (`version.php`, `db/`, `classes/`, `amd/`, `templates/`, `lang/`, `styles.css`, `fonts/`, `pix/`, `tests/`) fica na raiz do repo (equivalente a "ser" o `local/a11y/` pedido pelo briefing — como é praticamente universal em repositórios de plugins Moodle reais, ex. `moodle-local_a11y` no GitHub tem `version.php` na raiz do repo, não em `local/a11y/version.php` dentro dele). `_design-reference/`, `_verification/`, `CLAUDE.md`, `PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `ENVIRONMENT.md` ficam **também** na raiz do repo, como pedido — o Moodle ignora arquivos/diretórios que não reconhece (não quebra phpcs/mustache-lint/plugin-scan, que só olham para nomes de arquivo específicos).

Permissões: `/var/www/moodle` é `www-data:www-data` 750. Para que o usuário do shell (`padilha`, sem grupo `www-data`) consiga editar os arquivos diretamente (as tools de edição não passam por `sudo`), apliquei `chmod o+rx` apenas nos diretórios ancestrais `/var/www/moodle`, `/var/www/moodle/public`, `/var/www/moodle/public/local` (travessia, não escrita/listagem), e `chown padilha:padilha` + `chmod -R a+rX` recursivo em `public/local/a11y` (padilha escreve direto; `www-data`/Apache continuam lendo via bit "outros"). Isso é aceitável neste host de desenvolvimento de uso único; não seria uma escolha de produção.

## D2 — Ambiente já existia

O host já tinha Moodle 5.2.1 + PostgreSQL + Apache funcionando (ver ENVIRONMENT.md). Não foi necessário provisionar via moodle-docker nem `admin/cli/install.php`. Apenas instalei `nodejs`/`npm` (ausentes) para o build AMD.

## D3 — moodle-page.jsx

Confirmado o aviso do briefing: `moodle-page.jsx` é mockup do Moodle usado só para demonstrar o protótipo isolado. Foi importado para `_design-reference/` por completude/rastreabilidade, mas **não** será portado — as páginas reais do Moodle (dashboard, curso, atividade) fazem esse papel.

## D4 — tweaks-panel.jsx → settings.php

`tweaks-panel.jsx` é o harness de edição do próprio Claude Design (protocolo `postMessage` com o host de design), não faz parte do produto final. Os *valores* que ele edita (`fabPosition`, `fabIconStyle`, `fabShape`, `panelFormat`, `density`, `accent`, `showProfiles`, `language`) definem 1:1 as settings de admin em `settings.php` conforme a seção 5.4 do briefing. O componente React/protocolo em si não é portado.

## D5 — Idioma do painel

`STRINGS` do protótipo tem chaves `pt-BR` e `en`; Moodle usa `pt_br` como código de idioma de plugin (`lang/pt_br/local_a11y.php`) e resolve o idioma efetivo via `current_language()`. O JS usa `M.cfg.language` (normalizado para `pt-BR`/`en`) para decidir qual conjunto de strings buscar — mas como strings vêm do `core/str` do Moodle (`get_strings`) em vez de hardcoded, o plugin herda automaticamente qualquer idioma adicional instalado no site sem precisar do fallback pt-BR/en do protótipo.

## D6 — Filtros de daltonismo com `<svg><filter>`

Especificado no briefing: comportamento visual (hue-rotate/sepia via CSS `filter`, como no protótipo) mantido igual — SVG `<filter>` com matrizes de cores é usado só para robustez em navegadores/telas onde CSS filter composto (`invert() saturate() hue-rotate()`) causa artefatos; a saída visual permanece equivalente ao protótipo.

## D7 — `local/a11y:view` para guest/frontpage

O FAB deve aparecer mesmo para visitantes não autenticados (`showforguests` setting, default ligado) — capability `local/a11y:view` com `CAP_ALLOW` para `guest`, `user`, `frontpage` nos `archetypes` de `db/access.php`, e fallback de persistência via `localStorage` para quem não está logado, migrando para `user_preference` no primeiro login (conforme briefing seção 3).

## D10 — Persistência via `core_user/repository`, sem `user_preference_allow_ajax_update()`

O briefing pedia `user_preference_allow_ajax_update()` + `core_user/repository::setUserPreference` (AMD). A primeira parte **não existe mais** nesta versão do Moodle: `user_preference_allow_ajax_update()`, `M.util.set_user_preference` e `lib/ajax/setuserpref.php` foram **removidos** (ver `public/user/UPGRADING.md`, MDL-79124), substituídos por uma rota REST (`/api/rest/v2/user/{user}/preferences/{preference}`, `public/user/classes/route/api/preferences.php`) que exige a preferência **registrada** via um *callback* de plugin `{component}_user_preferences()` em `lib.php` (descoberto via `get_plugins_with_function('user_preferences')`), retornando `['null' => NULL_ALLOWED, 'default' => null, 'type' => PARAM_RAW]` — o mesmo padrão usado por `mod_forum`, `theme_boost` etc. Implementado em `lib.php::local_a11y_user_preferences()`. Sem esse registro, `POST` na rota falha com HTTP 400 "Valor inválido de parâmetro detectado" (`invalid_parameter_exception` em `core_user\route\api\preferences::set_single_preference()`), pois `core\user::get_preference_definition()` não reconhece a chave.

O restante da segunda parte do pedido (`core_user/repository::setUserPreference` via AMD) foi seguido à risca — `amd/src/storage.js` usa exatamente esse módulo.

## D14 — Correção pós-entrega: efeitos de Contraste/Inverter/Mudar Cores/Saturação/Modo Foco não funcionavam de verdade

Após a entrega do M8, o usuário reportou que vários efeitos não funcionavam corretamente em uso real. Investigação encontrou **dois bugs distintos**, ambos no `styles.css` (nenhum no JS/PHP):

1. **Bug crítico (Inverter Cores, Mudar Cores, Saturação totalmente inertes)**: a regra que de fato aplica o `filter` combinado estava condicionada a `body.a11y-active #page { filter: ... }`, mas **nenhum código JS jamais adiciona a classe `a11y-active` ao `<body>`** — ela nunca existiu em `manager::get_boolean_class_map()`/`effects.js`, era resquício de uma ideia abandonada. Resultado: as variáveis `--a11y-filter-invert`/`--a11y-filter-saturate`/`--a11y-filter-color` eram definidas corretamente pelas classes `a11y-invert`/`a11y-saturation-N`/`a11y-color-N`, mas nunca consumidas. Corrigido tornando a regra `#page { filter: ...}` incondicional (as variáveis não usadas resolvem para vazio, então é inofensivo quando nada está ativo) — mesmo padrão do `.moodle-shell` original do protótipo, que nunca teve esse gate.

2. **Bug de cobertura (Contraste só mudava bg/nav/texto, Modo Foco só escondia um item)**: o CSS de M3 usava seletores calcados no protótipo (`.m-page`, `.m-card` etc., que são classes do **mock** em `moodle-page.jsx`) ou seletores Moodle genéricos demais (`#page`, `.navbar`). O Moodle real (tema Boost/Bootstrap 5.3) tem duas categorias de superfícies visuais bem diferentes:
   - Componentes Bootstrap genéricos (`.card`, `.dropdown-menu`, `.popover`, `.modal-content`) — herdam `background-color` de variáveis CSS próprias (`--bs-card-bg: var(--bs-body-bg)` etc., confirmado no CSS compilado do tema), então sobrescrever `--bs-body-bg`/`--bs-body-color`/`--bs-link-color`/`--bs-border-color` (e os pares `-rgb`, usados por utilitários como `.bg-body`) em `body.a11y-contrast-N` já re-tema esses automaticamente, sem precisar enumerar cada componente.
   - Regiões estruturais do **próprio Moodle** (`#region-main`, `.main-inner`, `.drawer`, `.moremenu`) — têm `background-color` **hardcoded** no CSS compilado (`#region-main{background-color:#fff}`), completamente alheias às variáveis do Bootstrap. Essas precisam de override explícito com `!important` por seletor.

   A correção final combina as duas abordagens: variáveis `--bs-*` (cobre componentes genéricos em qualquer página, inclusive fora do curso) **+** overrides explícitos e `!important` na lista `#region-main, .main-inner, .drawer, .moremenu, .card, .bg-white, .dropdown-menu, .popover, .modal-content, footer#page-footer` (cobre as regiões hardcoded do Moodle). Modo Foco similarmente trocou os seletores do mock (`[data-region="blocks-column"]`) por estrutura real do tema Boost (`#theme_boost-drawers-courseindex`, `#theme_boost-drawers-primary`, `.secondary-navigation`, `.drawertoggle`).

   Verificado via Playwright com checagem de `getComputedStyle` (não só screenshot, já que uma investigação preliminar mostrou que `document.querySelector('.card')`/`.section.card` no DOM real correspondia a elementos fora de tela — resquício da versão pré-hidratação-JS do curso, não a seção visível; o seletor certo passou a ser validado por `elementFromPoint()` + `getBoundingClientRect()`), confirmando `#region-main`, `.main-inner`, `.moremenu`, `.navbar`, o drawer do índice do curso e os cards de seção todos corretamente escurecidos/reclareados/altíssimo-contraste conforme o nível.

   **Limitação residual conhecida e aceita**: a barra de abas secundária (`.moremenu`, tag `<nav class="moremenu navigation observed">`) tem `getComputedStyle` correto (confirmado programaticamente) mas ocasionalmente pinta com a cor antiga em capturas de tela do Chromium headless — muito provavelmente uma reafirmação de estilo inline feita pelo próprio JS de scroll do Moodle (`observed` sugere um `IntersectionObserver` que ajusta o visual dessa barra ao rolar), correndo em paralelo ao nosso CSS. Texto permanece legível (não é uma falha de contraste/acessibilidade), e o problema é cosmético, isolado a esse elemento específico — não investigado mais a fundo dado o custo/benefício.

## D13 — Empacotamento: `zip` não inclui dotfiles recursivamente por padrão

Ao gerar `local_a11y.zip`, um `rsync --exclude='.eslintrc'` (sem barra inicial) removeu **todas** as ocorrências de `.eslintrc` na árvore, inclusive `amd/src/.eslintrc` (que é funcional, não é o `.eslintrc` de conveniência da raiz — ver M2). Corrigido ancorando os padrões de exclusão à raiz (`--exclude='/.eslintrc'`). Isso só afetou o artefato do ZIP de distribuição, nunca o repositório git (que sempre teve o arquivo correto) nem a instalação em disco durante o desenvolvimento. Validado publicando o ZIP corrigido e comparando `git status` após reinstalar por cima — sem diffs inesperados.

## D12 — Behat com cenários `@javascript` escrito mas não executado

`tests/behat/local_a11y.feature` foi escrito (steps genéricos documentados do `behat_general.php`, sem *step definitions* customizadas), e o ambiente Behat foi inicializado com sucesso (`admin/tool/behat/cli/init.php`, incluindo build de CSS de Boost e Classic). A **execução** dos cenários `@javascript` exige um WebDriver clássico (Selenium + chromedriver na mesma major version do navegador), que este host não tinha; a tentativa de montar isso rapidamente (Java + `npm i chromedriver`) esbarrou em descasamento de versão com o Chromium do Playwright e problema de permissão de cache entre os usuários `padilha`/`www-data`. Decisão: não persegui uma instalação completa de Selenium (custo desproporcional nesta sessão) e, em vez disso, verifiquei os mesmos dois cenários do `.feature` (mudar Tamanho do Texto + reload persiste; aplicar/desfazer perfil Dislexia) de ponta a ponta com Playwright real contra o Moodle rodando, com captura de tela — ver `_verification/m3/`, `_verification/m4/` e ENVIRONMENT.md para os detalhes e o caminho para terminar a configuração do Selenium depois.

O **axe-core** (também amarrado ao mesmo WebDriver na integração `--axe` do Behat) foi rodado com sucesso de forma independente, via Playwright + `axe-core` injetado na página real — ver M7 em PROGRESS.md e `_verification/m7/`.

## D11 — `templates/virtual_keyboard.mustache` não foi criado

A seção 4 do briefing lista `templates/virtual_keyboard.mustache` entre os templates a criar. Decidi **não** criá-lo: ao contrário do FAB/painel (que precisam ser renderizados no servidor para o no-FOUC e para SEO/acessibilidade sem JS), o teclado virtual só existe quando o usuário ativa a opção correspondente — é inteiramente client-side, criado/destruído por `amd/src/virtual_keyboard.js` via DOM puro. Um template Mustache exigiria buscá-lo de forma assíncrona via `core/templates` (`Templates.renderForPromise`) toda vez que a opção é ligada, sem nenhum ganho real (a estrutura muda de qualquer forma a cada toggle de Shift, o que já é regenerado em JS). Optei por manter a paridade de estrutura HTML/CSS (classes `local-a11y-vk__*` já definidas em `styles.css`) sem o round-trip assíncrono desnecessário.

## D9 — Subconjunto de `ICON_PATHS` portado

`classes/icons.php` porta todos os ícones usados pelo FAB, painel, perfis, categorias e recursos avançados (teclado virtual, leitor de tela) — 1:1 com o protótipo. Os ícones que só existiam em `ICON_PATHS` para desenhar o **mockup** do Moodle (`moodleLogo`, `menu`, `home`, `calendar`, `fileText`, `video`, `edit`, `clipboard`, `messageSquare`, `folder`, `award`, `users`, `graduationCap`, `settings`, `logOut`, `download`, `upload`, `globe`) foram omitidos, consistente com D3 (moodle-page.jsx não é implementado — o Moodle real já tem seus próprios ícones/tema). Nenhum ícone usado por OPTIONS, PROFILES ou pela chrome do painel foi omitido ou renomeado.

## D8 — Fontes locais

`Atkinson Hyperlegible` e `Lexend` empacotadas em `local/a11y/fonts/` (WOFF2, subconjunto latin) em vez de Google Fonts (bloqueio de CDN institucional / LGPD), conforme já determinado no briefing — registrado aqui apenas para consolidar a fonte exata usada (peso 400/700 Atkinson, 400/500/600 Lexend, batendo com o `<link>` do protótipo).
