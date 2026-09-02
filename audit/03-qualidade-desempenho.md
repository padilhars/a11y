# Auditoria de Qualidade de Código e Desempenho — `local_a11y`

**Escopo:** `/var/www/moodle/html/public/local/a11y/` (commit `fd6f6a7`, branch `master`). Todas as ferramentas abaixo foram **executadas de verdade** nesta sessão — nenhuma saída foi simulada. Onde uma ferramenta não pôde rodar, isso está marcado explicitamente, com o motivo, e a lacuna foi coberta por análise estática manual (também marcada como tal).

**Legenda:** 🟢 FATO · 🟡 INTERPRETAÇÃO · 🔴 HIPÓTESE

---

## 0. Ferramental — o que rodou de verdade, e o que não rodou

`moodle-plugin-ci` 4.5.11 está instalado em `/tmp/a11y-qa/plugin-ci` (de uma sessão anterior). Rodei cada comando individualmente contra o plugin real, no Moodle core real deste host (`/var/www/moodle/html`, Moodle 5.2.1).

| Ferramenta | Status | Resultado real |
|---|---|---|
| `phplint` | 🟢 Rodou | 28/28 arquivos, "No syntax error found" |
| `phpcs` (padrão `moodle`) | 🟢 Rodou | **0 ERRORS, 198 WARNINGS** (99 em `lang/en`, 99 em `lang/pt_br`) — 100% da classe `moodle.Files.LangFilesOrdering.*` |
| `phpmd` | 🟢 Rodou | **11 violações reais** em 6 arquivos (detalhe na seção 2) |
| `phpcpd` | 🟢 Rodou | **"No clones found"** — zero duplicação de código PHP detectada |
| `savepoints` | 🟢 Rodou (como `www-data`, após erro de permissão como usuário comum) | `db/upgrade.php`: 2 blocos `if`/savepoint, ordem e correspondência OK |
| `mustache` | 🟢 Rodou (com `-m` apontando para o Moodle core) | 1 warning conhecido (`fab.mustache`, `aria-controls`) + 1 INFO novo (`panel.mustache`, ver seção 2) |
| `validate` | 🟢 Rodou | Todos os arquivos/tags obrigatórios encontrados, sem erro |
| `grunt` (`eslint` + `rollup` + `gherkinlint` + `stylelint`) | 🟢 Rodou (Node 22.23.2 via `nvm`, o `.nvmrc` do Moodle core — a versão 24 default do host não roda o build) | `eslint`: **63 warnings, 0 erros**; `stylelint`: **129 erros**, todos `declaration-no-important` |
| `phpdoc` | 🔴 **Não rodou** — ambiente quebrado: `local_moodlecheck` (ferramenta interna do `moodle-plugin-ci`) lança uma `coding_exception` ("Invalid component specified in renderer request") ao tentar obter um renderer neste Moodle 5.2.1. Confirmado que é o mesmo erro já documentado por este projeto em `docs/PUBLISHING.md` — **não é código do plugin**, é incompatibilidade entre essa ferramenta específica e esta versão do Moodle. |
| `phpunit` | 🟢 Rodou (diretamente via `vendor/bin/phpunit`, não pelo wrapper do `moodle-plugin-ci`) | **21/21 testes, 95 assertions, verde** |
| `behat` | 🔴 **NÃO VERIFICADO — motivo:** a infraestrutura Selenium/Chrome/chromedriver montada numa sessão anterior não está mais em execução neste host (processo não encontrado, porta 4444 não responde). Reconstruir esse ambiente é um processo de várias horas já documentado como difícil neste próprio projeto (múltiplas sessões, várias tentativas de driver/versão de Chrome). Não refiz esse trabalho só para esta auditoria de qualidade/desempenho. O último resultado real conhecido (não reverificado agora, citado só como contexto histórico) foi 3 de 4 cenários passando. |

---

## 1. Custo por página

### 1.1 Queries ao banco

🟢 **FATO** — Busquei por `$DB->` em toda a árvore do plugin (fora de `tests/`): o único uso fora de `db/upgrade.php` (que só roda durante upgrade, não em requisições normais) é `classes/stats.php:71,97,111` (`insert_record`/`execute`/`get_records`) — chamado exclusivamente por `classes/external/record_activation.php` (o webservice de estatísticas), que é uma requisição AJAX separada disparada pelo JS depois que a página já carregou, não parte do ciclo de renderização da página em si.

**O plugin não adiciona nenhuma query direta ao caminho de renderização normal de uma página.**

