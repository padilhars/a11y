# Auditoria de Segurança — `local_a11y` (perspectiva pentester, code-review)

**Escopo:** `/var/www/moodle/html/public/local/a11y/` — leitura direta de 100% do PHP em `classes/`, `db/`, `admin/`, `lib.php`, `settings.php`; leitura completa de `amd/src/storage.js`, `amd/src/main.js` (trechos relevantes), `amd/src/face_navigation.js`, `amd/src/voice_commands.js`, `amd/src/silence_media.js`, `amd/src/screen_reader.js`, `amd/src/vlibras_integration.js`; busca por padrões (grep) no restante de `amd/src/*.js` e em todos os `.mustache`. Duas consultas externas ao vivo nesta sessão (MDN sobre `SpeechRecognition`; nenhuma outra). Sem execução dinâmica (sem Behat, sem DevTools, sem interceptação de rede) — achados marcados 🔴 HIPÓTESE exigiriam isso. Nenhuma alteração de código foi feita.

**Legenda:** 🟢 FATO · 🟡 INTERPRETAÇÃO · 🔴 HIPÓTESE

---

## 0. Mapa da superfície de ataque

### Entrada (dado externo chega ao plugin)

| # | Ponto de entrada | Arquivo:linha | Quem controla o dado |
|---|---|---|---|
| E1 | Parâmetro `featureid` do webservice AJAX `local_a11y_record_activation` | `classes/external/record_activation.php:55-59` | Qualquer usuário logado (inclusive guest, se permitido) via requisição AJAX assinada |
| E2 | Preferência `local_a11y_settings`, gravada via `core_user/repository` (webservice genérico do Moodle core, não deste plugin) | `lib.php:37-44` (declara o tipo `PARAM_RAW`); `amd/src/storage.js:224` (chamada real) | O próprio usuário logado, sobre sua própria preferência |
| E3 | `localStorage['local_a11y_settings']` no navegador (visitante/guest) | `amd/src/storage.js:40,148,165` | Qualquer JS rodando no mesmo domínio (o próprio plugin, ou qualquer XSS pré-existente em outro lugar do site) |
| E4 | Configurações de admin (`settings.php`): texto (`excludedpages`), HTML rico (`footertext`), cor (`accent` + 4 cores de efeito), select/checkbox | `settings.php:52-278` | Administrador com `moodle/site:config` |
| E5 | `$FULLME` (URL da requisição atual), comparado contra os padrões de `excludedpages` | `classes/config.php:88-107` | O próprio navegador do usuário (via URL da página) |
| E6 | Áudio do microfone (Comandos por Voz) via Web Speech API | `amd/src/voice_commands.js:224-235` | O próprio usuário, capturado pelo navegador |
| E7 | Vídeo da webcam (Navegação por Face) via `getUserMedia` | `amd/src/face_navigation.js:668-670` | O próprio usuário |
| E8 | Resposta de rede de terceiros: MediaPipe (`cdn.jsdelivr.net`, `storage.googleapis.com`) | `amd/src/face_navigation.js:41-43` | jsDelivr / Google (infraestrutura de terceiro, fora do controle do plugin) |
| E9 | `postMessage` recebido de volta de embeds do YouTube/Vimeo — **não há listener**, o plugin só envia, nunca escuta | `amd/src/silence_media.js:130-168` | N/A — via de mão única, ver achado abaixo |

### Saída (o plugin produz algo que outro contexto consome)

