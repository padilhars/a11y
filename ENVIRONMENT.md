# ENVIRONMENT.md — local_a11y dev environment

## Ambiente encontrado (não provisionado por esta sessão)

O host já continha uma instalação Moodle funcional quando o trabalho começou:

- **Moodle**: 5.2.1+ (Build: 20260722), branch `502`, `$version = 2026042001.07` — satisfaz o requisito 5.0+.
- **Webroot**: `/var/www/moodle/public/` (Moodle 5.0+ moveu o document root para `public/`; Apache `DocumentRoot` aponta para lá — ver `/etc/apache2/sites-available/moodle.conf`).
- **Código-fonte Moodle**: `/var/www/moodle/` é a raiz do checkout. Layout 5.0+: scripts não expostos à web (CLI, `lib/`) ficam em `/var/www/moodle/admin/cli/` e `/var/www/moodle/lib/` (fora de `public/`); `public/` contém só o que é servido via HTTP (`public/admin/` é a UI web de administração, diferente de `admin/cli/`). `public/config.php` é um shim que dá `require_once` no `config.php` real na raiz.
- **BD**: PostgreSQL 16 (serviço `postgresql`), banco `moodle`, usuário `moodleuser`. Credenciais em `/var/www/moodle/config.php` (não versionado, contém senha).
- **moodledata**: `/var/moodledata` (owned by `www-data`).
- **Web server**: Apache 2 (`mpm` padrão), vhost único em `/etc/apache2/sites-available/moodle.conf`, `ServerName 192.168.8.108`, escutando na porta 80.
- **URL**: http://192.168.8.108
- **Admin**: usuário `admin` já existente. Senha original desconhecida (pré-existente); resetada nesta sessão via `admin/cli/reset_password.php --username=admin --password='A11yDev2026!' --ignore-password-policy` para permitir login automatizado (Playwright) durante o desenvolvimento/verificação visual.
- Todos os arquivos do Moodle são propriedade de `www-data:www-data` com permissões `750`; o usuário do shell (`padilha`) tem sudo NOPASSWD total (`(ALL) NOPASSWD: ALL`), usado para leitura/gravação nesse diretório.

> **Observação de segurança**: nunca imprima o conteúdo de `config.php` (contém `$CFG->dbpass`) em logs versionados. Ele já está fora do repositório do plugin.

## O que esta sessão instalou/adicionou

- `nodejs` 22.22.1 + `npm` 9.2.0 via `apt-get install nodejs npm` (necessário para `grunt amd`, ausente no host); `npm ci` rodado em `/var/www/moodle` (como `www-data`) para instalar as devDependencies do Gruntfile.
- Repositório do plugin **é** `/var/www/moodle/public/local/a11y/` (diretório real, git — ver DECISIONS.md D1b sobre por que não é um symlink: o build AMD do Moodle resolve `realpath()` no arquivo-fonte antes de calcular o nome do módulo, o que quebra com plugin fora da árvore).
- `chmod o+rx` em `/var/www/moodle`, `/var/www/moodle/public`, `/var/www/moodle/public/local` (travessia) + `chown padilha:padilha` recursivo em `public/local/a11y`, para permitir edição direta sem `sudo` (ver DECISIONS.md D1b).
- Curso de teste "Acessibilidade Web" (shortname `A11YWEB`) com seções/atividades para validação visual (criado via CLI generators — ver seção abaixo).

## Comandos de start/stop

```bash
# Apache
sudo systemctl start|stop|restart apache2

# PostgreSQL
sudo systemctl start|stop|restart postgresql

# Status
sudo apache2ctl -S
sudo -u postgres psql -d moodle -c "\dt" | head
```

Moodle não roda como contêiner nesta máquina — é uma instalação nativa (Apache + mod_php ou PHP-FPM + PostgreSQL). Não há `docker-compose` a subir/derrubar.

## Comandos de manutenção do Moodle (CLI, layout 5.0+: `public/admin/cli/`)

```bash
sudo -u www-data php /var/www/moodle/admin/cli/upgrade.php --non-interactive
sudo -u www-data php /var/www/moodle/admin/cli/purge_caches.php
sudo -u www-data php /var/www/moodle/admin/cli/checks.php
sudo -u www-data php /var/www/moodle/admin/tool/phpunit/cli/init.php
```

Sempre execute como `www-data` (`sudo -u www-data ...`) para preservar o dono correto de caches/moodledata gerados.

## Build do AMD do plugin

```bash
sudo -u www-data bash -c "cd /var/www/moodle && HOME=/var/www npx grunt amd --root=public/local/a11y"
```

Note o `--root=public/local/a11y` (relativo ao `Gruntfile.js`, que fica na raiz do checkout, não em `public/`).

## Repositório de trabalho

- Raiz do repo: `/var/www/moodle/public/local/a11y/` (git). O plugin (`version.php`, `db/`, `classes/`, `amd/`, `templates/`, `lang/`, `styles.css`, `fonts/`, `pix/`, `tests/`) fica na raiz do repo — ver DECISIONS.md D1b para o porquê.
- `_design-reference/` — cópia fiel e somente-leitura dos arquivos importados do Claude Design (ver DECISIONS.md).
- `.eslintrc`/`.stylelintrc` na raiz do repo são cópias do `.eslintrc`/`.stylelintrc` do core do Moodle — convenção do `moodle-plugin-ci` para repositórios de plugin standalone (garante que o cascading do ESLint encontre a config de AMD `sourceType: module` mesmo rodando o plugin fora de um checkout completo).