🟡 **INTERPRETAÇÃO** — A leitura da preferência do usuário (`classes/manager.php:294`, `get_user_preferences(...)`) passa por `lib/moodlelib.php:1674-1709` do Moodle core, que carrega **todas** as preferências do usuário de uma vez (`check_user_preferences_loaded()`) na primeira vez que qualquer código as pede numa requisição — Moodle core já faz isso por conta própria (temas, editor, calendário, etc. também leem preferências), então não tracei o bootstrap inteiro do Moodle para confirmar que `local_a11y` nunca é o "primeiro" a disparar essa carga. Na prática, o incremento de custo específico deste plugin aqui tende a zero, mas não afirmo isso como FATO por não ter isolado a chamada.

🔴 **NÃO VERIFICADO — motivo:** não instrumentei uma requisição real com `$CFG->perfdebug` ligado para contar queries de fato (isso alteraria configuração de um site em produção, fora do escopo de uma auditoria de leitura). A afirmação acima é baseada em leitura de código, não em contagem ao vivo.

### 1.2 `get_config()` — quantas vezes, e está cacheado?

🟢 **FATO** — Contei **16 pontos de chamada** de `get_config('local_a11y', ...)`, todos em `classes/config.php` (linhas 39, 49, 77, 115-122, 160-163, 173, 194, 214).

🟢 **FATO (lido diretamente em `lib/moodlelib.php:1025-1085` do Moodle core)** — `get_config()` usa `cache::make('core', 'config')` (linha 1061), chave = nome do plugin. Na primeira chamada para `'local_a11y'` numa requisição, faz **uma única** query (`$DB->get_records_menu('config_plugins', ['plugin' => 'local_a11y'], ...)`, linha 1066) e guarda o array inteiro no cache; toda chamada seguinte para qualquer chave de `local_a11y` — nesta mesma requisição ou em requisições futuras, dependendo do backend de cache configurado no site — vem do cache, sem nova query.

**Conclusão: 16 pontos de chamada no código-fonte, mas no máximo 1 leitura de cache (e possivelmente 0 queries, se o cache já estiver quente) por requisição, independente de quantas vezes o plugin chame `get_config()`.** Isso não é um achado de desempenho — é uma confirmação de que o padrão já está correto.

### 1.3 Casamento de "páginas excluídas"

🟢 **FATO** — `classes/manager.php:196-208` (`is_active_on_current_page()`) encadeia `config::is_enabled() && config::allowed_for_current_user() && !config::current_page_excluded()` — por curto-circuito do `&&`, `current_page_excluded()` (a checagem mais cara) só roda se as duas primeiras (baratas: um `get_config()` cacheado e um `has_capability()`/checagem de guest) já passaram. **Confirmado que a checagem mais barata vem antes da mais cara.**

🟢 **FATO** — `classes/hook_callbacks.php:54,82,99,116` — as 4 funções de hook chamam `manager::is_active_on_current_page()` como a **primeira linha**, antes de qualquer `$PAGE->get_renderer()` ou trabalho de renderização. **A checagem acontece antes do trabalho pesado, nas 4 vezes que é chamada.**

🟢 **FATO** — `classes/config.php:77-81` (`excluded_page_patterns()`): quando `excludedpages` está vazio (valor padrão), `preg_split()` sobre uma string vazia com `PREG_SPLIT_NO_EMPTY` retorna `[]` imediatamente, e `current_page_excluded()` (linha 88-107) retorna `false` no primeiro `empty($patterns)` — custo O(1) no caso padrão (nenhuma página excluída configurada).

🟡 **INTERPRETAÇÃO / achado real de eficiência (Baixo)** — Como as 4 funções de hook chamam `is_active_on_current_page()` **cada uma independentemente**, e não há nenhuma memorização (`static`) do resultado dentro da requisição, `current_page_excluded()` — e, com ele, o `preg_split()` + laço de `excluded_page_patterns()` — é recalculado **do zero 4 vezes por página**, mesmo que o resultado seja idêntico nas 4 vezes. No caso padrão isso é 4× um O(1) trivial (irrelevante); só passaria a importar se um admin configurasse muitos padrões de exclusão. Correção de esforço muito baixo: guardar o resultado booleano em uma variável `static` dentro de `manager.php`, computada uma vez por requisição.

### 1.4 Tamanho em bytes

🟢 **FATO (medido diretamente nos arquivos)**

