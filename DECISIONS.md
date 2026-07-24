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

## D9 — Subconjunto de `ICON_PATHS` portado

`classes/icons.php` porta todos os ícones usados pelo FAB, painel, perfis, categorias e recursos avançados (teclado virtual, leitor de tela) — 1:1 com o protótipo. Os ícones que só existiam em `ICON_PATHS` para desenhar o **mockup** do Moodle (`moodleLogo`, `menu`, `home`, `calendar`, `fileText`, `video`, `edit`, `clipboard`, `messageSquare`, `folder`, `award`, `users`, `graduationCap`, `settings`, `logOut`, `download`, `upload`, `globe`) foram omitidos, consistente com D3 (moodle-page.jsx não é implementado — o Moodle real já tem seus próprios ícones/tema). Nenhum ícone usado por OPTIONS, PROFILES ou pela chrome do painel foi omitido ou renomeado.

## D8 — Fontes locais

`Atkinson Hyperlegible` e `Lexend` empacotadas em `local/a11y/fonts/` (WOFF2, subconjunto latin) em vez de Google Fonts (bloqueio de CDN institucional / LGPD), conforme já determinado no briefing — registrado aqui apenas para consolidar a fonte exata usada (peso 400/700 Atkinson, 400/500/600 Lexend, batendo com o `<link>` do protótipo).
