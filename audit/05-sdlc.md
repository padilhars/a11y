# Auditoria de Ciclo de Vida de Desenvolvimento (SDLC) e Gestão de Projeto — `local_a11y`

**Escopo e método:** evidência do repositório git (`git --git-dir=/tmp/a11y-local.git --work-tree=.../local/a11y`, 80 commits, branch única `master`), dos arquivos de processo do próprio plugin (`CLAUDE.md`, `DECISIONS.md`, `docs/PUBLISHING.md`, `.gitignore`), e — porque um achado grave apareceu no meio do levantamento e não podia esperar o relatório — uma verificação ao vivo contra o site de produção (`mdl.snifrbid.com.br`) e a correção desse achado específico, autorizada explicitamente pelo usuário. Esta é a única exceção à regra 5 desta auditoria (não corrigir nada) e está marcada como tal onde acontece.

**Legenda:** 🟢 FATO · 🟡 INTERPRETAÇÃO · 🔴 HIPÓTESE

---

## 0. Incidente encontrado durante a auditoria, e corrigido (exceção autorizada à regra 5)

🟢 **FATO** — `ENVIRONMENT.md:14` (arquivo interno do plugin, listado em `.gitignore` — nunca foi commitado no git, confirmado lendo `.gitignore` diretamente) contém, em texto plano, a senha atual do usuário `admin` do Moodle (rotacionada após um vazamento anterior registrado no próprio arquivo como corrigido por D15).

🟢 **FATO, verificado ao vivo nesta sessão** — Antes de qualquer correção, `curl -k https://mdl.snifrbid.com.br/local/a11y/ENVIRONMENT.md` e `curl http://mdl.snifrbid.com.br:8080/local/a11y/ENVIRONMENT.md` retornavam **HTTP 200**, servindo o arquivo completo, incluindo a senha em texto plano, sem nenhuma autenticação — no site de produção real. A afirmação do próprio arquivo ("bloqueado 403 desde D15") estava desatualizada/incorreta: `sudo nginx -T` confirmou que os dois vhosts (`/etc/nginx/conf.d/moodle.conf` e `moodle-behat.conf`) só bloqueavam `\.git|composer\.json|composer\.lock|package\.json` — nenhuma regra cobria `ENVIRONMENT.md`, `CLAUDE.md`, `DECISIONS.md`, `PLAN.md` ou `PROGRESS.md`.

**Ação tomada, autorizada explicitamente pelo usuário** (backup dos dois arquivos de config feito antes): adicionada uma regra `deny all; return 404;` para os 5 arquivos internos nos dois vhosts, `nginx -t` validado, `systemctl reload nginx` aplicado. Reverificado ao vivo depois: os 5 arquivos retornam 404 nas duas portas (443 e 8080); a página inicial do site continua respondendo 200 normalmente (sem regressão).

🟡 **INTERPRETAÇÃO** — Como o arquivo nunca foi commitado no git (confirmado), a senha não está exposta no histórico do repositório público no GitHub — o vetor de exposição era especificamente a combinação "arquivo sensível no diretório do plugin" + "esse diretório é servido publicamente pelo webroot do Moodle sem exclusão". 🔴 **NÃO VERIFICADO — motivo:** não determinei por quanto tempo essa exposição esteve ativa (o texto do próprio arquivo sugere que HOUVE um bloqueio funcionando em algum momento passado, via D15, que se perdeu numa reconfiguração posterior do vhost - não investiguei exatamente quando isso aconteceu nem se algum acesso de terceiro de fato ocorreu nesse intervalo, o que exigiria analisar `access.log`, fora do escopo desta auditoria de SDLC).

**Achado secundário, mesma varredura, não corrigido (menor severidade)**: 🟢 **FATO** — `https://mdl.snifrbid.com.br/local/a11y/phpunit.xml` também responde HTTP 200, servindo o arquivo de configuração real do PHPUnit (confirmado pelo `Content-Type: text/xml` e conteúdo real, distinto do fallback HTML genérico do Moodle que outros caminhos inexistentes retornam). Verifiquei o conteúdo local do arquivo (`grep -i "password\|secret\|token"`) e não encontrei nenhuma credencial nele — é exposição de configuração de teste, não de segredo. Severidade **Baixa** (revela convenção interna de teste, não um segredo explorável) — não corrigido nesta sessão, por não ser uma emergência como o caso acima; fica registrado como achado priorizável.