| Arquivo | Bruto | Gzip |
|---|---|---|
| `styles.css` | 100.982 bytes (2.724 linhas) | 27.813 bytes |
| `amd/build/face_navigation.min.js` | 13.576 bytes | 5.170 bytes |
| `amd/build/main.min.js` | 12.432 bytes | 3.620 bytes |
| `amd/build/panel.min.js` | 9.664 bytes | 2.979 bytes |
| `amd/build/voice_commands.min.js` | 8.782 bytes | 3.264 bytes |
| `amd/build/virtual_keyboard.min.js` | 7.338 bytes | 2.755 bytes |
| `amd/build/magnifier.min.js` | 6.869 bytes | 2.858 bytes |
| `amd/build/vlibras_integration.min.js` | 5.895 bytes | — |
| `amd/build/bionic_reading.min.js` | 5.885 bytes | — |
| `amd/build/silence_media.min.js` | 5.775 bytes | — |
| **Soma dos 19 módulos `amd/build/*.min.js`** | **99.921 bytes** | (não somado individualmente) |
| Soma de `amd/src/*.js` (não minificado, 19 arquivos) | 224.717 bytes | — |

🟢 **FATO (medido ao vivo, `https://mdl.snifrbid.com.br/`, requisição anônima, HTML da página inicial)** — o script inline síncrono no topo do `<body>` (`classes/output/renderer.php::render_nofouc_script()`) mede **2.358 bytes** nesta página real, contendo 9 chaves de `boolMap` + 11 de `stepperMap` hardcoded, um `try/catch`, e um laço `Object.keys(...).forEach(...)` sobre no máximo ~20 chaves no total.

🟡 **INTERPRETAÇÃO** — Esse script **bloqueia a renderização por definição** (é injetado antes de qualquer conteúdo do `<body>`, de propósito, para aplicar as classes de acessibilidade antes da primeira pintura). Mas o *trabalho* que ele executa é trivial (poucas iterações sobre arrays pequenos, sem rede, sem DOM além de uma escrita em `className`) — o bloqueio é uma troca deliberada e necessária para evitar FOUC (documentado no próprio código), não um desperdício de CPU. Não é um achado de "corrigir", é uma característica de design correta para o que se propõe a fazer.

### 1.5 `styles.css` é carregado mesmo quando o plugin está "desativado"?

🟢 **FATO (lido diretamente em `lib/classes/output/theme_config.php:1138-1157` do Moodle core)** — Ao compilar o CSS de um tema, o Moodle core itera **todo plugin instalado** (`core_component::get_plugin_list()`) e, se existir um `styles.css` na raiz do plugin, adiciona-o incondicionalmente à lista de folhas de estilo do tema (`$cssfiles['plugins'][...] = $sheetfile`) — a única forma de excluir é a configuração `plugins_exclude_sheets` do **tema**, não algo que `local_a11y` controle. **Isso acontece no momento de compilar/cachear o CSS do tema, sem nenhuma relação com `manager::is_active_on_current_page()`, `config::is_enabled()`, `showforguests` ou qualquer outra checagem em runtime deste plugin.**

**Conclusão: os 100.982 bytes (27.813 gzip) de `styles.css` são entregues em absolutamente toda página do site, para todo usuário — inclusive visitantes com `showforguests=0`, páginas na lista de exclusão do admin, e sites onde o plugin está desligado (`enabled=0`) — porque essas checagens só existem no lado do JS/hooks, nunca no lado do CSS.**

🟡 **INTERPRETAÇÃO** — Isso não é um defeito específico de `local_a11y`: é assim que **todo** plugin Moodle com `styles.css` funciona (é uma restrição arquitetural do core, não uma escolha deste plugin). Resolver isso exigiria não ter um `styles.css` estático e injetar as regras via `<style>` no JS/hooks (condicionado a `is_active_on_current_page()`) — uma mudança grande, que perderia o cache HTTP/combo do CSS do tema e adicionaria mais bytes ao script inline síncrono (que já bloqueia renderização). **Não recomendo essa mudança como está** — é um trade-off arquitetural, não um bug a corrigir.

### 1.6 CSS: seletores universais e `filter`/`invert` sobre a página inteira

🟢 **FATO** — Contei os usos de `#page *` (seletor universal restrito a descendentes de `#page`, mas ainda assim "todo elemento"): linhas 1525, 1533 (fonte legível/disléxica), 1671/1681/1691 (altura de linha), 1829/1832/1835/1838 (alinhamento de texto), 1872-1874 (pausar animações, incluindo `::before`/`::after`), 2450/2459 (cursor) de `styles.css`.

