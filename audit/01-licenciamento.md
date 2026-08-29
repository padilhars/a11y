# Auditoria de Licenciamento e Propriedade Intelectual — `local_a11y`

**Escopo auditado:** `/var/www/moodle/html/public/local/a11y/` (verificado ao vivo neste host; o `CLAUDE.md` do próprio plugin usa o caminho sem `html/` — trata-se apenas de um segmento extra de symlink/mount neste servidor específico).

**Metodologia:** leitura direta de todos os arquivos `.php`/`.js`/`.css`/`.mustache`/`.svg`/`.md` do plugin via `grep`/`find`/leitura integral; comparação cruzada com o código-fonte do Moodle core já instalado neste mesmo host (`/var/www/moodle/html/public/{lib,mod,blocks}`) para aferir convenções reais (não presumidas); consulta a fontes externas autoritativas ao vivo nesta sessão (repositório oficial `google/fonts` no GitHub, registro npm, página de compatibilidade de licenças da Creative Commons, página do arquivo no Wikimedia Commons, documentação moodledev.io) — cada uma citada onde usada. Nenhuma alteração de código foi feita; este documento é só leitura/registro.

**Legenda:** 🟢 FATO · 🟡 INTERPRETAÇÃO · 🔴 HIPÓTESE

---

## 1. Cabeçalhos e arquivos obrigatórios

### 1.1 Bloco GPL + `defined('MOODLE_INTERNAL') || die();`

🟢 **FATO** — Todos os 28 arquivos `.php` do plugin (listados abaixo) contêm o bloco de comentário GPL padrão do Moodle ("This file is part of Moodle...") **e** o bloco docblock `@package`/`@author`/`@copyright`/`@license`/`@since`. Em 5 arquivos (`classes/external/record_activation.php`, `classes/output/panel.php`, `classes/privacy/provider.php`, `classes/integration/vlibras.php`, `tests/lang_parity_test.php`) o docblock começa mais abaixo do que nos demais (depois de um bloco de documentação técnica extenso), mas está presente e completo — confirmado lendo cada um por inteiro. Os 5 templates `.mustache` (`templates/*.mustache`) e `styles.css` também têm o bloco GPL (`styles.css:1-15`; `templates/fab.mustache:1-15` como amostra). Isso bate com o que `DECISIONS.md` (D59, linha 27) registra ter sido verificado/corrigido mecanicamente: "Cabeçalho GPL (...) em 100% dos arquivos `.php`, `.mustache` e agora também `styles.css`".

🟢 **FATO** — `defined('MOODLE_INTERNAL') || die();` está presente em apenas 7 dos 28 arquivos `.php`: `db/access.php:29`, `db/hooks.php:32`, `db/services.php:29`, `lang/en/local_a11y.php:29`, `lang/pt_br/local_a11y.php:29`, `settings.php`, `version.php:29`. Está **ausente** em `lib.php`, `db/upgrade.php`, `admin/stats.php`, nos 14 arquivos de `classes/**/*.php` e nos 4 arquivos de `tests/*.php`.

🟡 **INTERPRETAÇÃO** — Isso não é, na prática, uma violação de padrão: `DECISIONS.md` D59 (linha 27) registra que o `phpcs` (padrão Moodle) apontou o check como **"desnecessário"** em `lib.php`/`db/upgrade.php` e ele foi removido de propósito. Cruzando com o próprio Moodle core instalado neste servidor: arquivos autoloaded em `lib/classes/*.php` também têm uso misto (`http_client.php`, `deprecation.php`, `xml_parser.php` NÃO têm o check; `notification.php`, `chart_axis.php` TÊM); `mod/forum/db/upgrade.php`, `mod/quiz/db/upgrade.php` e `blocks/html/db/upgrade.php` do próprio core **também não têm** o check. Ou seja, o plugin está alinhado com a convenção real (inconsistente) do próprio Moodle core, não é uma omissão isolada. `admin/stats.php` é um script de entrada direta (`require(__DIR__.'/../../../config.php')` na linha 35) — esse padrão dispensa o check por definição (o bootstrap já acontece na primeira linha executável, igual a `mod/*/view.php` no core). **Não é achado bloqueante.**