| # | Ponto de saída | Arquivo:linha | Formato |
|---|---|---|---|
| S1 | HTML do FAB/painel (`render_footer_html`) | `classes/output/renderer.php:129-134`, `templates/*.mustache` | HTML, parcialmente `{{{ }}}` (sem escape) |
| S2 | Script inline síncrono no topo do `<body>` (bootstrap no-FOUC) | `classes/output/renderer.php:60-119` | `<script>` com JSON embutido via `json_encode()` |
| S3 | `<style>` inline no `<head>` com as 4 cores de efeito + acento | `classes/output/renderer.php:156-172`, `classes/config.php:114-148` | CSS gerado a partir de config de admin |
| S4 | Tabela de estatísticas agregadas (`admin/stats.php`) | `admin/stats.php:40-73` | HTML via `html_writer::table()` |
| S5 | `postMessage` para iframes de embed (YouTube/Vimeo) | `amd/src/silence_media.js:147,166` | JSON stringificado |
| S6 | Áudio do microfone → serviço de reconhecimento de fala | `amd/src/voice_commands.js:224` | Fluxo de áudio bruto, ver achado 2 |
| S7 | Requisição `fetch()`/`import` para CDN de terceiro | `amd/src/face_navigation.js:41-44,206-224` | HTTP GET, sem payload de usuário |

---

## 1. Entrada e Autorização (padrões Moodle)

### 1.1 `required_param`/`optional_param`/`PARAM_*`

🟢 **FATO** — O plugin não usa `required_param()`/`optional_param()` em nenhum lugar (`grep -rn "required_param\|optional_param" classes/ db/ admin/ lib.php settings.php` não retorna nada) — toda entrada externa passa exclusivamente pelo mecanismo de webservice do Moodle (`external_function_parameters`/`external_value`), que faz a validação de tipo equivalente. O único parâmetro real é `featureid` em `classes/external/record_activation.php:57`, tipado `PARAM_ALPHANUMEXT` (aceita só `[A-Za-z0-9_-]`) — adequado para um identificador de opção como `readableFont`. Sem achado.

### 1.2 `sesskey`/`confirm_sesskey` em requisições que alteram estado

🟢 **FATO** — `classes/external/record_activation.php:78` chama `require_sesskey()` antes de qualquer escrita. É a única rota de escrita de estado exposta diretamente por este plugin (a gravação da preferência `local_a11y_settings` passa pelo webservice genérico `core_user/repository` do Moodle core — protegido pelo próprio mecanismo de sessão/sesskey do core, fora do código deste plugin). Sem achado.

### 1.3 Capabilities `local/a11y:view` e `local/a11y:configure` — checadas em todos os pontos, ou só o JS esconde a opção?

🟢 **FATO** — `local/a11y:configure` **não existe mais**: `db/access.php:48-55` documenta explicitamente sua remoção ("era declarada aqui mas nunca checada via `has_capability()` em nenhum lugar do plugin"), confirmando que a proteção de `settings.php` sempre foi (e continua sendo) o mecanismo padrão do Moodle core (`$hassiteconfig`/`moodle/site:config` via a árvore de administração), não uma capability própria. A pergunta "é checada em todos os pontos" não se aplica a uma capability que não existe.

🟢 **FATO** — `local/a11y:view` é checada server-side em pelo menos dois lugares independentes: `classes/config.php:60-70` (`allowed_for_current_user()`, usada por `manager::is_active_on_current_page()` — controla se o HTML/JS do plugin é sequer injetado na página) e `classes/external/record_activation.php:77` (`require_capability()`, no único endpoint de escrita). Não há nenhum ponto em que a capability seja checada só no cliente (JS) sem equivalente server-side — o pior caso de um cliente adulterado (JS removido/modificado) é que o painel simplesmente não aparece (gate client-side ausente), mas a única ação que grava algo (`record_activation`) já teria seu próprio `require_capability()` server-side independentemente do que o HTML/JS mostrou. Sem achado.

### 1.4 Visitante/não autenticado — `require_login()`

🟢 **FATO** — O plugin nunca chama `require_login()` em lugar nenhum (`grep -rn "require_login" classes/ admin/ lib.php` não retorna nada) — e isso é intencional e correto: `db/access.php:34-46` concede `local/a11y:view` por padrão ao arquétipo `guest`, e `classes/config.php:60-66` trata visitantes via `show_for_guests()` em vez de capability (documentado: "Anonymous... visitors have no role assignment to check a capability against"). `admin/stats.php:38` usa `admin_externalpage_setup()`, que internamente já exige login+capability — não precisa de uma chamada própria. O único endpoint de escrita (`record_activation.php`) passa por `external_api::validate_context()`, que por sua vez já invoca a validação de login do Moodle core antes de `require_capability()`. Sem achado — o design "aberto a guest, mas sem nada gravável sem sesskey+capability" é coerente e deliberado.