🟢 **FATO** — `styles.css:2385-2392`: `#page, .navbar, .drawer, .local-a11y-root { filter: var(--a11y-filter-invert,) var(--a11y-filter-saturate,) var(--a11y-filter-color,) var(--a11y-filter-bluelight,); }` — aplica `filter` (potencialmente encadeando invert/saturate/hue-rotate/sepia) a `#page` inteiro quando qualquer uma das 4 opções de cor está ativa.

🟡 **INTERPRETAÇÃO** — `filter` em um elemento grande força o navegador a compor esse elemento em sua própria camada e reprocessar pixels através da cadeia de filtros — um custo real de repaint/composição, mas é **a forma padrão e não há alternativa client-side sensivelmente mais barata** para implementar ajuste de cor de página inteira via CSS puro. O comentário do próprio arquivo (linhas 2379-2384) mostra que os autores já investigaram problemas reais relacionados (D27, D31 — vazamento de `filter` criando um novo *containing block* para elementos `position: fixed`) e escolheram deliberadamente escopar o `filter` a `#page`/`.navbar`/`.drawer`/`.local-a11y-root` em vez de `body`/`html` (que seria pior). **Não há `will-change` associado a essas 4 regras — e isso está correto**: essas classes mudam raramente (o usuário liga/desliga uma opção, não a cada frame), então `will-change` permanente aqui manteria uma camada de composição ociosa na GPU sem benefício real. `will-change: transform`/`transform, filter` já é usado corretamente onde faz sentido (`.local-a11y-magnifier`/`.local-a11y-magnifier__content`, `styles.css:2638,2647` — a lupa se move a cada movimento do mouse). **Não é um achado de correção — é uma arquitetura já pensada, com o trade-off inerente à própria funcionalidade que promete.**

### 1.7 Módulos pesados: sob demanda ou no bundle inicial?

🟢 **FATO** — `amd/src/main.js:32-49` tem **17 declarações `import` estáticas no topo do arquivo**, cobrindo literalmente todos os módulos de funcionalidade do plugin: `Panel`, `Effects`, `Storage`, `Profiles`, `FabLift`, `ReadingGuide`, `ReadingMask`, `Magnifier`, `ScreenReader`, `VirtualKeyboard`, `VoiceCommands`, `Tooltips`, `FaceNavigation`, `PauseMedia`, `SilenceMedia`, `BionicReading`, `VlibrasIntegration`, `Stats`. Nenhum desses é um `import()` dinâmico.

🟢 **FATO** — `classes/hook_callbacks.php:122-125` chama `$PAGE->requires->js_call_amd('local_a11y/main', 'init', [...])` incondicionalmente sempre que `is_active_on_current_page()` é verdadeiro — ou seja, em praticamente toda página, para praticamente todo usuário (padrão: `enabled=1`, `showforguests=1`).

**Conclusão: nenhum módulo é carregado sob demanda. Todos os 19 módulos AMD — incluindo os mais pesados e mais raramente usados (Navegação por Face via webcam/MediaPipe, Comandos por Voz via microfone, Teclado Virtual, Lupa) — são declarados como dependência estática de `main.js` e portanto buscados/interpretados pelo RequireJS assim que `local_a11y/main` carrega, em toda página, para todo usuário, mesmo os que nunca ativam essas opções.**

🟡 **INTERPRETAÇÃO** — Somando só os módulos que são features opcionais avançadas (excluindo `main`, `panel`, `effects`, `storage`, `profiles`, `stats`, que são necessários para o FAB/painel básico funcionar): `face_navigation` (13.576) + `voice_commands` (8.782) + `virtual_keyboard` (7.338) + `magnifier` (6.869) + `vlibras_integration` (5.895) + `bionic_reading` (5.885) + `silence_media` (5.775) + `screen_reader` (3.421) + `pause_media` (3.258) + `tooltips` (3.297) + `fab_lift` (2.003) + `reading_guide` (1.428) + `reading_mask` (1.069) ≈ **68.596 bytes minificados** (bruto, sem gzip) de JS que é baixado, parseado e executado (o `define()`/factory de cada módulo roda, mesmo que a função exportada nunca seja chamada) em toda página, para a maioria dos usuários que nunca tocam essas opções.

Ver seção "Top 5 ganhos de desempenho" para a estimativa de economia e o porquê de gzip não resolver a parte mais cara disso (parse/compilação JS, não transferência de rede).

---

## 2. Estrutura

### 2.1 Complexidade — dados reais de `phpmd` e `eslint`