### 1.2 Convenção `@package`

🟢 **FATO** — Todos os 28 arquivos `.php` declaram `@package    Moodle` com `@subpackage Plugin a11y` (confirmado via grep, valor idêntico nos 28). A convenção "frankenstyle" documentada pelo Moodle para plugins usa o nome do componente como `@package` (ex.: `@package local_a11y`, sem `@subpackage`), não `@package Moodle`. Isso também gerou artefatos visíveis na documentação gerada (`docs/api-php/packages/Moodle.html`, `packages/Plugina11y.html`, `packages/Moodle-Plugina11y.html` — três pacotes phpDocumentor diferentes para o mesmo plugin, sinal direto da inconsistência).

🟡 **INTERPRETAÇÃO** — Isso é um desvio de convenção de docblock, não uma questão de licença em si. Baixo impacto prático (não afeta a licença GPL declarada nem a instalação), mas é o tipo de coisa que o `moodle-plugin-ci`/revisor humano do Plugins Directory tende a comentar. Vale corrigir por ser mecânico e barato.

### 1.3 Declaração de licença em `version.php`, `README.md` e `@license`

🟢 **FATO** — Todas as três fontes concordam: `version.php:26` → `@license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later`; todos os 28 `.php` têm a mesma linha `@license`; `README.md:3` traz o badge "Licença: GPL v3+" e a seção `## Licença` (`README.md:126-128`) diz "GNU GPL v3 ou posterior". **Nenhuma divergência encontrada.**

🟡 **INTERPRETAÇÃO** — `README.md:127` diz "ver `COPYING.txt` do Moodle", mas o plugin **já tem seu próprio** `LICENSE` na raiz (35147 bytes, texto integral da GPLv3, copiado do `COPYING.txt` do Moodle core deste servidor — confirmado em `DECISIONS.md` D59, linha 25: "`LICENSE`: não existia. Criado a partir do próprio `COPYING.txt` do core Moodle deste servidor"). O texto do README ficou desatualizado depois que o `LICENSE` local foi criado — não é uma contradição de licença, só uma frase que deveria apontar para o arquivo local em vez do Moodle core.

### 1.4 Divergência de autoria entre arquivos, README e docs

🟢 **FATO** — `@author` é idêntico nos 28 arquivos `.php`: "Rodrigo Padilha Silveira <padilhars@gmail.com>" e "Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>". `@copyright` é idêntico nos 28: "Universidade Federal de Pelotas - UFPel". `README.md:13-16` ("## Autoria") cita os dois mesmos nomes, descritos como "dois servidores públicos federais da Universidade Federal de Pelotas (UFPel)". **Nenhuma divergência de nomes encontrada entre código, README e docs.**

🟢 **FATO** — Nenhum arquivo do plugin traz um ano junto ao `@copyright` (padrão comum em outros plugins Moodle é `@copyright AAAA Nome`); aqui é sempre só "Universidade Federal de Pelotas - UFPel", sem ano. Não é exigido pela GPL, mas é uma lacuna informativa (dificulta apurar desde quando a titularidade é reivindicada, relevante para um registro no INPI).

---

## 2. Terceiros empacotados

### 2.1 `thirdpartylibs.xml`

🟢 **FATO** — O arquivo **não existe** em nenhum lugar da árvore do plugin (busca `find` recursiva, resultado vazio). Confirmado também que a sessão de preparação para publicação mais recente e mais completa do projeto (`DECISIONS.md` D59, que rodou a suíte inteira do `moodle-plugin-ci` — phplint, phpcpd, phpmd, phpcs, validate, savepoints, mustache, grunt, phpunit, behat — e está detalhadamente documentada em `docs/PUBLISHING.md`) **não menciona esse arquivo em nenhum momento**, apesar de o plugin empacotar 3 arquivos de fonte de terceiros (`fonts/*.woff2`) e pelo menos um SVG derivado de obra de terceiro (`pix/accessibility-un.svg`).