### 1.5 Validação server-side da preferência `local_a11y_settings`

🟢 **FATO** — `lib.php:37-44` declara a preferência com `'type' => PARAM_RAW`, o que **não impõe nenhuma validação de formato** no momento da gravação (a chamada real acontece via `setUserPreference()` do módulo core `core_user/repository`, `amd/src/storage.js:224` — código deste plugin não intercepta essa escrita). Isso significa que um usuário logado pode, chamando esse webservice genérico diretamente (fora da UI do plugin), gravar **qualquer string** como valor de `local_a11y_settings` — inclusive não-JSON, JSON malformado, ou um payload arbitrariamente grande.

🟢 **FATO — impacto downstream server-side é nulo:** o único ponto de leitura server-side, `classes/manager.php::get_current_user_settings()` (linhas 287-301), faz `json_decode($raw, true)` e passa o resultado por `sanitize_settings()` (linhas 220-258), que **itera exclusivamente sobre as chaves fixas de `get_default_settings()`** — nunca sobre as chaves do dado bruto — e cai em `is_array($raw)` como guarda inicial (retorna os defaults se não for array, o que cobre tanto `null` de um `json_decode` malformado quanto qualquer valor não-array). Um valor arbitrário gravado nunca produz nada além do conjunto de defaults ao ser lido de volta pelo servidor. Sem achado de injeção/corrupção server-side.

🟡 **INTERPRETAÇÃO / achado de robustez (não é uma vulnerabilidade de segurança contra terceiros — ver 3.4 abaixo):** o mesmo não é verdade no cliente: `amd/src/storage.js:186` (`return sanitize(JSON.parse(stored));`) chama `JSON.parse()` **fora** do bloco `try/catch` que envolve só a chamada de rede logo acima (linhas 179-183). Um valor não-JSON armazenado (possível justamente porque `PARAM_RAW` não impede isso) faz essa `Promise` rejeitar sem tratamento, quebrando a inicialização do FAB/painel para aquele usuário em toda página. Ver achado 1 na seção de resumo.

---

## 2. XSS e injeção na saída

### 2.1 Ocorrências de `{{{ }}}` (sem escape) e origem de cada valor

🟢 **FATO** — Todas as ocorrências, com a origem do valor rastreada até a fonte:

| Template:linha | Variável | Origem (arquivo:linha) | Controlável por usuário/admin? |
|---|---|---|---|
| `fab.mustache:68` | `iconsvg` | `classes/icons.php::fabicon_svg()` — SVG fixo de `pix/*.svg` ou `PATHS` | Não (admin só escolhe entre 2 valores de allowlist, `fabicon_svg():256`) |
| `option_stepper.mustache:59`, `option_toggle.mustache:72`, `profile_card.mustache:54`, `panel.mustache:135` | `iconsvg` | `classes/output/panel.php:117,134,195` — sempre `icons::svg($fixedkey, ...)` | Não — `$fixedkey` vem de arrays de opções/perfis hardcoded em `classes/options.php`/`classes/profiles.php`, nunca de entrada externa |
| `option_toggle.mustache:83` | `helphtml` | `classes/output/panel.php:206,234+` (`build_help_html()`) | Não — monta só a partir de `get_string()` sobre chaves fixas |
| `panel.mustache:81,93,96,103,107,113` | `accessibilityiconsvg`, `refreshiconsvg`, `closeiconsvg`, `searchiconsvg`, `sparklesiconsvg` | `icons::svg()`/`icons::*_svg()` com nomes fixos | Não |
| `panel.mustache:156` | `savetitle` | `classes/config.php::footer_text()` (linhas 194-200) | **Sim — texto rico configurável pelo admin (`admin_setting_confightmleditor`)**, mas passa por `format_text($custom, FORMAT_HTML, ['context' => ...])` do Moodle core antes de sair — o mesmo tratamento que o core dá a qualquer HTML editável por admin (resumo da página inicial, HTML adicional de rodapé). Não é saída crua de admin. |