🟢 **FATO (phpmd)** — `classes/output/panel.php`:
- Linha 52 (`export_for_template()`): **Complexidade Ciclomática 14** (limite configurado: 10); **NPath 315** (limite: 200); **122 linhas** (limite: 100); parâmetro `$output` não usado.
- Linha 187 (`export_option()`): **Complexidade Ciclomática 12** (limite: 10); parâmetro booleano `$forced` — sinal de violação do Single Responsibility Principle (mistura duas responsabilidades: exportar dados e sinalizar um estado forçado).

🟢 **FATO (eslint)** — `amd/src/face_navigation.js`:
- Linha 553: função seta com **complexidade 25** (limite: 20) — corresponde ao laço de detecção facial por `requestAnimationFrame` (região do arquivo dedicada a mandíbula/piscar/cursor).
- Linhas 629, 652: blocos aninhados em **profundidade 5** (limite: 4).
- Linhas 691, 708: `promise/no-nesting` (Promise aninhada dentro de outra) e `promise/always-return` (um `.then()` sem retorno/throw) na cadeia de inicialização do MediaPipe.

🟢 **FATO (eslint)** — `amd/src/panel.js:374`: função seta com **complexidade 21** (limite: 20) — 1 ponto acima do limite.

🟡 **INTERPRETAÇÃO** — `export_for_template()`/`export_option()` e a função de detecção de `face_navigation.js` são, cada uma, o núcleo de uma responsabilidade real e não-trivial (montar toda a árvore de dados do template do painel; processar landmarks faciais quadro a quadro). Refatorá-las é possível (extrair sub-métodos por seção lógica), mas carrega risco real de regressão numa função central testada só indiretamente (ver seção 4) — classifico como impacto Médio, esforço Médio, não Alto/urgente.

### 2.2 Duplicação

🟢 **FATO (phpcpd)** — "No clones found." Nenhuma duplicação de código PHP detectada entre os 28 arquivos do plugin.

🔴 **NÃO VERIFICADO — motivo:** `phpcpd` foi rodado só contra PHP; não há uma ferramenta equivalente configurada neste projeto para detectar duplicação entre módulos AMD (JS) ou dentro de `styles.css`. Não fiz uma varredura manual arquivo-a-arquivo dos 19 módulos JS ou das 2.724 linhas de CSS para duplicação — seria necessário uma ferramenta dedicada (ex. `jscpd`) não presente neste ambiente, e não a instalei por estar fora do escopo desta fase de leitura.

### 2.3 Acoplamento entre módulos AMD

🟢 **FATO** — Busquei todo `import ... from 'local_a11y/...'` em `amd/src/*.js` fora de `main.js`: existe **exatamente um** import cruzado entre módulos de funcionalidade — `amd/src/virtual_keyboard.js:37` importa `local_a11y/fab_lift`. Nenhum outro módulo de feature (Magnifier, ReadingGuide, ScreenReader, VoiceCommands, FaceNavigation, etc.) importa outro módulo de feature diretamente.

🟡 **INTERPRETAÇÃO** — Isso indica baixo acoplamento real: `main.js` (687 linhas) atua como o único orquestrador central, conhecendo todos os módulos e coordenando-os via um objeto `settings` compartilhado e um contrato uniforme (`sync(active, callbacks)`/`start()`/`stop()`), exatamente como o próprio docblock do arquivo já descreve ("Panel owns the DOM... Effects translates settings... Storage persists them"). A camada entre estado (`main.js`/`settings`), persistência (`storage.js`) e efeito visual (`effects.js` + cada módulo de feature) está clara e é respeitada na prática, não só na documentação — achado positivo.

### 2.4 Convenções do Moodle

🟢 **FATO** — `db/hooks.php:33-45` registra callbacks via a Hooks API moderna (`\core\hook\output\before_http_headers::class`, `before_standard_head_html_generation::class`, etc.), não o sistema legado de `$plugin_callback`/funções de nome mágico. `lib.php` contém só `local_a11y_user_preferences()` (o hook de preferências, ele mesmo parte do sistema atual) — nenhum callback legado (`extend_navigation`, `*_before_footer`, etc.) foi encontrado.

🟢 **FATO** — Renderização segue o padrão `output`/renderer do Moodle: `classes/output/renderer.php extends \plugin_renderer_base`, `classes/output/fab.php`/`panel.php` são `renderable`/`templatable`, consumidos via `$PAGE->get_renderer('local_a11y')` (`classes/hook_callbacks.php:86,103,120`) e templates `.mustache` em `templates/`. JS é carregado via `$PAGE->requires->js_call_amd()` (linha 122), não `<script>` manual. Namespaces (`local_a11y`, `local_a11y\output`, `local_a11y\external`, `local_a11y\privacy`, `local_a11y\integration`) seguem a convenção de `classes/` do Moodle. **Sem achado — convenções corretas.**