🟢 **FATO (fonte: moodledev.io/general/community/plugincontribution/thirdpartylibraries, consultada ao vivo nesta sessão)** — A documentação oficial do Moodle declara que `thirdpartylibs.xml` é obrigatório sempre que o plugin inclui bibliotecas de terceiros baixadas para dentro de uma subpasta do próprio plugin ("third party library" = qualquer código cuja versão mais recente não é mantida/hospedada pelo próprio Moodle). Isso cobre claramente as fontes em `fonts/`. A mesma página não trata explicitamente de assets carregados via CDN em tempo de execução (ver §2.4).

**Severidade: Alto.** Não é uma questão de direito autoral em si (as fontes têm licença compatível, ver 2.2), mas é um requisito formal e documentado do Moodle Plugins Directory que está ausente — tende a barrar ou atrasar a aprovação da submissão, e nenhuma etapa de revisão já feita pelo próprio projeto o pegou.

### 2.2 Fontes empacotadas (Atkinson Hyperlegible, Lexend)

🟢 **FATO** — `fonts/` contém exatamente 3 arquivos: `atkinson-hyperlegible-400.woff2`, `atkinson-hyperlegible-700.woff2`, `lexend-variable.woff2`. Nenhum arquivo de licença (`OFL.txt` ou equivalente) ou aviso de copyright acompanha esses arquivos em nenhum lugar do repositório.

🟢 **FATO (fontes: `raw.githubusercontent.com/google/fonts/main/ofl/{atkinsonhyperlegible,atkinsonhyperlegiblenext,lexend}/OFL.txt`, consultadas ao vivo nesta sessão)** —
- "Atkinson Hyperlegible" (original, Braille Institute of America): licenciada sob **SIL Open Font License, Version 1.1**; copyright "2020 Braille Institute of America, Inc."
- "Atkinson Hyperlegible Next" (variante mais nova mantida pela comunidade Google Fonts): também **SIL OFL 1.1**; copyright "2020-2024 The Atkinson Hyperlegible Next Project Authors".
- "Lexend": **SIL OFL 1.1**; copyright "2018 The Lexend Project Authors", com Reserved Font Name "RevReading Lexend".

🔴 **NÃO VERIFICADO** — Não foi possível confirmar, dentro desta sessão, qual das duas variantes de Atkinson Hyperlegible (original vs. "Next") foi de fato usada para gerar os `.woff2` deste plugin: os arquivos são WOFF2 binário comprimido e a tabela `name` interna não pôde ser inspecionada porque não há `fonttools`/`ttx`/`woff2_decompress` instalado neste ambiente (nenhuma instalação de ferramenta foi feita, por estar fora do escopo desta fase de auditoria). Isso não muda a conclusão de licença — ambas as variantes são OFL 1.1 — mas impede confirmar a exata linha de copyright que deveria constar no arquivo de atribuição a criar.

🟡 **INTERPRETAÇÃO** — A SIL OFL 1.1 é uma licença permissiva compatível com distribuição dentro de um pacote GPLv3 (fontes sob OFL não precisam ser relicenciadas; a prática padrão — inclusive adotada pelo próprio Google Fonts — é distribuir o arquivo de licença junto aos arquivos de fonte). A ausência do texto da licença e do aviso de copyright junto aos `.woff2` é uma lacuna de conformidade real com a OFL 1.1 (que exige que o texto da licença acompanhe cópias distribuídas do software de fonte), mas de baixo risco prático de exigibilidade (a Braille Institute e o projeto Lexend não são conhecidos por ações de enforcement agressivas) — ainda assim, é o tipo de item que o Moodle Plugins Directory tipicamente cobra via `thirdpartylibs.xml` (item 2.1).

**Severidade: Médio.** Fácil de corrigir (baixar o `OFL.txt` de cada família e incluir em `fonts/`, mais uma entrada em `thirdpartylibs.xml`), mas é uma exigência de licença real e hoje não cumprida.

### 2.3 `pix/accessibility-un.svg` (CC BY-SA 4.0)