🟢 **Conclusão:** nenhuma ocorrência de `{{{ }}}` recebe dado de usuário final sem sanitização; a única entrada de admin que passa por lá (`footertext`) já é tratada por `format_text()`. Sem achado de XSS armazenado nos templates.

### 2.2 Script inline no-FOUC — serialização e risco de `</script>`

🟢 **FATO** — `classes/output/renderer.php:67-70` gera 4 valores via `json_encode()` **sem** as flags `JSON_HEX_TAG`/`JSON_HEX_AMP`/`JSON_HEX_APOS`/`JSON_HEX_QUOT`:
```
$serversettings = $isloggedin ? json_encode($settings) : 'null';
$preferencename = json_encode(manager::PREFERENCE_NAME);
$boolmap = json_encode(manager::get_boolean_class_map());
$steppermap = json_encode(manager::get_stepper_class_prefix_map());
```

🟢 **FATO** — Hoje isso não é explorável: `$settings` vem de `manager::get_current_user_settings()`, que passa por `sanitize_settings()` (ver 1.5) — todo valor é `bool` ou `int` (nunca string), então nenhum deles pode conter `</script>`. `$preferencename` é a constante fixa `'local_a11y_settings'`. `$boolmap`/`$steppermap` são arrays PHP hardcoded (nomes de classes CSS), nunca dado externo. Confirmei os quatro casos individualmente — nenhum contém, hoje, uma string arbitrária.

🟡 **INTERPRETAÇÃO — achado de robustez/defesa em profundidade (Baixo):** a segurança dessa saída depende inteiramente de `sanitize_settings()` continuar garantindo "só bool/int" para sempre — não há uma segunda camada (as flags `JSON_HEX_*`) que tornaria essa garantia redundante. Uma mudança futura que adicionasse uma chave de settings do tipo string (ex.: um campo de texto livre por usuário) sem revisar este ponto reintroduziria a possibilidade de quebrar para fora do `<script>`. Não é uma vulnerabilidade hoje, é uma fragilidade de design: a correção (adicionar `JSON_HEX_TAG|JSON_HEX_AMP` às 4 chamadas) custa nada e eliminaria a dependência dessa invariante.

### 2.3 CSS injection via cores configuráveis pelo admin

🟢 **FATO** — As 5 cores (`accent` + 4 cores de efeito) usam `admin_setting_configcolourpicker` (`settings.php:228-261`). **Todas as 5** passam por validação regex antes de chegar a HTML/CSS de saída: `accent` é validada dentro de `classes/config.php::get_appearance()` via `valid_hex_color()` (linha 121, regex `/^#[0-9a-fA-F]{3,8}$/`, definida na linha 146-148); as 4 cores de efeito são revalidadas pelo mesmo padrão regex dentro de `classes/output/renderer.php::render_effect_color_vars()` (linhas 158-165), no ponto exato onde entram no `<style>`. Como a regex só aceita `#` seguido de dígitos hexadecimais, é estruturalmente impossível injetar `;`, `}` ou qualquer outro caractere de sintaxe CSS através desse caminho. **Sem achado — os dois pontos de validação foram checados e ambos estão corretos.** (O comentário em `classes/config.php:129-140` documenta que isso corrigiu um achado de auditoria anterior do próprio projeto; confirmei que a correção está de fato aplicada, não é apenas um comentário desatualizado.)

### 2.4 Classes CSS aplicadas ao `<body>` a partir da preferência

