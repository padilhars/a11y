# PUBLISHING.md — Checklist para submissão no Moodle Plugins Directory e registro no AMOS

Este documento cobre só a parte que **depende de ação humana** (login real, submissão em formulários, push para um repositório público). A parte técnica automatizável (lint, testes, licença, cabeçalhos, `version.php`) já foi executada e está registrada em `DECISIONS.md` (D59) e no `CHANGELOG.md`.

**Aviso de precisão**: os passos abaixo descrevem o processo do jeito que ele é publicamente documentado e amplamente conhecido pela comunidade Moodle no momento em que este arquivo foi escrito. Telas de formulário, nomes de campo e detalhes de fluxo do site moodle.org mudam com o tempo e não foram verificados ao vivo (não tenho uma conta de desenvolvedor Moodle para testar o fluxo de submissão de verdade). Onde a certeza é menor, isso está marcado explicitamente como "confirmar antes de agir" em vez de descrito como fato.

## 1. Pré-requisitos que já estão prontos

- [x] `LICENSE` (texto completo da GPL v3, copiado da própria cópia do Moodle core neste servidor) na raiz do plugin.
- [x] `README.md` e `CHANGELOG.md` presentes e atualizados.
- [x] Cabeçalho GPL (`This file is part of Moodle...`) em 100% dos arquivos `.php`, `.mustache` e agora também `styles.css`.
- [x] `version.php` com `component`, `version`, `release`, `requires`, `supported` (`[502, 502]` - restrito de `[500, 502]` depois que o CI provou, contra a branch real, que o core do Moodle 5.0 nunca chega na build que `$plugin->requires` exige; ver `DECISIONS.md` D67) e `maturity` (`MATURITY_STABLE`, promovido de ALPHA por decisão explícita do autor) preenchidos.
- [x] `phplint`, `phpcpd`, `phpmd`, `phpcs` (padrão moodle), `validate`, `savepoints`, `mustache`, `grunt` (eslint/rollup/gherkinlint/stylelint) e `phpunit` rodados via `moodle-plugin-ci`; achados corrigidos onde fazia sentido, os que não deram para corrigir estão documentados com justificativa (ver seção 5).
- [x] Teste PHPUnit novo (`tests/lang_parity_test.php`) que falha se `lang/en` e `lang/pt_br` divergirem em conjunto de chaves.
- [x] Auditoria de i18n completa (strings hardcoded, paridade de chaves, concatenação, convenção de nomes) - achados corrigidos, 11 chaves órfãs removidas dos dois idiomas.

## 2. Repositório público

O Plugins Directory exige uma URL de repositório git **público** apontando para o código do plugin (não um zip enviado à mão, pelo menos não como via principal hoje).

- [ ] Confirmar que o remote `origin` (`git@github.com:padilhars/a11y.git`, já configurado localmente) é o repositório que deve ser usado, ou decidir outro.
- [ ] Garantir que o repositório no GitHub está com visibilidade **pública** (não dá para submeter um repo privado).
- [ ] `git push` do estado atual — **eu não vou fazer isso sozinho sem autorização explícita sua**, é uma ação com efeito visível externamente.
- [ ] Decidir se o histórico completo de commits deve ir junto (recomendado: sim, é parte normal de um projeto open source) ou se algo precisa ser filtrado antes (ex: nenhum segredo/credencial foi commitado até onde este processo verificou, mas vale uma checagem humana final antes do primeiro push público).
- [ ] Mover a seção `[Unreleased]` do `CHANGELOG.md` para uma seção versionada real (ex: `## [1.0.0] - AAAA-MM-DD`) batendo com o `$plugin->release` final, e criar a tag git correspondente, no momento de taguear a versão que será submetida. Considerar também se `$plugin->release` (`'0.1.0'` hoje) deveria virar `'1.0.0'` agora que a maturidade é STABLE - decisão de versionamento semântico do autor, não decidida aqui.

## 3. Decisões já tomadas nesta sessão (registradas em DECISIONS.md D59)

- **`$plugin->maturity`**: promovido para `MATURITY_STABLE`.
- **`lang/pt_br`**: mantido no repositório, editado normalmente, **até a 1ª sincronização real do AMOS** - a partir daí a edição manual do arquivo para (ver seção 6).
- **Chaves de idioma órfãs**: as 11 confirmadas sem nenhuma referência em código foram removidas dos dois arquivos de idioma (`a11y:configure`, `panelname`, `fabclose`, `on`, `off`, `cat_profiles`, `vk_typinginto`, `vc_hint`, `error_invalidsettings`, `error_invalidkey`, `error_invalidvalue`).

## 4. Conta e submissão

- [ ] Ter (ou criar) uma conta em `https://moodle.org` — é a mesma conta usada tanto para o Plugins Directory quanto para o AMOS.
- [ ] Submissão do plugin em `https://moodle.org/plugins` (fluxo tipicamente: login → "Register a new plugin" ou equivalente → preencher nome, `component` (`local_a11y`), categoria, descrição curta/longa → apontar para a URL do repositório git público → indicar a tag/versão correspondente à release). **Confirmar o fluxo exato na tela real antes de submeter** — não tenho certeza de quais campos existem hoje, nem se o site pede uma tag git específica, um branch, ou um zip além do repositório.
- [ ] Cada versão nova submetida depois da primeira tipicamente precisa de uma tag git correspondente no repositório, alinhada com `$plugin->version`/`$plugin->release` — confirmar se isso é obrigatório ou só recomendado no processo atual.
- [ ] Revisão humana pela equipe/comunidade do Plugins Directory depois da submissão — pode pedir ajustes; prazo variável (não é instantâneo).