---

## 1. Histórico e rastreabilidade

🟢 **FATO** — `git log`: **80 commits**, todos na branch `master` (`git branch -a` só lista `master`/`remotes/origin/master`), **0 merge commits** (`git log --merges` vazio), **0 tags** (`git tag -l` vazio). Todo commit foi um push direto à branch principal - não há, nunca houve, PR neste repositório.

🟢 **FATO** — Datas dos commits concentradas em **13 dias corridos** entre 2026-07-24 e 2026-09-02 (~5.5 semanas de calendário), com dois picos: 20 commits em 24/07 (dia de início) e 19 commits em 05/08 - um padrão de "rajadas" intensas intercaladas por semanas sem nenhum commit, não um ritmo incremental constante.

🟢 **FATO** — `git log --format="%ae"` (autor): **100% dos 80 commits sob um único endereço de e-mail (`padilhars@gmail.com`)**, mesmo os que aparecem como "Claude (autonomous)" no nome de autor - é o mesmo e-mail, não uma segunda identidade real. **Jerônimo Medina Madruga** (segundo autor creditado nos cabeçalhos `@author` de todo arquivo `.php`/`.js`, no README, e no copyright) **nunca aparece como autor ou committer de nenhum commit** - só é mencionado no corpo de texto de um commit (`chore(local_a11y): add second author, relocate screenshots`) que o adicionou aos créditos, não como um co-autor real do histórico git.

🟡 **INTERPRETAÇÃO** — Mensagens de commit seguem majoritariamente Conventional Commits (`feat/fix/docs/style/test/chore/refactor/revert(local_a11y): ...`), com boa qualidade descritiva. Exceção: **3 commits com a mensagem genérica "Update README.md"**, sem prefixo/escopo - padrão típico de edição feita direto pela interface web do GitHub (reforçado pelo committer desses commits específicos aparecer como `GitHub <noreply@github.com>` em vez do padrão local `Claude (autonomous)`/`Rodrigo Padilha`), ou seja, **mudanças feitas fora do fluxo de desenvolvimento local (sem passar por build/lint/teste antes de ir para o branch principal)**.

🟢 **FATO** — Alguns commits referenciam uma decisão específica por número (`(D53)`, `(D28)`) que remete a `DECISIONS.md`, mas isso não é sistemático: a maioria das 80 mensagens de commit não cita nenhum D-número, mesmo quando `DECISIONS.md` tem 64 entradas registradas - a ligação entre "qual decisão gerou qual commit" é majoritariamente implícita (por proximidade temporal), não uma referência explícita e pesquisável.

🟢 **FATO** — **Zero referência a issue do GitHub** em qualquer mensagem de commit (busca por `#[0-9]`, `closes`, `fixes #`, `issue` no histórico completo não encontrou nenhuma ocorrência real de rastreamento de issue - as poucas ocorrências de "#" e "issue" encontradas são sobre outra coisa, ex. "10 issues reported after live QA testing" descrevendo bugs informalmente, não linkando a um issue tracker). **Não há issue tracker em uso** - nenhuma mudança é rastreável a um ticket externo, só ao próprio `DECISIONS.md`.

🟢 **FATO** — Existe exatamente **1 ADR formal** (`docs/adr/0001-download-de-audio-offline.md`), bem estruturado (Status/Contexto/Recomendação), mas descreve um *spike* técnico não implementado ("Em investigação... nenhuma decisão tomada"), não uma decisão de arquitetura já tomada. **`DECISIONS.md` (64 entradas, um log corrido, não arquivos individuais por decisão) é a prática real e primária de registro de decisões deste projeto** - o processo formal de ADR existe em princípio, mas só foi usado uma vez, para um caso que nem chegou a virar decisão.

---

## 2. Versionamento e release