🟢 **FATO** — Tanto o caminho server-side (`classes/output/renderer.php:83-108`, dentro do script no-FOUC) quanto o client-side (`amd/src/effects.js`, não lido integralmente nesta sessão mas o padrão já é visível no próprio script no-FOUC que o replica) constroem as classes concatenando um **valor fixo do mapa** (`boolMap[key]`/`stepperMap[key] + value`, onde `key` vem de `Object.keys(boolMap)`/`Object.keys(stepperMap)` — as próprias chaves do mapa, nunca do dado do usuário) com, no máximo, um inteiro já clampado (`value`, resultado de `parseInt(...) || 0`, nunca maior que o `stepperMax` daquela chave). Não há concatenação de uma string de usuário em nome de classe CSS em nenhum ponto verificado. Sem achado.

---

## 3. Achados consolidados (com severidade, cenário de exploração e correção)

### Achado 1 — Verificação de integridade do MediaPipe incompleta (TOCTOU no `.mjs`; WASM e modelo sem verificação alguma)

**Severidade: Médio.**

🟢 **FATO** — `amd/src/face_navigation.js:69-79` (`verifyIntegrity`) faz `fetch(url)` próprio, calcula SHA-256 do buffer baixado e descarta o buffer — nunca o entrega para execução. `amd/src/face_navigation.js:206-224` (`loadMediaPipe`), só depois dessa Promise resolver, injeta um `<script type="module">` cujo `textContent` contém `import {...} from '<MP_VISION_BUNDLE>'` (mesma URL) — o carregador de módulos ES do navegador faz uma **segunda requisição HTTP, independente da primeira**, cujos bytes nunca passam pelo hash. `amd/src/face_navigation.js:42-43,659-661` mostram que `MP_WASM` (runtime WASM) e `MP_MODEL` (arquivo de modelo) são usados diretamente por `FilesetResolver.forVisionTasks()`/`FaceLandmarker.createFromOptions()` sem NENHUMA chamada a `verifyIntegrity()`.

🟢 **FATO — falha segura confirmada:** se `verifyIntegrity()` rejeita (hash não bate, ou o fetch falha), a cadeia de `.then()` em `amd/src/face_navigation.js:657-690` propaga o erro até o `.catch((e) => { renderError(e.message || String(e)); })` na linha 688-690 — o código NUNCA executa mesmo assim; o pior caso visível ao usuário é a HUD mostrar um estado de erro. **Não há fallback inseguro.** Também não há timeout explícito no `fetch()` de `verifyIntegrity` (linha 70) — uma resposta que nunca chega deixa a HUD presa no estado "carregando" indefinidamente; isso é uma questão de robustez/UX, não de segurança.

**Cenário de exploração concreto:** um atacante que controle (ou faça MITM seletivo contra) a resposta servida por `cdn.jsdelivr.net` para essa URL específica, e que consiga diferenciar a requisição de verificação (`fetch()`, cabeçalho `Sec-Fetch-Dest: empty`) da requisição real de execução (`<script type="module">`, `Sec-Fetch-Dest: script`) — servindo bytes benignos para a primeira e um `vision_bundle.mjs` malicioso para a segunda — consegue executar JavaScript arbitrário com privilégios totais da página, para qualquer usuário do Moodle que ative "Navegação por Face" em qualquer página do site. Uma substituição "grosseira" do arquivo (mesmo conteúdo para as duas requisições) **seria** pega pelo hash — o achado é especificamente sobre esse cenário de serviço diferencial, mais sofisticado que uma simples substituição de arquivo. O WASM/modelo, por não terem verificação nenhuma, são vulneráveis mesmo a uma substituição grosseira.

🔴 **HIPÓTESE — não verificado em execução:** não testei ao vivo se jsDelivr de fato diferencia respostas por `Sec-Fetch-Dest` para esta URL.

**Correção proposta:** buscar `vision_bundle.mjs` via `fetch()`, verificar o hash e, só então, executar exatamente o buffer já baixado (via `Blob`+`URL.createObjectURL()`+`import()` dinâmico do blob URL), estendendo o mesmo tratamento ao WASM e ao modelo (ou documentando explicitamente que a defesa real aqui é a política de mesma origem, não o hash).

---