### 2.5 Tratamento de erro (câmera negada, navegador sem suporte, preferência corrompida)

🟢 **FATO** — `amd/src/face_navigation.js:701-703,721`: `navigator.mediaDevices.getUserMedia(...)` está dentro da mesma cadeia de `.then()` que termina em `.catch((e) => { renderError(e.message || String(e)); })` (linha 721) — se o usuário **negar a permissão de câmera**, o erro (`NotAllowedError`) é capturado e um estado de erro visível é mostrado na HUD (`renderError()`, que usa `.textContent`, não falha silenciosa).

🟢 **FATO** — `amd/src/voice_commands.js:224-228`: se `getSpeechRecognitionCtor()` retorna `null` (**navegador sem suporte**), mostra a pill com a string `vc_notsupported` — visível ao usuário, não silencioso.

🟢 **FATO** — **Preferência corrompida**: corrigido nesta mesma sessão anterior, D62 (`amd/src/storage.js`, `try/catch` em torno de `JSON.parse(stored)`) — ver `audit/02-seguranca.md`, achado 3.

**Nos 3 cenários que a auditoria pediu para verificar, não encontrei falha silenciosa — todos têm um caminho visível de erro/fallback.**

---

## 3. Achados adicionais do ferramental (não cobertos acima)

🟢 **FATO (phpmd)** — Violações triviais adicionais: `classes/hook_callbacks.php:52` parâmetro `$hook` não usado; `classes/icons.php:205` nome de variável longo (`$defaultaccessibilityinner`, 26 caracteres, limite 20); `classes/manager.php:229` variável local `$defaultvalue` não usada (dentro de um `foreach` que só usa a chave); `classes/output/fab.php:44` parâmetro `$output` não usado; `tests/manager_test.php:30` classe com 11 métodos públicos (limite 10). Todas Informativas — nenhuma afeta comportamento.

🟢 **FATO (eslint)** — `amd/src/voice_commands.js:286` — `no-alert` ("Unexpected confirm") — este é o `window.confirm()` que **eu mesmo introduzi** no achado 2 de `audit/02-seguranca.md` (D62), como o gate de consentimento mais simples e sem dependências. É dívida técnica de lint real, introduzida por essa correção — registro aqui por transparência, não é um achado "descoberto", é uma consequência conhecida da escolha feita (documentada em `DECISIONS.md` D62 como decisão deliberada: "nativo, sem dependência nova").

🟢 **FATO (mustache)** — `templates/panel.mustache:41` — INFO (não erro): "Section lacks heading. Consider using h2-h6 elements... or else use a div element" na seção de perfis (`<section class="local-a11y-panel__section" data-region="profiles-section">`). Achado novo, não documentado antes pelo projeto. Severidade Baixa (é INFO, não WARNING/ERROR do próprio linter) — trocar `<section>` por `<div>`, ou adicionar um heading visualmente oculto, resolve.

---

## 4. Testes — matriz de cobertura real

30 opções (`classes/options.php`) × 9 perfis (`classes/profiles.php`) hoje.

### 4.1 O que cada camada de teste realmente cobre

🟢 **FATO** — Os 18 métodos de teste PHPUnit (`tests/manager_test.php`, `tests/lang_parity_test.php`, `tests/stats_test.php`, `tests/privacy_provider_test.php`) testam: a forma/sanitização do array de configurações genericamente (contra `get_default_settings()`, cobrindo as 30 chaves de uma vez, não uma por vez com asserção específica de efeito), 1 mapeamento específico (`stepper_class_prefix_map_colorchange`), paridade de chaves de idioma, e a tabela/API de privacidade de estatísticas (D47). **Nenhum teste PHPUnit verifica o efeito visual/comportamental real de uma opção individual** — o que é esperado, já que isso é responsabilidade de CSS/JS, fora do alcance do PHPUnit.

🟢 **FATO** — `tests/behat/local_a11y.feature`: 2 cenários — persistência de `textSize` após reload; aplicar/remover o perfil `dyslexia` (que ativa `dyslexicFont`, `lineHeight`, `textSpacing`). `tests/behat/vlibras_integration.feature`: 2 cenários — ausência da opção `signLanguage` sem `local_vlibras`; presença/toggle com `local_vlibras` instalado e integração ligada.