🟢 **FATO** — `version.php` atual: `$plugin->version = 2026082903`, `$plugin->requires = 2025041500`, `$plugin->supported = [500, 502]`, `$plugin->maturity = MATURITY_STABLE`, `$plugin->release = '0.1.0'`.

🟡 **INTERPRETAÇÃO** — `$plugin->version` (o número interno que controla `db/upgrade.php`) foi incrementado corretamente ao longo do projeto - confirmado por `db/upgrade.php` ter 2 blocos de savepoint reais e coerentes com esse número (já auditado em `audit/03-qualidade-desempenho.md`). Mas `$plugin->release` (o número SemVer voltado ao ser humano) **nunca mudou desde o primeiro commit** (`64e345c`, 24/07/2026) - o plugin descreve a si mesmo como "0.1.0" depois de 5.5 semanas, 80 commits e crescimento de 22 para 30 opções.

### A divergência "22 vs 24" pedida na auditoria - verificação precisa

🟢 **FATO** — `CHANGELOG.md:58` (seção `## [0.1.0] - 2026-07-24`) diz **"22 accessibility options"**. Essa data bate exatamente com os primeiros commits do dia 24/07 (`feat(local_a11y): M3 — real state, persistence and CSS effects for the 22 options`, commit `d2f855d`, mesmo dia) - **o número 22 está correto para o que essa seção descreve, um retrato histórico daquela data específica, não um erro.**

🟢 **FATO** — O README **atual** (`README.md:8,28,72,96`) diz **"29 opções"**, não 24. `classes/options.php` tem hoje **30 entradas no array**, mas a última (`signLanguage`) é condicional - só existe quando a integração com VLibras está de fato ativa (`classes/options.php:122-131`, comentário explícito) - então **29 é o número correto e atual para o caso comum** (sem VLibras integrado). **Não encontrei o número "24" em nenhum lugar do repositório atual** - nem em `README.md`, nem em nenhum arquivo de `lang/`, nem em `templates/*.mustache` (busca direta, sem resultado).

🟢 **FATO** — `CHANGELOG.md:9` (dentro da seção `[Unreleased]`, não de uma versão tagueada) já documenta, com as próprias palavras do projeto: *"Text Alignment (D30) and Face Navigation... shipped after 0.1.0 but were never logged here: 22 → 24 options."* **Isso confirma que "24" foi, de fato, um número real e correto do plugin em algum ponto intermediário da história** (entre o 22 do release 0.1.0 e o 28/29/30 atuais) - só nunca chegou a ser gravado numa seção de CHANGELOG própria, porque nenhuma nova versão jamais foi cortada.

**Conclusão sobre a divergência**: 🟡 **INTERPRETAÇÃO** — A divergência descrita no pedido da auditoria ("CHANGELOG registra 22, README/painel/idioma registram 24") **foi real em algum momento passado da história deste projeto**, e a evidência (`CHANGELOG.md:9`) mostra que o próprio projeto já tinha identificado e catalogado retroativamente esse gap antes desta auditoria. **No estado atual do repositório, ela não existe mais como "22 vs 24"** - existe como "29 (correto, atual) vs uma seção `[0.1.0]` do CHANGELOG congelada em 22 (correta para sua própria data, mas nunca sucedida por uma segunda versão tagueada)". A causa raiz continua presente e não corrigida: **não existe processo que force um corte de versão quando uma opção é adicionada** - o `[Unreleased]` do CHANGELOG cresceu por 5.5 semanas sem nunca virar uma nova seção versionada, e cada lugar que menciona a contagem (README, esta seção do CHANGELOG) é texto solto, mantido manualmente, sem nenhuma fonte única de verdade computada.

**Processo que preveniria isso (proposto, não implementado - regra 5):** um teste (PHPUnit já roda em CI-nenhum, mas poderia) que compare `count(\local_a11y\options::all())` (ou uma constante equivalente) contra um número hardcoded no teste, forçando quem adiciona uma opção a tocar o teste também; e adicionar a contagem ao README via um placeholder gerado, não um número solto digitado à mão. Mais fundamental: adotar a disciplina de, a cada lote de mudanças que hoje viraria uma entrada em `[Unreleased]`, decidir explicitamente se isso já é `$plugin->release` bump + nova seção versionada de CHANGELOG + tag git, em vez de deixar o `[Unreleased]` crescer indefinidamente.