### Achado 2 — Comandos por Voz envia áudio do microfone a um servidor de terceiro (Google, no Chrome), contradizendo a declaração de privacidade do próprio plugin

**Severidade: Alto.** Justificativa de impacto: não é uma falha explorável por um atacante externo no sentido tradicional — é uma discrepância factual entre o que o plugin diz fazer e o que efetivamente faz, em produção, agora, para qualquer usuário do navegador majoritário (Chrome/Chromium) que ative essa opção, num plugin construído explicitamente para uma instituição pública federal que cita a legislação de acessibilidade como motivação. O risco é de conformidade/privacidade (dado de voz potencialmente sensível saindo para um terceiro sem aviso), não de intrusão.

🟢 **FATO** — `amd/src/voice_commands.js:45` usa `window.SpeechRecognition || window.webkitSpeechRecognition` (API nativa do navegador). `amd/src/voice_commands.js:234` define `recognition.continuous = true` (captura contínua enquanto a opção está ativa). Em nenhum lugar do arquivo a propriedade `processLocally` é definida (confirmado por busca no arquivo inteiro).

🟢 **FATO (fonte: MDN Web Docs, `developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition`, consultada ao vivo nesta sessão)** — citação direta: *"On some browsers, like Chrome, using Speech Recognition on a web page involves a server-based recognition engine. Your audio is sent to a web service for recognition processing, so it won't work offline."* A mesma página documenta a propriedade `processLocally` como o mecanismo para *pedir* processamento local — que este código nunca usa.

🟢 **FATO** — `README.md:27` declara: *"Sem dependências externas em tempo de execução — nenhum script, fonte ou API de terceiro é carregado do navegador do usuário final (as duas exceções — CDN do MediaPipe... e o ícone ONU — estão documentadas...)"*. `README.md:30` e `README.md:104` declaram: *"nada é compartilhado com terceiros"*. O fluxo de áudio do microfone para o serviço de reconhecimento de fala do navegador (Google, em Chrome) **não está entre as exceções documentadas** e não é mencionado em nenhum lugar de `README.md`, `classes/privacy/provider.php` ou nos textos de ajuda da opção (`lang/pt_br/local_a11y.php:146,255`).

🟡 **INTERPRETAÇÃO — não verificado juridicamente:** se isso configura "compartilhamento com terceiro" no sentido da LGPD, e se voz é dado pessoal/sensível nesse contexto, são questões que dependem de enquadramento jurídico que este processo de auditoria de código não pode resolver sozinho — **precisa confirmação jurídica/DPO da UFPel antes de qualquer afirmação normativa** (não invento artigo de lei aqui, conforme a regra 4). O que é FATO, independente da conclusão jurídica, é a discrepância entre a declaração ("nada compartilhado com terceiros", "sem API de terceiro carregada") e o comportamento real do código nesse navegador específico.

**Cenário concreto:** um usuário de um site UFPel, em uma sessão institucional, ativa "Comandos por Voz" no Chrome; a partir daí, tudo que seu microfone capta enquanto a opção estiver ligada é transmitido ao serviço de reconhecimento de fala do Google para transcrição — nenhuma tela, texto de ajuda ou política de privacidade do plugin informa isso.

**Correção proposta:** documentar explicitamente essa exceção (mesmo padrão já usado para o MediaPipe) em `README.md`, na tela de ajuda da opção (`help_vc_*` em `lang/`) e em `classes/privacy/provider.php`, e decidir com a UFPel/DPO se isso exige aviso de consentimento específico antes de ativar a opção.

---

### Achado 3 — `JSON.parse()` sem tratamento de erro pode travar a inicialização do painel para o próprio usuário

**Severidade: Baixo.** Impacto isolado ao próprio usuário afetado (não há caminho para afetar outra conta); mas, num plugin de acessibilidade, negar o próprio recurso de acessibilidade a quem depende dele é um impacto funcional real, ainda que não seja uma falha de segurança contra terceiros.

