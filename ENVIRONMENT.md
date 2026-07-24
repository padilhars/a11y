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
- **Admin**: usuário `admin` já existente (senha não coletada por esta sessão — ver observação abaixo).
- Todos os arquivos do Moodle são propriedade de `www-data:www-data` com permissões `750`; o usuário do shell (`padilha`) tem sudo NOPASSWD total (`(ALL) NOPASSWD: ALL`), usado para leitura/gravação nesse diretório.

> **Observação de segurança**: nunca imprima o conteúdo de `config.php` (contém `$CFG->dbpass`) em logs versionados. Ele já está fora do repositório do plugin.

## O que esta sessão instalou/adicionou

- `nodejs` 22.22.1 + `npm` 9.2.0 via `apt-get install nodejs npm` (necessário para `grunt amd`, ausente no host).
- Repositório do plugin em `/var/www/local_a11y-project/` (git, ver `DECISIONS.md` sobre a estrutura).
- Symlink `/var/www/moodle/public/local/a11y` → `/var/www/local_a11y-project/local/a11y` (ver DECISIONS.md).
- Curso de teste "Acessibilidade Web" com seções/atividades para validação visual (criado via CLI generators — ver seção abaixo).

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
cd /var/www/moodle
npm install --no-save grunt-cli   # se necessário, ver PLAN.md
npx grunt amd --root=local/a11y
```

## Repositório de trabalho

- Raiz do repo: `/var/www/local_a11y-project/` (git init nesta sessão).
- `local/a11y/` dentro do repo é o código-fonte real do plugin, symlinkado para dentro da instalação Moodle (`public/local/a11y`), para não versionar o core do Moodle.
- `_design-reference/` — cópia fiel e somente-leitura dos arquivos importados do Claude Design (ver DECISIONS.md).