🟢 **FATO** — Nenhuma tag git existe (`git tag -l` vazio) - mesmo o único release nominal ("0.1.0") nunca foi tagueado. **Não há como, hoje, fazer checkout do estado exato de nenhuma versão "lançada"** do plugin - só do HEAD atual de `master`.

🟢 **FATO** — `db/upgrade.php` tem 2 blocos `if ($oldversion < ...)` com savepoints (`upgrade_plugin_savepoint`), já confirmado estruturalmente correto (ordem, correspondência) pelo comando `moodle-plugin-ci savepoints`, que passou limpo (`audit/03-qualidade-desempenho.md`). 🟡 **INTERPRETAÇÃO** — "testado" aqui significa que o `admin/cli/upgrade.php` real já rodou contra este site de produção pelo menos uma vez desde a criação de cada savepoint (confirmado indiretamente: o site está em uso real com a tabela `local_a11y_stats` existindo, o que só acontece se o upgrade rodou) - mas não é um teste de upgrade *automatizado* que rode a cada mudança, é rodado manualmente quando alguém lembra.

---

## 3. Automação

🟢 **FATO** — `.github/` contém **só imagens** (`.github/screenshots/`, usadas pelo README) - não existe `.github/workflows/`, `.github/dependabot.yml`, `.github/ISSUE_TEMPLATE/` ou `.github/PULL_REQUEST_TEMPLATE.md`. **Não há CI configurado.**

🟢 **FATO** — Todas as verificações de qualidade já feitas neste projeto (`phpcs`, `phpmd`, `phpcpd`, `phpunit`, `eslint`, `stylelint`, `behat`, `mustache`, `savepoints`) foram rodadas **manualmente, por sessões de trabalho pontuais** (confirmado em `DECISIONS.md` D59 e nas 3 sessões desta própria auditoria) - nenhuma delas roda automaticamente a cada push. **Os testes dependem inteiramente de alguém lembrar de rodá-los.**

Este é o achado de maior risco desta seção, conforme pedido: **anexo abaixo um workflow mínimo de GitHub Actions** (não instalado, não commitado - só escrito como anexo do relatório, seguindo a regra 5).

---

## 4. Governança e risco operacional