## 5. Achados do moodle-plugin-ci que NÃO foram corrigidos, com justificativa

Tudo que dava para corrigir com segurança foi corrigido nesta sessão (ver `CHANGELOG.md`/`DECISIONS.md` D59 para o detalhe completo). O que sobrou, documentado no código e resumido aqui:

- **`styles.css` — 129 usos de `!important` (`declaration-no-important`, stylelint)**: deliberados e estruturalmente necessários — este plugin existe para sobrepor estilos do Moodle core/tema a partir de fora dele, em qualquer tema, e o CSS compilado do Moodle core hardcoda cor/fundo em várias regiões estruturais (`#region-main`, `.main-inner`, `.moremenu`, ...) com especificidade que só `!important` consegue vencer (ver `DECISIONS.md` D14, a investigação original que estabeleceu isso). Removê-los pararia silenciosamente a maioria dos efeitos do próprio plugin (contraste, filtros de daltonismo, ocultar imagens, modo foco, ...) — não é frescura de estilo, é regressão funcional. Documentado no próprio cabeçalho de `styles.css`.
- **`lang/en/local_a11y.php` / `lang/pt_br/local_a11y.php` — 216 avisos de `moodle.Files.LangFilesOrdering.*`**: as chaves de cada arquivo são organizadas por seção temática (com comentários de cabeçalho), não em ordem alfabética estrita — decisão deliberada de legibilidade para os dois autores humanos que mantêm o arquivo, já registrada como desvio aceito antes desta sessão. É aviso, não erro (nunca bloqueou nada sozinho). O AMOS em si não se importa com a ordem física das chaves no arquivo, só com o conjunto chave→valor.
- **`templates/fab.mustache` — 1 aviso de `aria-controls` (mustache lint)**: `aria-controls="local-a11y-panel"` aponta para um elemento definido em `templates/panel.mustache`, um template *separado* — o linter testa cada template isoladamente, então nunca vê os dois juntos. Na página real os dois são filhos diretos de `<body>` (`amd/src/main.js`), a referência é válida ali. Falso positivo estrutural do jeito como o lint funciona, documentado no próprio template.
- **`phpdoc` (comando `moodle-plugin-ci phpdoc`)**: falhou com uma `coding_exception` interna do próprio `local_moodlecheck` (ferramenta que o `moodle-plugin-ci` instala temporariamente para essa checagem) — "Invalid component specified in renderer request", ao tentar obter um *renderer* do Moodle. Não é um erro no código deste plugin; parece uma incompatibilidade entre essa ferramenta (possivelmente desatualizada) e este Moodle 5.2. Não investiguei a fundo por não ser código deste plugin — reportado aqui em vez de escondido.
- **Behat — 1 dos 4 cenários (`vlibras_integration.feature`, cenário "With local_vlibras installed...") falhou**: o site de teste do Behat (`/var/behatdata`, banco isolado) não tem o `local_vlibras` de fato *instalado* no seu próprio banco (mesmo com os arquivos do plugin presentes no disco, compartilhados com a instalação de produção) — então `local_a11y\integration\vlibras::is_available()` retorna falso ali e a opção "Libras (VLibras)" nunca aparece no painel durante o teste, exatamente como o comentário do próprio `.feature` já previa desde D54 ("On a site without it... should be skipped, not treated as a failure"). Não é uma regressão de código — a mesma funcionalidade foi verificada extensivamente ao vivo contra o site de produção real (Puppeteer, D54-D58). Os outros 3 cenários (as duas do `local_a11y.feature` + o cenário "Without local_vlibras installed" do próprio `vlibras_integration.feature`) passaram. Não persegui deixar o `local_vlibras` instalado no banco de testes do Behat por já ter passado tempo considerável tentando (reinicialização do Selenium, chromedriver, `admin/cli/upgrade.php` contra o contexto errado) sem confirmar a causa exata — fica como próximo passo se quiser 4/4 rodando.

## 6. Depois da aprovação no Plugins Directory

- [ ] Confirmar na documentação atual do AMOS (`https://lang.moodle.org`, `https://moodledev.io/general/community/translation`) se o registro do component `local_a11y` lá é automático após a aprovação no Plugins Directory ou se exige um passo/pedido separado — não tenho certeza suficiente para afirmar qual dos dois é o caso hoje.
- [ ] Assim que o registro/1ª sincronização do AMOS acontecer de fato, executar a decisão já tomada para `lang/pt_br` (seção 3): a partir desse ponto, `lang/pt_br/local_a11y.php` deixa de ser editado à mão no repositório - as traduções aprovadas no AMOS passam a ser trazidas de volta periodicamente (mecanismo exato — export manual vs. importação automática — a confirmar na documentação do AMOS antes da primeira sincronização).
- [ ] `lang/en/local_a11y.php` continua sendo a fonte canônica no repositório mesmo depois do AMOS entrar em cena — é o arquivo que o AMOS usa como base para oferecer chaves à tradução.
