# PROGRESS.md

## M0 — Ambiente + import design + docs (concluído)

- Encontrado Moodle 5.2.1+ (branch 502) já instalado e rodando (Apache + PostgreSQL) em http://192.168.8.108 — nenhum provisionamento necessário.
- Instalado nodejs 22.22.1 / npm 9.2.0 (ausentes) para build AMD.
- Importados os 8 arquivos do projeto Claude Design "a11y for Moodle" via MCP (`Moodle A11y Plugin.html`, `a11y-data.jsx`, `a11y-effects.css`, `a11y-features.jsx`, `a11y-panel.jsx`, `app.jsx`, `moodle-page.jsx`, `tweaks-panel.jsx`) para `_design-reference/` (somente leitura).
- Criado repositório git em `/var/www/local_a11y-project/` com a estrutura de diretórios do plugin (`local/a11y/{db,classes,amd,templates,lang,pix,tests,fonts}`).
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

_(Este arquivo será atualizado ao final de cada marco subsequente.)_
