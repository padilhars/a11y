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
- **Admin**: usuário `admin` já existente. Senha original desconhecida (pré-existente); resetada via `admin/cli/reset_password.php --username=admin --password='...' --ignore-password-policy` para permitir login automatizado (Playwright) durante o desenvolvimento/verificação visual. **Rotacionada** na auditoria de segurança (ver DECISIONS.md D15) porque a senha anterior (`A11yDev2026!`) ficou publicamente acessível via HTTP por este mesmo `ENVIRONMENT.md` antes da correção do vhost Apache — nova senha: `A11yUxDxQ0nfJFyIwE!Xk9`. Este arquivo já está bloqueado (`403`) no vhost de produção/behat desde D15, mas segue sendo tratado como sensível: não versionar credenciais aqui além do necessário para reprodutibilidade local do ambiente de desenvolvimento.
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

## Ambiente de testes (PHPUnit / Behat / axe)

Nada disso vinha configurado; adicionado nesta sessão para rodar M7:

- `php composer.phar install --ignore-platform-reqs` na raiz do Moodle (o `composer.lock` do core ainda não declara suporte ao PHP 8.5 deste host para `ezyang/htmlpurifier`/`openspout/openspout`; `--ignore-platform-reqs` ignora só a checagem de versão, não muda os pacotes instalados). Persistido via `composer config platform.php 8.4.99` no `composer.json` do core para que chamadas subsequentes (`init.php` do PHPUnit/Behat) também não travem.
- `default-jre-headless` (Java, via apt) — necessário só se for rodar o Selenium standalone para Behat com JS (ver observação abaixo).
- `locale-gen en_AU.UTF-8` — o `admin/tool/phpunit/cli/init.php` exige esse locale instalado.
- `config.php`: adicionadas `$CFG->phpunit_prefix = 'phpu_'`, `$CFG->phpunit_dataroot = '/var/moodledata_phpunit'`, `$CFG->behat_prefix = 'behat_'`, `$CFG->behat_wwwroot = 'http://192.168.8.108:8080'`, `$CFG->behat_dataroot = '/var/behatdata'` (mesmo banco Postgres, prefixos de tabela diferentes — padrão do Moodle). Backup do arquivo original em `config.php.bak`.
- Segundo vhost Apache `/etc/apache2/sites-available/moodle-behat.conf`, `Listen 8080`, mesmo `DocumentRoot`, necessário porque o Behat precisa de um `wwwroot` próprio isolado do site de desenvolvimento.
- Inicialização (uma vez):
  ```bash
  sudo -u www-data php /var/www/moodle/public/admin/tool/phpunit/cli/init.php --disable-composer
  sudo -u www-data php /var/www/moodle/public/admin/tool/behat/cli/init.php --disable-composer
  ```
- Rodar os testes PHPUnit do plugin:
  ```bash
  cd /var/www/moodle && sudo -u www-data vendor/bin/phpunit --configuration public/local/a11y/phpunit.xml
  ```

**Behat**: o ambiente foi inicializado com sucesso (inclusive build de CSS dos temas Boost e Classic, usado para a matriz de tema do M7), mas os cenários `@javascript` do Behat usam o protocolo WebDriver clássico via Selenium (`wd_host: http://localhost:4444/wd/hub` em `behat.yml`), e este host não tinha nem Selenium nem um `chromedriver` compatível com a versão do Chromium instalada. Foi feita uma tentativa (Java instalado, `npm i chromedriver` baixou a versão 151.x contra um Chromium 149.x do Playwright — descasamento de major version, mais um problema de permissão do cache do Playwright para o usuário `www-data`) e abandonada por custo/benefício: `tests/behat/local_a11y.feature` foi escrito e usa apenas *steps* genéricos documentados do `behat_general.php` (`should exist`/`should not exist`/`should be visible`/`I click on`/`I should see ... in the ...`), mas **não foi executado**. Os mesmos cenários (mudar Tamanho do Texto e recarregar, aplicar/desfazer o perfil Dislexia) foram verificados de ponta a ponta com Playwright real contra o site rodando — ver `_verification/m3/` e `_verification/m4/`.
- Para completar a execução do Behat no futuro: instalar Selenium standalone (`selenium-server-<versão>.jar`, requer Java — já instalado) + um `chromedriver` com major version igual ao Chrome/Chromium efetivamente usado, subir `java -jar selenium-server.jar standalone` e então `vendor/bin/behat --config /var/behatdata/behatrun/behat/behat.yml --tags @local_a11y`.

**axe-core**: em vez de depender da integração automática do Behat (`--axe`, habilitada por padrão em `admin/tool/behat/cli/init.php` mas presa ao mesmo bloqueio de WebDriver acima), rodei o axe-core diretamente via Playwright (`npm i axe-core`, injetado com `page.addScriptTag` + `window.axe.run()`) contra o site real logado, com o painel aberto e todas as categorias expandidas. Script e resultado em `_verification/m7/`.

## Build do AMD do plugin

```bash
sudo -u www-data bash -c "cd /var/www/moodle && HOME=/var/www npx grunt amd --root=public/local/a11y"
```

Note o `--root=public/local/a11y` (relativo ao `Gruntfile.js`, que fica na raiz do checkout, não em `public/`).

## Repositório de trabalho

- Raiz do repo: `/var/www/moodle/public/local/a11y/` (git). O plugin (`version.php`, `db/`, `classes/`, `amd/`, `templates/`, `lang/`, `styles.css`, `fonts/`, `pix/`, `tests/`) fica na raiz do repo — ver DECISIONS.md D1b para o porquê.
- `_design-reference/` — cópia fiel e somente-leitura dos arquivos importados do Claude Design (ver DECISIONS.md).
- `.eslintrc`/`.stylelintrc` na raiz do repo são cópias do `.eslintrc`/`.stylelintrc` do core do Moodle — convenção do `moodle-plugin-ci` para repositórios de plugin standalone (garante que o cascading do ESLint encontre a config de AMD `sourceType: module` mesmo rodando o plugin fora de um checkout completo).