🟢 **FATO** — Ausentes: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md` (busca direta na raiz e em `.github/`, nenhum existe). **Não há canal declarado para reportar uma vulnerabilidade de segurança** neste plugin - alguém que encontrasse um problema de segurança nele hoje não teria onde reportar de forma responsável além de abrir uma issue pública no GitHub (expondo o achado antes de uma correção existir).

🟢 **FATO — bus factor**: confirmado na seção 1, git-level bus factor = **1** (100% dos commits sob um único e-mail), apesar da documentação (README, cabeçalhos de arquivo) creditar dois autores. 🟡 **INTERPRETAÇÃO** — mesmo assumindo que Jerônimo Medina Madruga participa ativamente do projeto por outros canais (revisão informal, decisões, testes manuais - não verificável a partir do git), **o repositório não registra essa participação de nenhuma forma rastreável** (sem commit, sem co-authored-by, sem aprovação de PR, porque não há PR). Se o mantenedor único (dono do e-mail `padilhars@gmail.com`) ficar indisponível, não há trilha de commits do segundo autor para reconstituir familiaridade com o código a partir do próprio git.

**O que precisaria estar documentado para um terceiro assumir a manutenção sem os autores atuais** (lista concreta, não genérica):
- Onde o ambiente de desenvolvimento roda de verdade (`ENVIRONMENT.md` já cobre isso bem, mas é gitignored - um terceiro sem acesso a este servidor específico não tem esse documento).
- Como reconstruir a infraestrutura de teste (Selenium/Chrome/chromedriver, `moodle-plugin-ci`) do zero - hoje só existe registrado nas conversas desta sessão e em `ENVIRONMENT.md` (também gitignored).
- Um `CONTRIBUTING.md` real, público, com o fluxo de trabalho (branch? PR? quem aprova?) - hoje esse fluxo é "commit direto no master", o que não precisa de documentação para continuar, mas também não é o que se espera de um projeto que pretende aceitar contribuição externa via Moodle Plugins Directory.
- As credenciais/acessos operacionais (quem tem acesso SSH ao servidor de produção, quem é o dono do domínio `snifrbid.com.br`, quem tem acesso à conta GitHub `padilhars`) - nada disso está documentado em lugar nenhum verificado nesta auditoria.

🟢 **FATO** — Nenhuma menção, em nenhum arquivo verificado, a plano de compatibilidade com versões futuras do Moodle além da já registrada em `version.php` (`supported = [500, 502]`, já auditado em `audit/01-licenciamento.md` como "só testado de fato contra 5.2.1, o range é declarado por inferência, não por teste real contra 5.0/5.1").

🟢 **FATO** — Nenhuma menção a ambiente de homologação/staging separado de produção, procedimento de rollback, ou responsável nomeado por incidente em produção, em nenhum arquivo verificado (`CLAUDE.md`, `ENVIRONMENT.md`, `README.md`, `docs/`). 🟡 **INTERPRETAÇÃO** — a arquitetura observada nesta e nas auditorias anteriores desta sessão (mesmo host serve produção real via HTTPS na porta 443 E o ambiente de teste Behat na porta 8080, ambos apontando para o mesmo código em disco) sugere que **não existe separação real entre "ambiente de desenvolvimento/teste" e "produção"** - mudanças de código tocam o mesmo diretório que serve usuários reais imediatamente, sem um passo de deploy distinto. O achado da seção 0 (arquivo sensível exposto publicamente) é uma consequência direta desse modelo: não há uma etapa de "isso vai para produção" separada de "isso está no disco".

🟢 **FATO — revisão de código**: consistente com a seção 1 (0 PRs, 0 merges, 1 autor real no git), **não há revisão por pares neste projeto** - o(s) autor(es) sempre commitam (e efetivamente fazem merge de) o próprio trabalho diretamente na branch principal.

### Checklist de publicação no Moodle Plugins Directory

🟢 **FATO**, direto de `docs/PUBLISHING.md` (documento já existente no projeto, escrito numa sessão anterior a esta auditoria):

**Já pronto** (seção 1 do documento, marcado `[x]`): `LICENSE`, `README.md`/`CHANGELOG.md` presentes, cabeçalho GPL em 100% dos arquivos, `version.php` preenchido, suíte `moodle-plugin-ci` completa já rodada pelo menos uma vez, teste de paridade de idioma, auditoria de i18n.

**Ainda pendente** (seção 2-4 do mesmo documento, marcado `[ ]`, não decidido por esta auditoria): confirmar que o remote GitHub deve ser usado como está; garantir visibilidade pública do repositório; fazer o primeiro `git push` público (o documento já registra explicitamente "não vou fazer isso sozinho sem autorização" - decisão do usuário, não técnica); mover `[Unreleased]` para uma seção versionada real e criar a tag correspondente; decidir se `$plugin->release` vira `'1.0.0'` agora que `maturity` é STABLE; criar conta em moodle.org; submeter de fato.

---

## Anexo — workflow mínimo de CI (não instalado, não commitado nesta sessão)

Escrito apenas como anexo desta auditoria, por instrução explícita da regra 5. Cobre a matriz mínima recomendada pela própria documentação do `moodle-plugin-ci` para este estágio do plugin: Moodle 5.0/5.2 (as duas versões já declaradas em `version.php:$plugin->supported`) × PHP 8.2/8.3/8.4, contra PostgreSQL (o SGBD real deste ambiente, confirmado nas auditorias anteriores) e MariaDB (cobertura padrão recomendada para quem publica no Plugins Directory, usado por terceiros com bancos variados).

```yaml
# .github/workflows/ci.yml
# ANEXO da auditoria audit/05-sdlc.md — não instalado nem commitado nesta sessão.
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-22.04

    strategy:
      fail-fast: false
      matrix:
        php: ['8.2', '8.3', '8.4']
        moodle-branch: ['MOODLE_500_STABLE', 'MOODLE_502_STABLE']
        database: ['pgsql', 'mariadb']

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: 'postgres'
          POSTGRES_HOST_AUTH_METHOD: 'trust'
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
      mariadb:
        image: mariadb:10.11
        env:
          MYSQL_USER: 'root'
          MYSQL_ALLOW_EMPTY_PASSWORD: 'true'
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
      - name: Checkout do plugin
        uses: actions/checkout@v4
        with:
          path: plugin

      - name: PHP ${{ matrix.php }}
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          ini-values: max_input_vars=5000
          coverage: none

      - name: Node.js (versão fixada pelo build do plugin — ver .nvmrc)
        uses: actions/setup-node@v4
        with:
          node-version-file: 'plugin/.nvmrc'

      - name: Instalar moodle-plugin-ci
        run: |
          composer create-project -n --no-dev --prefer-dist moodlehq/moodle-plugin-ci ci ^4
          echo "$(cd ci; pwd)/bin" >> $GITHUB_PATH
          echo "$(cd ci; pwd)/vendor/bin" >> $GITHUB_PATH

      - name: Instalar Moodle + plugin
        run: |
          moodle-plugin-ci install \
            --plugin ./plugin \
            --moodle-branch ${{ matrix.moodle-branch }} \
            --db-host=127.0.0.1
        env:
          DB: ${{ matrix.database }}

      - name: phplint
        run: moodle-plugin-ci phplint
      - name: phpcpd
        run: moodle-plugin-ci phpcpd
      - name: phpmd
        run: moodle-plugin-ci phpmd
      - name: codechecker (moodle-cs)
        run: moodle-plugin-ci codechecker
      - name: validate
        run: moodle-plugin-ci validate
      - name: savepoints
        run: moodle-plugin-ci savepoints
      - name: mustache
        run: moodle-plugin-ci mustache
      - name: grunt (eslint/stylelint/AMD build)
        run: moodle-plugin-ci grunt
      - name: phpunit
        run: moodle-plugin-ci phpunit
      - name: behat
        run: moodle-plugin-ci behat --profile chrome
