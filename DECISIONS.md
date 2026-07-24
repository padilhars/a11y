# DECISIONS.md

Registro de decisões tomadas autonomamente diante de ambiguidades do briefing. Fonte de verdade em caso de dúvida futura: `_design-reference/` (protótipo) > este arquivo > bom senso Moodle.

## D1 — Estrutura do repositório de trabalho

O briefing pede uma árvore `local/a11y/...` na raiz do "repositório de trabalho", mas o plugin precisa fisicamente existir dentro do webroot do Moodle (`/var/www/moodle/public/local/a11y`) para ser carregado. Decisão: repositório git dedicado em `/var/www/local_a11y-project/`, com o plugin em `local/a11y/` dentro dele (batendo literalmente com a árvore pedida), e um **symlink** `/var/www/moodle/public/local/a11y → /var/www/local_a11y-project/local/a11y`. Isso evita versionar o core do Moodle (centenas de MB) e segue a prática comum de desenvolvimento de plugins Moodle (repo do plugin symlinkado para dentro de uma instalação de teste).

`_design-reference/`, `_verification/`, `CLAUDE.md`, `PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `ENVIRONMENT.md` ficam na raiz do repo, **fora** do symlink — assim ferramentas de lint do Moodle (phpcs, mustache lint, plugin file checks) nunca os enxergam como parte do plugin.

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

## D8 — Fontes locais

`Atkinson Hyperlegible` e `Lexend` empacotadas em `local/a11y/fonts/` (WOFF2, subconjunto latin) em vez de Google Fonts (bloqueio de CDN institucional / LGPD), conforme já determinado no briefing — registrado aqui apenas para consolidar a fonte exata usada (peso 400/700 Atkinson, 400/500/600 Lexend, batendo com o `<link>` do protótipo).