🟢 **FATO** — Busquei "axe" em todo o plugin: as únicas 2 ocorrências (`amd/src/screen_reader.js:49`, `amd/src/panel.js:394`) são comentários citando regras do axe-core que os autores checaram manualmente durante o desenvolvimento — **não há nenhuma integração automatizada de axe-core no test suite** (nenhuma dependência, nenhum passo de Behat, nenhum job de CI que rode um scan de acessibilidade).

### 4.2 Matriz opção × tipo de teste

| Cobertura | Opções | % de 30 |
|---|---|---|
| Behat (comportamento real, navegador) | `textSize`, `dyslexicFont`, `lineHeight`, `textSpacing` (via perfil), `signLanguage` (via VLibras) | 5/30 (17%) |
| PHPUnit (só forma/sanitização genérica, não efeito) | Todas as 30 (indiretamente, via `sanitize_settings()`) + `colorChange` (mapeamento específico) | 30/30 na camada de dados; 0/30 na camada de efeito |
| axe-core automatizado | Nenhuma | 0/30 (0%) |
| **Sem nenhum teste de comportamento real (nem Behat nem axe-core)** | **25 das 30** (`readableFont`, `highlightTitles`, `highlightLinks`, `highlightButtons`, `wordSpacing`, `textAlign`, `bionicReading`, `contrast`, `invertColors`, `colorChange`, `saturation`, `blueLightFilter`, `hideImages`, `pauseAnimations`, `silenceMedia`, `tooltips`, `readingGuide`, `readingMask`, `magnifier`, `cursor`, `focusMode`, `screenReader`, `virtualKeyboard`, `voiceCommands`, `faceNavigation`) | **83%** |

| Cobertura | Perfis | % de 9 |
|---|---|---|
| Behat | `dyslexia` | 1/9 (11%) |
| Sem nenhum teste | `lowVision`, `colorBlind`, `adhd`, `senior`, `epilepsy`, `motor`, `cognitive`, `night` | 8/9 (89%) |

### 4.3 Os testes existentes testam comportamento ou só "não explode"?

🟢 **FATO** — Os testes existentes **testam comportamento real com asserções específicas**, não são testes triviais de "não lança exceção": por exemplo `test_sanitize_settings_clamps_stepper_values` verifica o valor exato após o clamp, `test_sanitize_settings_drops_unknown_keys` verifica que uma chave desconhecida some do resultado, `test_boolean_class_map_excludes_overlay_only_options` verifica um conjunto negativo específico. Isso é um ponto positivo — a qualidade dos testes que existem é boa; o problema é a **cobertura**, não a profundidade de cada teste individual.

### 4.4 Regressão para bugs já corrigidos no CHANGELOG

🟢 **FATO** — `tests/behat/vlibras_integration.feature:50-56` (comentário do próprio arquivo): a correção D57 (o toggle simular um clique real no botão do VLibras, abrindo `#vlibras-app-root`) é explicitamente **não testada** por esse cenário — o comentário diz que a verificação real foi feita "ao vivo via Puppeteer" uma vez, não como parte permanente do Behat, porque "Behat has no built-in step to reach into an element's shadow root".

🟢 **FATO** — Busquei por "magnifier"/"lupa" em `tests/*.php` e `tests/behat/*.feature`: nenhuma ocorrência. **As 3 correções de alinhamento da Lupa (D49, D50, D51, cada uma descrevendo uma causa raiz real encontrada em produção) não têm nenhum teste automatizado — nem PHPUnit nem Behat.**

**Conclusão: nenhum dos bugs de UI/JS documentados no CHANGELOG (VLibras D55-D58, Magnifier D49-D51, Focus Mode D52, chunking do Bionic Reading D53) tem um teste de regressão automatizado permanente.** Se qualquer um desses bugs for reintroduzido por uma mudança futura, nada no test suite atual pegaria isso automaticamente.

---

## 5. Tabela de achados priorizada (impacto × esforço)

