# Contribuindo com `local_a11y`

## Fluxo de trabalho

O histórico atual deste projeto é majoritariamente commits diretos na branch `master`, sem
pull request. Para qualquer contribuição externa, o fluxo esperado é:

1. Abra uma issue descrevendo o problema/proposta antes de escrever código, exceto para
   correções triviais.
2. Crie um branch a partir de `master` (`feat/...`, `fix/...`, `docs/...`).
3. Abra um Pull Request para `master`. O CI (`.github/workflows/ci.yml`) precisa passar antes
   do merge.
4. Pelo menos uma pessoa diferente do autor deve revisar o PR antes do merge, sempre que houver
   uma segunda pessoa disponível para revisar.

## Estilo de código e commits

- PHP segue o padrão `moodle-cs` (`moodle-plugin-ci codechecker`); JS/CSS seguem o `grunt`
  padrão do Moodle (`eslint`/`stylelint`, já configurados em `.eslintrc`/`.stylelintrc`).
- Mensagens de commit seguem [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat(local_a11y): ...`, `fix(local_a11y): ...`, `docs(local_a11y): ...` etc.), já a prática
  predominante no histórico deste repositório.
- Toda mudança de comportamento (não só refatoração) deve ter uma entrada correspondente em
  `CHANGELOG.md`, na seção `[Unreleased]`.

## Testes

Antes de abrir um PR, rode localmente o que for aplicável à mudança:

- `moodle-plugin-ci phplint`, `codechecker`, `phpmd`, `phpcpd`, `validate`, `savepoints`,
  `mustache` para mudanças em PHP/templates.
- `moodle-plugin-ci grunt` para mudanças em JS/CSS (também gera os artefatos `amd/build/*.min.js`
  - nunca edite esses arquivos `.min.js` diretamente).
- `moodle-plugin-ci phpunit` e `moodle-plugin-ci behat` para mudanças que afetem comportamento
  em tempo de execução.

O CI roda essa mesma suíte automaticamente em cada push/PR contra uma matriz de Moodle 5.2 ×
PHP 8.3/8.4 × PostgreSQL/MariaDB (Moodle 5.0 e PHP 8.2 foram removidos da matriz depois que o
próprio CI provou que o core do Moodle 5.2 já exige PHP >=8.3 e que o core 5.0 nunca atinge a
build mínima que este plugin requer - ver `.github/workflows/ci.yml`).

## Disciplina de versão e release

Este projeto teve, na prática, um problema real de dessincronia: `$plugin->release` ficou
travado em `0.1.0` por mais de 5 semanas enquanto dezenas de mudanças (incluindo novas opções
de acessibilidade) se acumulavam sob `## [Unreleased]` no `CHANGELOG.md`, sem nunca virar uma
seção de versão nova. Isso já causou pelo menos uma contagem de opções desatualizada em
documentação (achado de uma auditoria técnica interna, não publicada).

Para prevenir que isso se repita:

- **Não deixe `[Unreleased]` crescer indefinidamente.** Ao final de qualquer lote de mudanças
  que represente um marco (nova opção de acessibilidade, correção de segurança, mudança de
  comportamento visível ao usuário final), avalie explicitamente se é hora de:
  1. Mover o conteúdo de `[Unreleased]` para uma nova seção `## [x.y.z] - AAAA-MM-DD`;
  2. Atualizar `$plugin->release` em `version.php` para o mesmo número;
  3. Criar uma tag git correspondente (`git tag vX.Y.Z`).
- **Qualquer número afirmado em texto solto (README, strings do painel) que dependa da
  contagem de opções deve ser conferido contra `classes/options.php` antes do commit** -
  idealmente automatizado por um teste que compare a contagem real
  (`count(\local_a11y\options::all())` ou equivalente) contra o número hardcoded, falhando o
  CI se divergirem, em vez de depender de alguém lembrar de atualizar os dois lugares
  manualmente.
- A decisão de *quando* cortar cada versão (e se/quando publicar `1.0.0`) continua sendo uma
  decisão humana, não automática - ver `docs/PUBLISHING.md`.

## Segurança

Não abra uma issue pública para relatar uma vulnerabilidade - ver `SECURITY.md`.
