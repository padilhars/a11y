# CLAUDE.md — contexto permanente do projeto local_a11y

## O que é este projeto

Plugin de acessibilidade `local_a11y` para Moodle 5.0+, replicando o protótipo em `_design-reference/` (importado do Claude Design, projeto "a11y for Moodle"). Ver `DECISIONS.md` para decisões de arquitetura e `PLAN.md`/`PROGRESS.md` para status.

## Regra de ouro

`_design-reference/**` é **somente leitura** e é a especificação normativa de layout, cores, textos, comportamento e dados (OPTIONS, PROFILES, STRINGS, DEFAULT_SETTINGS, TONE_COLORS, ICON_PATHS). Nunca editar esses arquivos; nunca enviá-los para produção (não fazem parte do plugin, ficam fora do symlink para dentro do Moodle). Qualquer dúvida de "como deveria se comportar" → reler o arquivo `.jsx`/`.css` correspondente ali.

## Caminhos importantes

- Plugin (fonte real, versionado, **não** é symlink — ver DECISIONS.md D1b): `/var/www/moodle/public/local/a11y/`
- Moodle core: `/var/www/moodle/` (webroot em `public/`)
- moodledata: `/var/moodledata`
- URL de teste: http://192.168.8.108
- Permissões: `padilha` é dono de `public/local/a11y` (edição direta sem sudo); grupo `www-data` também tem escrita (build AMD roda como `www-data`). Ver DECISIONS.md D1b.

## Comandos frequentes

Layout 5.0+: CLI scripts ficam em `/var/www/moodle/admin/cli/` (raiz do checkout, **fora** de `public/`, que é só o webroot HTTP). `padilha` não tem permissão de leitura direta em `/var/www/moodle` (dono `www-data:www-data`, 750) — sempre `sudo -u www-data`.

```bash
# Recompilar AMD (SEMPRE depois de editar amd/src/*.js) - rodar como www-data,
# que é dono de node_modules/ e do cache do grunt; precisa "cd" antes, senão
# o npx local não é encontrado.
sudo -u www-data bash -c "cd /var/www/moodle && HOME=/var/www npx grunt amd --root=public/local/a11y"

# Upgrade do plugin (após mudar version.php/db/*.php)
sudo -u www-data php /var/www/moodle/admin/cli/upgrade.php --non-interactive

# Purge de caches (necessário após mudar templates/lang/settings)
sudo -u www-data php /var/www/moodle/admin/cli/purge_caches.php

# Checks estáticos
sudo -u www-data php /var/www/moodle/admin/cli/checks.php

# PHPUnit (uma vez): init (ver ENVIRONMENT.md para composer/locale necessários antes)
sudo -u www-data php /var/www/moodle/public/admin/tool/phpunit/cli/init.php --disable-composer
cd /var/www/moodle && sudo -u www-data vendor/bin/phpunit --configuration public/local/a11y/phpunit.xml

# Behat (uma vez): init (ver ENVIRONMENT.md sobre o vhost :8080 dedicado)
sudo -u www-data php /var/www/moodle/public/admin/tool/behat/cli/init.php --disable-composer
cd /var/www/moodle && sudo -u www-data vendor/bin/behat --config /var/behatdata/behatrun/behat/behat.yml --tags @local_a11y
```

## Convenções de código Moodle (obrigatórias)

- PHPDoc em todo arquivo/classe/método (`@package local_a11y`, `@copyright`, `@license`).
- `defined('MOODLE_INTERNAL') || die();` no topo de todo arquivo PHP de classe fora de `classes/` autoloaded (namespaced classes em `classes/` NÃO precisam — usam `MOODLE_INTERNAL` só em `lib.php`/`settings.php`/`db/*.php`).
- Nenhum `echo` fora de renderers; usar `$OUTPUT`/`$PAGE` corretamente.
- `required_param()`/`optional_param()` com tipos explícitos; `require_sesskey()` em toda escrita via AJAX/webservice.
- Nenhuma string hardcoded — tudo via `get_string()` (PHP) ou `core/str` + `{{#str}}` Mustache (JS/templates). `lang/en/local_a11y.php` é canônico; `lang/pt_br/local_a11y.php` espelha todas as chaves.
- CSS: um único `styles.css` na raiz do plugin (Moodle carrega automaticamente), variáveis `--a11y-*`.
- JS: AMD ES6 em `amd/src/`, **nunca** editar `amd/build/*.min.js` à mão — sempre gerado por `grunt amd`. Build commitado.
- Hooks API (`db/hooks.php`), não callbacks legados (`local_a11y_before_footer_html_generation` etc. estão depreciados desde 4.4).

## Fluxo ao terminar um marco (M0–M8, ver PLAN.md)

1. Recompilar AMD se `amd/src/` mudou.
2. `upgrade.php --non-interactive` se `version.php`/`db/*.php` mudou.
3. `purge_caches.php`.
4. Verificar no navegador (curl ou screenshot).
5. Atualizar `PROGRESS.md`.
6. Commit (Conventional Commits: `feat(local_a11y): ...`, `fix(local_a11y): ...`, `test(local_a11y): ...`, `docs: ...`).
7. Seguir para o próximo marco sem esperar aprovação (autonomia total, conforme instrução original).