🟢 **FATO** — O arquivo já documenta sua origem no próprio comentário (`pix/accessibility-un.svg:2-13`): derivado de ["Accessibility logo (UN)"](https://commons.wikimedia.org/wiki/File:Accessibility_logo.svg) do Wikimedia Commons, CC BY-SA 4.0, com a modificação declarada explicitamente (troca do bloco `<style>`/classes CSS por atributos de apresentação inline, geometria idêntica ao original). `README.md:129-140` ("### Atribuição de terceiros") repete a mesma informação com mais detalhe, e `classes/icons.php:181` referencia de volta o mesmo comentário.

🟢 **Dever 1 (indicar modificação): CUMPRIDO.** Tanto o comentário no SVG quanto o README descrevem exatamente qual mudança foi feita e afirmam que a geometria (paths/circles) permanece idêntica ao original.

🟢 **Dever 2 (licenciar a obra derivada em termos compatíveis): CUMPRIDO da forma mais simples possível.** O arquivo derivado é mantido explicitamente sob a **mesma** licença CC BY-SA 4.0 (não há tentativa de relicenciá-lo como GPLv3) — isso evita por completo a necessidade de invocar o mecanismo de compatibilidade unidirecional CC BY-SA→GPL (ver 2.3.1), que só seria necessário se o projeto quisesse declarar o SVG como parte do código GPLv3 "puro". Manter arquivos de mídia sob sua licença de origem, coexistindo com código GPL no mesmo pacote, é prática comum e juridicamente sólida.

🟡 **Dever 3 (atribuição): PARCIALMENTE CUMPRIDO — achado real.** 🟢 **FATO (fonte: `commons.wikimedia.org/wiki/File:Accessibility_logo.svg`, consultada ao vivo nesta sessão)** — a própria página do arquivo no Wikimedia Commons credita nominalmente os autores: "United Nations, Graphic Design Unit" (design original) e "**Pablo Busatto**" (vetorização), e pede explicitamente que o crédito a Pablo Busatto seja dado na atribuição. Nem o comentário em `pix/accessibility-un.svg` nem o texto de `README.md:129-140` citam esses nomes — ambos citam apenas "Wikimedia Commons" como fonte, com link para a página do arquivo, mas sem nomear o(s) autor(es). A CC BY-SA 4.0 (art. 3(a)(1)(A)) exige atribuir o nome do criador quando ele é informado pelo licenciante, o que é exatamente o caso aqui.

**Severidade: Médio.** É uma não conformidade real e concreta com a licença (não apenas de estilo), mas de correção trivial (adicionar duas linhas de nome na seção de atribuição existente) e de baixo risco de exigibilidade prática dado que a fonte já está linkada e a licença já está corretamente citada — só falta o nome do autor.

#### 2.3.1 Compatibilidade CC BY-SA 4.0 + GPLv3 no mesmo pacote

🟢 **FATO (fonte: `creativecommons.org/compatiblelicenses`, consultada ao vivo nesta sessão)** — A compatibilidade entre CC BY-SA 4.0 e GPLv3 é **unidirecional**: é permitido relicenciar uma adaptação de material CC BY-SA 4.0 sob GPLv3, mas **não** o inverso — não é permitido relicenciar (partes de) um projeto GPLv3 sob CC BY-SA 4.0. Citação direta obtida da página oficial: "compatibility with the GPLv3 is one-way only, which means you may license your contributions to adaptations of BY-SA 4.0 materials under GPLv3, but you may not license your contributions to adaptations of GPLv3 projects under BY-SA 4.0."

🟡 **INTERPRETAÇÃO** — Como descrito em 2.3 acima, este plugin **não precisa** desse mecanismo de compatibilidade, porque não tenta relicenciar o SVG como GPLv3 nem o restante do código como CC BY-SA — cada asset permanece sob sua própria licença original, coexistindo dentro do mesmo pacote distribuído. Essa é a abordagem correta e mais simples; registrar aqui apenas porque o roteiro da auditoria pediu a análise explícita da direção de compatibilidade.

### 2.4 `pix/accessibility-default.svg` (svgrepo.com, licença não confirmada)

🟢 **FATO** — O próprio comentário do arquivo (`pix/accessibility-default.svg:2-12`) já declara o problema: baixado de svgrepo.com, cujo cabeçalho de origem só credita "SVG Repo Mixer Tools" sem declarar uma licença específica, e o comentário pede explicitamente "confirm the exact licence/attribution requirement on svgrepo.com before public redistribution". `DECISIONS.md` D60 (linha 9) repete a mesma ressalva quase palavra por palavra e afirma que a implementação não foi bloqueada "presumindo que [o usuário] tem o direito de uso", mas que **precisa ser confirmado antes de qualquer distribuição pública**. `docs/PUBLISHING.md` §1 não lista este item como resolvido.

**Severidade: Alto.** Diferente do item 2.3 (onde a licença e a atribuição são conhecidas, só incompletas), aqui a licença de origem é **desconhecida** — svgrepo.com agrega ícones de fontes variadas (algumas CC0, outras com atribuição obrigatória, outras proprietárias com uso restrito a assinantes) e "SVG Repo Mixer Tools" no cabeçalho não identifica o autor original nem a licença real. É o item de maior risco jurídico concreto do pacote, e já é reconhecido como tal pelos próprios autores do plugin — só falta a ação de confirmação, que este processo de auditoria não pode fazer sozinho (exigiria localizar a página de origem exata no svgrepo.com, o que não foi fornecido).

### 2.5 MediaPipe (carregado via CDN em tempo de execução)

🟢 **FATO** — `amd/src/face_navigation.js:41-44` carrega `@mediapipe/tasks-vision@0.10.18` via `import` de `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs`, e o modelo `face_landmarker.task` de `https://storage.googleapis.com/mediapipe-models/...`. Nenhum arquivo desse pacote é copiado para dentro do plugin — é buscado pelo navegador do usuário final em tempo de execução, cada vez que a opção "Navegação por Face" é usada. O próprio código já implementa (linhas 47-70) uma verificação de integridade SHA-256 do `vision_bundle.mjs` antes de executá-lo, e documenta no comentário por que isso é feito (mitigar risco de supply-chain, já que `import` não suporta o atributo `integrity` nativo).

🟢 **FATO (fonte: registry.npmjs.org, consultada ao vivo nesta sessão)** — `@mediapipe/tasks-vision` está licenciado sob **Apache License 2.0**, publicado por `mediapipe@google.com` (Google).

🟡 **INTERPRETAÇÃO** — Como o código do MediaPipe nunca é copiado para dentro do repositório/pacote do plugin (é buscado do CDN da Google/jsDelivr pelo navegador do usuário final a cada uso), as obrigações de redistribuição da Apache 2.0 (preservar aviso de copyright/licença/NOTICE em cópias distribuídas) tendem a não se aplicar aqui, pela mesma lógica de uma página web que faz `<script src="https://cdn...">` para um script hospedado por terceiros — não há "distribuição" de código de terceiro pelo projeto, só uma referência/link em tempo de execução. Esta é uma leitura razoável, mas não uma conclusão jurídica definitiva (não há jurisprudência específica citada aqui). `README.md:27` já documenta essa exceção de forma transparente e correta ("nenhum script, fonte ou API de terceiro é carregado do navegador do usuário final [exceto] CDN do MediaPipe... a primeira passa por verificação de integridade SHA-256").

🟡 **INTERPRETAÇÃO** — Ainda que não seja estritamente exigido por `thirdpartylibs.xml` (que, pela documentação oficial consultada em 2.1, cobre bibliotecas baixadas para dentro do plugin, não recursos remotos), seria uma boa prática de transparência documentar essa dependência de CDN também no `thirdpartylibs.xml` ou em nota equivalente, dado que altera a superfície de confiança do plugin em produção. Não é um achado de não conformidade, é uma recomendação.

**Severidade: Informativo.**

### 2.6 `package.json` / devDependencies

🟢 **FATO** — O plugin **não tem `package.json` próprio** (busca recursiva em toda a árvore do plugin não encontrou nenhum). `docs/README.md:27` referencia um `package.json` hipotético só como exemplo de comando (`npx jsdoc amd/src -d docs/api-js --package <package.json com name "local_a11y">`), não como arquivo real do projeto. `ENVIRONMENT.md:42` confirma que o build de JS (`grunt amd`) usa as devDependencies do **Gruntfile do Moodle core**, instaladas via `npm ci` rodado na raiz do Moodle (`/var/www/moodle`), **fora** da árvore do plugin.

🟡 **INTERPRETAÇÃO** — Como o `local_a11y` não declara nem versiona seu próprio `package.json`, e o toolchain de build (Grunt, Babel, ESLint, etc.) pertence ao Moodle core — não é copiado, versionado nem distribuído junto com o plugin —, não há dependências de build-time do plugin em si para auditar quanto a licença "vazando" para o pacote distribuído. O que é de fato distribuído (`amd/build/*.min.js`) é código-fonte do próprio plugin, minificado pelo toolchain de terceiro (Moodle core), não código de terceiro embutido. **Não há achado de copyleft "vazando" para o pacote — o item não se aplica na forma como foi levantado no roteiro, porque a premissa (existência de um `package.json` do plugin) não se confirma.**

---

## 3. Titularidade

🟢 **FATO** — `@copyright` em 100% dos arquivos `.php` (28/28) é "Universidade Federal de Pelotas - UFPel" (institucional, pessoa jurídica), nunca um nome de pessoa física. `@author` em 100% dos arquivos é sempre os dois mesmos nomes de pessoa física. `README.md` ("Autoria") apresenta os dois autores como servidores públicos federais da UFPel — coerente com a leitura de que a **titularidade patrimonial** é reivindicada pela instituição e a **autoria moral** pelos dois indivíduos. **Nenhuma inconsistência de nomes/instituição encontrada entre arquivos de código, README e `docs/`.**

🔴 **NÃO VERIFICADO — motivo:** não há, em nenhum arquivo do repositório, uma referência a instrumento jurídico formal (política institucional da UFPel, termo de cessão de direitos, ou citação da Lei nº 9.609/1998 art. 4º — que trata de programa de computador desenvolvido por servidor público no exercício de suas funções) que fundamente por que o copyright pertence à UFPel e não aos dois autores individualmente. O `@copyright` tag por si só é uma declaração, não uma prova de titularidade legal. **Isso é especificamente relevante para um eventual registro no INPI**, que tipicamente pede a identificação clara do titular e pode exigir documentação de suporte (contrato de trabalho, termo de cessão, ou political institucional de PI da UFPel) — este processo de auditoria de código não tem acesso a esse tipo de documento e não pode confirmá-lo.

🟢 **FATO** — Existe `LICENSE` na raiz do plugin (texto integral da GPLv3, ver §1.3). **Não existe** `COPYING`/`COPYING.txt` próprio do plugin — o único texto de licença completo é o `LICENSE` já mencionado. `README.md:127` ainda referencia "`COPYING.txt` do Moodle" em vez do `LICENSE` local (ver §1.3, achado de redação desatualizada, não de ausência de licença).

---

## Tabela consolidada de achados

| Arquivo | Problema | Licença envolvida | Severidade | Correção sugerida |
|---|---|---|---|---|
| (nenhum arquivo específico — ausência de arquivo no diretório raiz do plugin) | `thirdpartylibs.xml` não existe, apesar de o plugin empacotar fontes e SVGs de terceiros | Requisito formal do Moodle Plugins Directory | **Alto** | Criar `thirdpartylibs.xml` conforme o formato documentado em moodledev.io, listando as 3 fontes e os 2 SVGs de origem externa |
| `pix/accessibility-default.svg` (+ comentário em `DECISIONS.md` D60 e `docs/PUBLISHING.md`) | Licença de origem (svgrepo.com) desconhecida — cabeçalho original só cita "SVG Repo Mixer Tools", sem licença declarada | Desconhecida | **Alto** | Localizar a página de origem exata no svgrepo.com e confirmar a licença real, ou substituir por um ícone de licença confirmada (ex.: CC0/OFL) antes de qualquer distribuição pública |
| `fonts/atkinson-hyperlegible-400.woff2`, `fonts/atkinson-hyperlegible-700.woff2`, `fonts/lexend-variable.woff2` | Fontes empacotadas sob SIL OFL 1.1 sem o arquivo de licença (`OFL.txt`) nem aviso de copyright acompanhando | SIL Open Font License 1.1 | **Médio** | Incluir `OFL.txt` de cada família em `fonts/` (baixado da fonte oficial) e referenciar em `thirdpartylibs.xml` |
| `pix/accessibility-un.svg`, `README.md:129-136` | Atribuição da CC BY-SA 4.0 cita fonte/licença mas não nomeia os autores creditados na página de origem (Pablo Busatto; United Nations Graphic Design Unit) | CC BY-SA 4.0 | **Médio** | Adicionar os nomes na frase de atribuição existente no README e/ou no comentário do SVG |
| Todos os 28 arquivos `.php` | `@package Moodle` / `@subpackage Plugin a11y` em vez do padrão frankenstyle Moodle (`@package local_a11y`) | Convenção de docblock Moodle (não é questão de licença) | **Baixo** | Padronizar `@package` para `local_a11y` e remover `@subpackage`, alinhando com a convenção de plugins do Moodle |
| `README.md:127` | Texto "ver COPYING.txt do Moodle" desatualizado — o plugin já tem `LICENSE` próprio | GPL v3+ | **Baixo** | Apontar o texto para o `LICENSE` do próprio plugin |
| Todos os 28 arquivos `.php` | `@copyright` sem ano | GPL v3+ / convenção Moodle | **Informativo** | Adicionar ano (ex.: intervalo desde 2026, ver histórico git) por clareza, não é exigido pela GPL |
| `amd/src/face_navigation.js:41-44` | Dependência de terceiro (MediaPipe, Apache 2.0) carregada via CDN em runtime, não distribuída — documentada corretamente no README, mas não listada em nenhum arquivo formal de terceiros | Apache License 2.0 | **Informativo** | Opcional: mencionar também em `thirdpartylibs.xml` por transparência, ainda que não seja estritamente exigido para recursos não distribuídos |
| (titularidade institucional, sem arquivo específico) | Ausência de documentação/instrumento formal que respalde a atribuição de copyright à UFPel em vez dos dois autores pessoa física | N/A (questão de titularidade, não de escolha de licença) | **NÃO VERIFICADO** | Confirmar com a UFPel/NIT institucional a existência de política de PI ou termo de cessão que respalde o `@copyright` institucional, relevante para registro no INPI |
| `lib.php`, `db/upgrade.php`, `admin/stats.php`, `classes/**/*.php`, `tests/*.php` | `defined('MOODLE_INTERNAL') || die();` ausente | N/A (convenção de segurança de código, não licença) | **Informativo** (não é achado de licenciamento — ver §1.1 para por que não é considerado defeito) | Nenhuma ação necessária; alinhado com a convenção real do Moodle core neste mesmo host |

---

## Checklist — pronto para publicar no Moodle Plugins Directory?

### **Resposta: NÃO, ainda há pendências de licenciamento.**

- [x] Cabeçalho GPL padrão em 100% dos `.php`/`.mustache`/`styles.css`
- [x] `@license`/`version.php`/`README.md` consistentes entre si (GPL v3 ou posterior)
- [x] Autoria e copyright consistentes entre código, README e docs (UFPel + 2 autores nomeados)
- [x] `LICENSE` com texto integral da GPLv3 presente na raiz
- [x] Atribuição CC BY-SA 4.0 do `pix/accessibility-un.svg` presente e maioria dos deveres cumpridos
- [ ] **`thirdpartylibs.xml` — ausente (bloqueante)**
- [ ] **Licença de `pix/accessibility-default.svg` — não confirmada (bloqueante, já reconhecido pelos próprios autores)**
- [ ] Arquivo de licença (`OFL.txt`) das fontes empacotadas — ausente
- [ ] Nome dos autores creditados (Pablo Busatto / United Nations) ausente na atribuição CC BY-SA do ícone ONU
- [ ] `README.md` ainda referencia `COPYING.txt` do Moodle em vez do `LICENSE` local (cosmético)
- [ ] `@package` fora do padrão frankenstyle Moodle em 28/28 arquivos (cosmético, mas visível a revisores)
- [ ] Confirmação institucional formal de titularidade UFPel (fora do escopo de uma auditoria de código — requer verificação administrativa, relevante para INPI)

**Nenhuma correção foi aplicada nesta fase**, conforme as regras da auditoria. Os itens acima estão ordenados aproximadamente por severidade/bloqueio à submissão, não por facilidade de correção.
