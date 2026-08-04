# local_a11y — Documentação Completa

Documentação gerada a partir do código-fonte e dos comentários (PHPDoc, JSDoc, KSS e comentários Mustache) do plugin de acessibilidade **local_a11y** para Moodle.

- **Autor:** Rodrigo Padilha Silveira <padilhars@gmail.com>
- **Copyright:** Universidade Federal de Pelotas - UFPel
- **Package:** Moodle / Plugin a11y
- **Versão:** 0.1.0

## Índice

| Documentação | Gerador | Cobre |
|---|---|---|
| [API PHP](api-php/index.html) | phpDocumentor 3 | `classes/`, `lib.php`, `settings.php`, `version.php`, `db/`, `lang/` — todas as classes, métodos, `@param`/`@return`/`@throws` |
| [API JavaScript](api-js/index.html) | JSDoc 4 | `amd/src/*.js` — todos os módulos AMD e suas funções (exportadas e internas) |
| [Style Guide (CSS)](styleguide/index.html) | KSS-node | `styles.css` — 30 seções: design tokens, componentes do FAB/painel, efeitos de página (`body.a11y-*`), contraste e filtros de cor |
| [Templates Mustache](templates.md) | Referência manual | `templates/*.mustache` — as 5 templates e suas variáveis de contexto |

## Como regenerar

```bash
# API PHP (requer phpDocumentor.phar)
php phpDocumentor.phar -d classes -d lib.php -d settings.php -d version.php -d db -d lang \
    -t docs/api-php --title "local_a11y - API PHP" --defaultpackagename "Plugin a11y" --ignore "*/tests/*"

# API JavaScript (requer o pacote npm "jsdoc")
npx jsdoc amd/src -d docs/api-js --package <package.json com name "local_a11y">

# Style Guide CSS (requer o pacote npm "kss")
npx kss --source . --destination docs/styleguide --css ../styles.css --title "local_a11y - Style Guide"
```

Nenhuma dessas ferramentas faz parte da execução normal do plugin no Moodle — são só para gerar esta documentação sob demanda; não são dependências de runtime.