| # | Achado | Severidade | Impacto | Esforço | Evidência |
|---|---|---|---|---|---|
| 1 | Todos os 19 módulos AMD (incl. Navegação por Face, Comandos por Voz, Teclado Virtual, Lupa) são importados estaticamente em `main.js` e carregados/executados em toda página, nunca sob demanda | **Médio** | Alto (~68,6KB JS minificado processado por padrão para a maioria dos usuários que nunca usam essas opções) | Médio-Alto (requer reestruturar `main.js` para `import()`/`require()` dinâmico por opção) | `amd/src/main.js:32-49`, `classes/hook_callbacks.php:122-125` |
| 2 | 83% das opções (25/30) e 89% dos perfis (8/9) não têm nenhum teste de comportamento automatizado (nem Behat, nem axe-core) | **Médio** | Alto (regressões silenciosas em produção, como as já documentadas no CHANGELOG) | Alto (Behat/axe-core por opção é trabalho substancial) | Seção 4.2 |
| 3 | Nenhum teste de regressão automatizado para os bugs já documentados no CHANGELOG (VLibras D55-D58, Magnifier D49-D51) | **Médio** | Médio-Alto (bugs já vistos em produção podem voltar sem aviso) | Médio (adicionar passos Behat específicos para os cenários já descritos em cada D) | `tests/behat/vlibras_integration.feature:50-56`; ausência de qualquer teste de Lupa |
| 4 | `classes/output/panel.php::export_for_template()` — CC 14/NPath 315/122 linhas; `export_option()` — CC 12 + boolean flag smell | **Baixo** | Médio (manutenibilidade; função central, mas testada só indiretamente) | Médio | `phpmd` real, seção 2.1 |
| 5 | `amd/src/face_navigation.js` — função de detecção com complexidade 25 (limite 20), aninhamento profundidade 5, Promise sem retorno | **Baixo** | Médio (lógica central e já frágil por natureza — webcam/ML) | Médio-Alto | `eslint` real, seção 2.1 |
| 6 | `is_active_on_current_page()`/`current_page_excluded()` recalculado do zero 4× por página, sem memorização | **Informativo** | Baixo (cada chamada já é O(1) no caso padrão) | Muito baixo | `classes/manager.php:196-208`, `classes/hook_callbacks.php:54,82,99,116` |
| 7 | `styles.css` (100,982 bytes / 27,813 gzip) é entregue em toda página do site, mesmo quando o plugin está desligado/excluído/oculto de guests | **Informativo** | Médio (mas é restrição arquitetural do Moodle core, não bug do plugin) | Alto (mudança arquitetural maior, com trade-offs próprios) | `lib/classes/output/theme_config.php:1138-1157` do Moodle core |
| 8 | `templates/panel.mustache:41` — seção sem heading (INFO do linter de mustache) | **Informativo** | Baixo | Muito baixo | `mustache` real |
| 9 | `no-alert` novo em `amd/src/voice_commands.js:286` (`window.confirm`), introduzido pela própria correção de segurança D62 | **Informativo** | Baixo (decisão deliberada, documentada) | Baixo (se quiser suprimir o lint ou trocar por um modal Moodle) | `eslint` real |

---

## Top 5 ganhos de desempenho

1. **Carregar módulos avançados sob demanda em vez de estaticamente em `main.js`** — economiza até **~68,6KB de JS minificado** (bruto, sem gzip) que hoje é baixado, parseado e tem seu `define()`/factory executado em toda página, para a maioria dos usuários que nunca ativam Navegação por Face, Comandos por Voz, Teclado Virtual, Lupa, etc. O ganho real maior não é rede (gzip já reduz a transferência ~60-65% nas amostras medidas) — é **tempo de parse/compilação JS no thread principal**, que gzip não reduz, pago em toda página independentemente de uso.
2. **Memorizar `is_active_on_current_page()` por requisição** — elimina 3 recomputações redundantes triviais por página (hoje roda 4×, uma por hook). Ganho absoluto pequeno (microssegundos no caso padrão), mas custo de implementação quase zero — uma variável `static` em `manager.php`.
3. **Adicionar testes de regressão Behat para os bugs de VLibras (D57/D58) e Magnifier (D49-D51)** — não é um ganho de *velocidade*, mas evita o custo real (já materializado 3+ vezes no histórico deste projeto, conforme o próprio CHANGELOG) de bugs de produção reaparecerem sem serem pegos antes do deploy.
4. **Adicionar as flags `JSON_HEX_*` já aplicadas em D62 e considerar cachear os literais `boolMap`/`stepperMap` do script no-FOUC** como constantes JS pré-serializadas em vez de `json_encode()` a cada requisição — ganho muito pequeno (microssegundos de CPU PHP por requisição), mas gratuito.
5. **Reavaliar se `styles.css` precisa continuar com 2.724 linhas monolíticas** — não é uma ação isolada de alto impacto (é uma restrição do Moodle core, item 7 da tabela), mas dividir/revisar regras específicas de baixo uso poderia reduzir o tamanho total entregue em toda página do site — o item de maior alcance (toda página, todo usuário) desta lista, mas também o de maior esforço/menor controle do plugin sobre a solução.

**Nenhuma correção foi aplicada nesta fase** — só este relatório em `audit/`.