```

**Notas sobre este anexo:**
- 🟡 **INTERPRETAÇÃO** — o job `phpdoc` (`local_moodlecheck`) foi deliberadamente **omitido** desta matriz: esta própria auditoria (seção "Erros e correções" das sessões anteriores, não reproduzida aqui) já encontrou e corrigiu um bug real no ambiente vendorizado do `moodle-plugin-ci` para esse comando específico contra Moodle 5.2 — incluí-lo aqui sem confirmar se o bug já foi corrigido rio acima (upstream, no `moodlehq/moodle-plugin-ci` publicado) faria o CI falhar por um problema de ferramental, não do plugin. Recomenda-se adicionar esse passo separadamente, já validado, numa iteração futura.
- 🔴 **NÃO VERIFICADO — motivo**: este workflow não foi executado nem localmente nem no GitHub Actions real (a regra 5 desta auditoria proíbe instalar/rodar qualquer coisa nesta fase) — é uma proposta com base na documentação oficial do `moodle-plugin-ci` e nos comandos já confirmados funcionais nesta e nas sessões anteriores desta auditoria, não uma execução comprovada.

---

## Matriz de avaliação por prática

| Prática | Situação | Risco | Esforço para corrigir |
|---|---|---|---|
| Histórico rastreável a decisão registrada | Parcial — `DECISIONS.md` existe e é rico, mas ligação commit↔decisão é majoritariamente implícita, sem issue tracker | Médio | Baixo (convenção: citar D-número na mensagem de commit sempre) |
| ADR formal | Parcial — processo existe (1 exemplo bem feito), mas não é a prática real (`DECISIONS.md` é) | Baixo | Baixo (formalizar que `DECISIONS.md` É o ADR deste projeto, documentar isso) |
| `version.php` coerente com o estágio real | Parcial — `$plugin->version` correto, `$plugin->release` congelado em 0.1.0 há 5.5 semanas | Médio | Baixo (decisão de versionamento, depois um bump) |
| CHANGELOG segue Keep a Changelog | Parcial — formato correto, mas `[Unreleased]` nunca é cortado em versões reais | Médio | Baixo/Médio (processo de disciplina de release) |
| `db/upgrade.php` com savepoints testados | Existe — savepoints corretos, testados manualmente ao vivo | Baixo | — |
| Releases tagueadas | Ausente — 0 tags git | Médio (sem tag, não há como reproduzir o estado de nenhum release específico) | Baixo (tag do estado atual, processo daqui pra frente) |
| CI (GitHub Actions) | **Ausente** | **Alto** | Médio (workflow em anexo abaixo) |
| Dependabot/renovate | Ausente | Baixo (poucas dependências de build, geridas pelo Moodle core, não pelo plugin) | Baixo |
| Testes automáticos a cada mudança | Ausente — dependem de alguém lembrar | Alto | Médio (consequência direta de ter CI) |
| `CONTRIBUTING.md` | Ausente | Baixo/Médio (mais relevante se/quando aceitar contribuição externa) | Baixo |
| `SECURITY.md` | **Ausente** | **Médio-Alto** (software distribuído publicamente, sem canal de disclosure responsável) | Baixo |
| `CODE_OF_CONDUCT.md` | Ausente | Baixo | Baixo |
| Templates de issue/PR | Ausente | Baixo | Baixo |
| Bus factor documentado/mitigado | **Ausente** — git mostra 1 autor real, não 2 | **Alto** | Médio (documentação de continuidade + trilha real de contribuição do segundo autor) |
| Plano de compatibilidade com Moodle futuro | Ausente | Médio | Baixo (declarar critério de quando testar contra versão nova) |
| Ambiente de homologação separado de produção | **Ausente** — mesmo host/diretório serve os dois | **Alto** (achado da seção 0 é consequência direta disso) | Alto (mudança de infraestrutura, não só de processo) |
| Procedimento de rollback / resposta a incidente | Ausente | Médio-Alto | Baixo/Médio (documentar processo, não precisa de infra nova) |
| Revisão por pares | Ausente — autor(es) sempre fazem merge do próprio trabalho | Médio | Depende de ter um segundo revisor real disponível |
| Checklist Plugins Directory | Parcial — pré-requisitos técnicos prontos, passos de submissão (ação humana) pendentes | Baixo (é trabalho pendente conhecido, não um risco oculto) | Baixo/Médio (ações humanas listadas em `docs/PUBLISHING.md`) |

---

## Os 3 processos cuja ausência representa maior risco institucional

1. **Ausência de ambiente de homologação separado de produção.** Não é uma prática de qualidade abstrata - já causou o achado da seção 0 desta auditoria (senha de admin exposta publicamente por um arquivo de desenvolvimento, porque "onde eu desenvolvo" e "o que serve usuários reais" são literalmente o mesmo diretório, no mesmo host). Para uma instituição pública com dados de estudantes e servidores reais passando pelo mesmo Moodle, esse é o risco mais concreto e já materializado desta lista.

2. **Ausência de CI/testes automáticos.** Toda a disciplina de qualidade que este projeto de fato tem (phpcs, phpunit, behat, auditoria de segurança/LGPD/acessibilidade) existe porque alguém rodou manualmente, em sessões dedicadas - nada garante que a próxima mudança direta no `master` (inclusive as 3 já observadas como "Update README.md" via GitHub web) passe pelos mesmos crivos. Sem isso, toda a qualidade já auditada nesta e nas 4 sessões anteriores é regredível a qualquer momento sem que ninguém perceba até o próximo ciclo manual de auditoria.

3. **Bus factor real de 1, sem `SECURITY.md`/`CONTRIBUTING.md` para um terceiro assumir.** Um projeto mantido por dois servidores públicos de uma mesma coordenação, sem trilha real de contribuição do segundo, sem canal de disclosure de vulnerabilidade, sem processo documentado de onboarding: se o único autor com histórico git real ficar indisponível, a continuidade do plugin (já em uso real em produção) depende inteiramente de conhecimento que não está no repositório.