🟢 **FATO** — `amd/src/storage.js:174-186` (`getSettings`): a chamada de rede (`getUserPreference`) está dentro de um `try { ... } catch (e) { stored = null; }` (linhas 179-183), mas a linha seguinte, `return sanitize(JSON.parse(stored));` (linha 186), está **fora** desse bloco. Como `lib.php:37-44` declara a preferência como `PARAM_RAW` (sem validação de formato no servidor — ver 1.5), nada impede que `stored` contenha uma string não-JSON.

**Cenário concreto:** o próprio usuário (ou um script/extensão rodando com seus privilégios) grava um valor não-JSON em `local_a11y_settings` via o webservice genérico `core_user_set_user_preference` do Moodle core (não precisa passar pela UI deste plugin); na próxima carga de página, `main.js:617` (`settings = await Storage.getSettings(isLoggedIn);`, dentro de `init()`) recebe uma Promise rejeitada não tratada — a inicialização do FAB/painel para aquele usuário para nesse ponto, silenciosamente (só um erro no console do navegador), em toda página, até o valor ser corrigido.

**Correção proposta:** envolver a chamada `JSON.parse(stored)` em seu próprio `try/catch`, tratando um valor corrompido exatamente como "sem preferência salva" (mesmo caminho que já existe para `stored === null`).

---

## 4. Banco e arquivos

🟢 **FATO** — Toda query com dado variável usa parâmetros nomeados do `$DB` (`classes/stats.php:98-99`: `:now`, `:featureid`); a única concatenação de string em uma query (`'UPDATE {' . self::TABLE . '}...'`, `classes/stats.php:98`) usa uma constante de classe fixa (`self::TABLE = 'local_a11y_stats'`), nunca entrada externa. `db/upgrade.php:73` usa `$DB->get_recordset()` com um array de condições, não SQL cru. Sem achado de SQL injection em nenhum ponto do plugin.

🟢 **FATO** — Não há nenhuma escrita em disco no código do plugin (`grep -rn "file_put_contents\|fwrite\|fopen.*'w'" classes/ admin/ lib.php` não retorna nada), nem `include`/`require` com caminho dinâmico (os únicos `file_get_contents()`, em `classes/icons.php:191,225`, usam caminhos fixos `__DIR__ . '/../pix/...'`, nunca construídos a partir de entrada), nem `eval()`/`create_function()`/`assign()` dinâmico em lugar nenhum do PHP ou JS do plugin. Sem achado.

---

## 5. Higiene

🟢 **FATO** — Nenhum segredo, token, senha ou URL de host interno/servidor de teste hardcoded foi encontrado em `classes/`, `admin/`, `lib.php`, `settings.php` ou `amd/src/` (busca por padrões de URL excluindo os hosts de terceiro já documentados — `moodle.org`, `gnu.org`, `creativecommons.org`, `wikimedia.org`, `github.com`, `cdn.jsdelivr.net`, `storage.googleapis.com`, `scripts.sil.org` — não retornou nada além destes).

🟢 **FATO** — Nenhum `var_dump`/`print_r`/`error_log` esquecido em PHP. O único `console.warn` em todo o `amd/src/` (`amd/src/vlibras_integration.js:159-165`) é condicionado a `M.cfg.developerdebug` (flag de debug do próprio Moodle, desligada em produção por padrão) — é diagnóstico deliberado, não um esquecimento. Sem achado.

🟢 **FATO** — Nenhum `TODO`/`FIXME`/`HACK` encontrado em `classes/`, `admin/`, `*.php` de raiz ou `amd/src/`.

🟢 **FATO** — `amd/build/*.min.js` não está desatualizado em relação a `amd/src/*.js`: comparei o timestamp de modificação de cada par (25 módulos) e nenhum arquivo-fonte é mais recente que seu respectivo build — não há build obsoleto rodando em produção. **NÃO VERIFICADO — motivo:** essa checagem usa apenas metadado do sistema de arquivos (mtime), não comparação semântica de conteúdo (ex.: um build re-gerado sem mudança real de conteúdo apareceria igual); não é garantia absoluta de que todo build reflita fielmente seu source, só que nenhum source é *cronologicamente* mais novo que seu build.

