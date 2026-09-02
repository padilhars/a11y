## O que este PR muda

<!-- Descreva a mudança e por quê. -->

## Como testar

<!-- Passos manuais, se aplicável. -->

## Checklist

- [ ] `CHANGELOG.md` atualizado (seção `[Unreleased]`), se a mudança for visível ao usuário final.
- [ ] `moodle-plugin-ci codechecker`/`phplint` limpos (PHP).
- [ ] `moodle-plugin-ci grunt` limpo (JS/CSS), artefatos `amd/build/*.min.js` regenerados e
      incluídos no commit, se aplicável.
- [ ] `moodle-plugin-ci phpunit`/`behat` passam para as áreas afetadas.
- [ ] Se esta mudança adiciona/remove uma opção de acessibilidade: a contagem em `README.md`
      e nas strings do painel (`lang/*/local_a11y.php`) foi conferida contra
      `classes/options.php`.
- [ ] Esta mudança não introduz nenhuma nova dependência externa sem revisão de licença
      (ver `thirdpartylibs.xml`).