🔴 **NÃO VERIFICADO — motivo (strings de lang órfãs / capabilities não usadas / seletores CSS órfãos):** uma varredura completa de cada uma das ~280 chaves de `lang/en/local_a11y.php` contra todo uso em PHP/JS/mustache, e de cada seletor de `styles.css` (100KB, não lido integralmente) contra o HTML gerado, está fora do orçamento desta sessão. O próprio projeto já documenta (`docs/PUBLISHING.md` §3, `DECISIONS.md` D59) uma auditoria de órfãs anterior que removeu 11 chaves confirmadas sem referência — não reproduzi essa varredura do zero para confirmar que nada de novo apareceu desde então.

---

## 6. Superfície de ataque residual aceita

Isto não são bugs — são riscos arquiteturais conscientes, decorrentes de escolhas de design documentadas no próprio projeto, que valem registrar como aceitos e não como pendência:

- **`local/a11y:view` é concedida a `guest` por padrão** (`db/access.php:34-46`): qualquer visitante não autenticado pode usar o painel e (se `collectstats` estiver ligado) contribuir para os contadores agregados via `record_activation`. É a proposta central do plugin ("útil antes do login") — não é um achado, é o requisito.
- **`postMessage` para embeds do YouTube/Vimeo é via de mão única** (`amd/src/silence_media.js`): o plugin nunca escuta uma resposta desses embeds, então não há superfície de `message` event handler para um embed malicioso explorar de volta — mas isso também significa que o plugin não tem como confirmar se o comando de silenciar de fato surtiu efeito (falha silenciosa aceitável, doc já reconhece "degrade em silêncio").
- **Nenhuma Content Security Policy está configurada neste stack hoje** — 🟢 FATO: busca por `Content-Security-Policy` no Moodle core (`lib/*.php`, `lib/classes/*.php`) e na configuração nginx deste host (`/etc/nginx/`) não encontrou nenhuma diretiva. Isso significa que a injeção de `<script type="module">` inline em `face_navigation.js:213-221` e os `fetch()`/`import` cross-origin para `cdn.jsdelivr.net`/`storage.googleapis.com` não violam nenhuma política hoje — mas também que, se uma CSP for adicionada futuramente (prática de hardening comum) sem contemplar explicitamente esses dois hosts e um mecanismo para o script inline (nonce ou `unsafe-inline` em `script-src`), a funcionalidade "Navegação por Face" quebra silenciosamente. Risco arquitetural aceito implicitamente pela ausência de CSP, não uma falha ativa.
- **Dependência de infraestrutura de terceiro fora de controle do plugin** (jsDelivr, Google Storage, e — no Chrome — o serviço de reconhecimento de fala do Google): mesmo com a mitigação do Achado 1 corrigida, o plugin permanece dependente da disponibilidade e integridade de serviços que a UFPel não opera. Isso é inerente a usar MediaPipe/Web Speech API sem hospedar uma alternativa própria, e foi uma escolha deliberada documentada (`README.md`: "sem depender de extensões de navegador de terceiros" — mas com essas duas exceções explícitas).

---

## Resumo

| # | Achado | Severidade | Evidência principal |
|---|---|---|---|
| 1 | Integridade do MediaPipe incompleta: hash do `.mjs` desvinculado do código executado (TOCTOU); WASM/modelo sem verificação | **Médio** | `amd/src/face_navigation.js:42-43,69-79,206-224,659-661` |
| 2 | Comandos por Voz envia áudio a servidor de terceiro (Google/Chrome), contradizendo "nada compartilhado com terceiros" do README | **Alto** | `amd/src/voice_commands.js:45,234`; `README.md:27,30,104` |
| 3 | `JSON.parse()` sem try/catch pode travar init do painel para o próprio usuário se a preferência estiver corrompida | **Baixo** | `amd/src/storage.js:186`; `lib.php:37-44` |

**Nenhuma correção foi aplicada nesta fase** — só este relatório em `audit/`.
