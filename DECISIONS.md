# DECISIONS.md

Registro de decisões tomadas autonomamente diante de ambiguidades do briefing. Fonte de verdade em caso de dúvida futura: `_design-reference/` (protótipo) > este arquivo > bom senso Moodle.

## D29 — "Dicas de Ferramentas" reescrita como tooltip customizado via JS

A implementação original de `tooltips` (herdada verbatim de `_design-reference/app.jsx`) era puramente CSS: `body.a11y-tooltips #page a[title]:hover::after, ... button[title]:hover::after { content: attr(title); }`. Isso nunca funcionou de verdade fora do protótipo (que é só um mock estático, sem tooltip nativo real do navegador competindo): CSS não tem nenhum mecanismo para suprimir o tooltip nativo do `title` (só JS pode remover/restaurar o atributo), o texto inserido via `content: attr(title)` não tinha nenhum estilo de balão (sem fundo, sem seta, só texto solto), e só cobria `a`/`button` com `title` — nada de `aria-label`, `alt` de imagem ou `data-tooltip`.

A pedido do usuário, reescrito como uma 6ª "feature avançada" JS (mesmo padrão de `readingGuide`/`readingMask`/`screenReader`/`virtualKeyboard`/`voiceCommands` — um `sync(active)` chamado de `main.js::syncAdvancedFeatures()`, sem classe de `<body>`), em `amd/src/tooltips.js` novo:

- Delegação em `document` via `mouseover`/`mouseout` (hover) e `focusin`/`focusout` (teclado, ambos borbulham ao contrário de `focus`/`blur`), casando com `[title], [aria-label], [data-tooltip], img[alt]` via `closest()`.
- Texto do balão, em ordem de prioridade: `data-tooltip` (override explícito) > `title` > `aria-label` > `alt` (só `<img>`).
- **Supressão do tooltip nativo**: ao mostrar o balão, se o elemento tem `title`, o valor é guardado em `data-a11y-tooltip-title` e o atributo `title` é removido do DOM — o navegador não tem mais nada para mostrar nativamente. Restaurado ao esconder o balão (mouseout/focusout/Esc/troca de alvo).
- Balão (`.local-a11y-tooltip`, fundo escuro `#18181b`, texto branco, canto arredondado, seta via `::after` rotacionado 45°) é `position: fixed`, medido e posicionado via `getBoundingClientRect()`: acima do alvo por padrão, com flip automático para baixo quando não há espaço (`rect.top - altura do balão - 8px < 0`), e clamping horizontal para nunca vazar as bordas da viewport — a seta acompanha o centro horizontal do alvo mesmo quando o balão precisa deslocar lateralmente para caber.
- `aria-describedby` no alvo apontando pro `id` do balão (`role="tooltip"`) enquanto mostrado, removido ao esconder — acessibilidade de leitor de tela para o próprio balão customizado.
- `.local-a11y-root` no balão: imune aos efeitos de página (mesmo padrão de `reading_guide`/`screen_reader`) e "selado" contra vazamento de tipografia (D26) automaticamente, já que essa classe já carrega `font-size`/`line-height`/etc. próprios.

Removido `tooltips` de `classes/manager.php::get_boolean_class_map()` e do espelho em `amd/src/effects.js` (não é mais um efeito de classe de `<body>`) — mesmo tratamento que as outras 5 booleans "always-JS-overlay" já recebiam. Teste PHPUnit `test_boolean_class_map_excludes_overlay_only_options` atualizado para cobrir `tooltips` também.

Verificado via Playwright (elementos injetados com `title`/`aria-label`/`alt`/`data-tooltip`): balão mostra o texto certo para os 4 casos; `title` corretamente removido enquanto o balão está visível e restaurado ao sair; funciona por foco de teclado também; balão desaparece e não reaparece depois de desativar a opção; flip para baixo confirmado perto do topo da viewport; nenhum erro de console. PHPUnit 16/16 verde (59 asserções, +1 da nova cobertura).

## D28 — Segunda auditoria de segurança (pós D15, cobrindo D16-D27)

Reauditoria completa a pedido do usuário, cobrindo tudo que mudou desde D15 (ícone da ONU, consolidação do botão de reset, mudanças em `panel.js`, novas regras CSS). Achados:

1. **Corrigido — nova brecha de exposição web**: dois arquivos de backup de editor (`pix/accessibility-un-bak.svg`, `styles.css~`, ambos surgidos como efeito colateral de edições externas em sessões anteriores — nunca versionados no git) estavam sendo servidos publicamente (`200`) pelo Apache, porque o `<FilesMatch>` de D15 só cobria padrões específicos (`.md`, `.zip`, dotfiles, `phpunit.xml`) e não previa arquivos `*~`/`*.bak`/`*-bak.*` de forma genérica. Removidos os dois arquivos (eram descartáveis) e endurecido o `<FilesMatch>` em `moodle.conf`/`moodle-behat.conf` para negar qualquer arquivo terminado em `~`, `.bak`, `.orig`, `.swp`, ou contendo `-bak.` — defesa em profundidade contra qualquer backup de editor futuro (inclusive de um arquivo sensível), não só os dois encontrados agora. Verificado via `apache2ctl configtest` + reload + curl (403 nos dois arquivos, assets legítimos como `styles.css`/`pix/*.svg` continuam 200).
2. **Reverificado, ainda correto**: todas as proteções de D15 (bloqueio de `.git/`, docs `.md`, `_design-reference/`/`_verification/`/`tests/`, `local_a11y.zip`) continuam ativas e aplicadas ao vivo — confirmado via bateria de `curl` (403 em tudo sensível).
3. **Novo código revisado, sem achados**: `classes/icons.php::un_accessibility_svg()` lê `pix/accessibility-un.svg` via caminho fixo (`__DIR__`-relativo, sem componente derivado de entrada de usuário) — sem risco de path traversal. `icons::fabicon_svg()` valida `$fabicon` contra uma whitelist fixa antes de qualquer uso; `$size` é sempre um literal inteiro nos únicos dois call sites (`fab.php`/`panel.php`). `amd/src/panel.js` (reset consolidado, animação de pulso): todo conteúdo dinâmico via `textContent`/`classList`/`setAttribute`, nenhum `innerHTML` novo. Nenhuma nova chamada de rede (`fetch`/XHR) na Task; a única persistência remota continua sendo a rota `core_user/repository` do Moodle core.
4. **Reconfirmado**: `lib.php::local_a11y_user_preferences()` registra a preferência com `PARAM_RAW` (permissivo no nível do Moodle core), mas `manager::sanitize_settings()` — chamado sempre antes de qualquer uso do valor decodificado, tanto no PHP (`render_nofouc_script()`, via `json_encode()`) quanto espelhado no cliente (`storage.js::sanitize()`) — itera só sobre as chaves conhecidas de `get_default_settings()` (whitelist), nunca sobre as chaves do valor bruto, e força tipos/limites em cada uma. Uma preferência adulterada (mesmo por um usuário mal-intencionado editando a própria) nunca alcança o `<script>` inline sem passar por esse filtro.
5. Sem novos padrões perigosos de PHP (`exec`/`eval`/`unserialize`/`extract`/include dinâmico/SQL cru/superglobais cruas) em nenhum arquivo, novo ou existente. `settings.php` confirmado ainda gated por `if ($hassiteconfig)`. Sem `var_dump`/`print_r`/`error_log` vazando dados fora de `tests/`.

PHPUnit 16/16 verde após as mudanças.

## D27 — Barra de rolagem horizontal espúria com Inverter/Mudar Cores/Saturação

O usuário reportou que "algumas" das opções de Cores e Contraste criavam uma barra de rolagem horizontal na página. Isolando por opção via Playwright (`document.documentElement.scrollWidth` vs `clientWidth`): **Contraste não afeta em nada** (só troca cor de fundo/borda, sem `filter`); **Inverter Cores, Mudar Cores e Saturação** — as três que usam a pilha de `filter` em `#page-wrapper` (ver D16) — todas criavam ~320px de overflow horizontal, mesmo Inverter Cores sozinho (que usa só `invert()`/`hue-rotate()`, nem toca no filtro SVG `url(#...)` de Mudar Cores) — descartando de cara a hipótese óbvia de "é a região de filtro SVG que é 20% maior que a caixa por padrão" (essa região SVG existe e é real, mas não era a causa aqui, já que Inverter Cores não usa `url()` e ainda assim reproduzia o bug).

Causa raiz real: qualquer `filter` diferente de `none` transforma o elemento no *containing block* dos descendentes `position: fixed` (regra do próprio spec de CSS — é o mesmo mecanismo, aliás, que já garantia o FAB/painel ficarem imunes ao filtro apesar de também serem `position: fixed` dentro de `#page-wrapper`, ver comentário em D16). `#page-wrapper` também contém **drawers do próprio Moodle** (`message-drawer`, o drawer primário de navegação) que ficam deliberadamente estacionados alguns pixels *fora* da borda direita da viewport enquanto fechados (ex.: `left: 1440px` numa viewport de 1440px) — um padrão comum para permitir abrir com transição suave sem alternar `display`. Esse posicionamento só é inofensivo enquanto esses drawers são fixos **em relação à viewport**; assim que `#page-wrapper` vira o containing block deles, essa posição "estacionada fora da tela" passa a contar como overflow real da própria caixa de `#page-wrapper` (que tem a largura da viewport), abrindo a barra de rolagem. Confirmado via Playwright: o elemento causador tinha `id` começando com `drawer-...` (mensageria), `position: fixed`, exatamente às coordenadas `left: 1440, right: 1760` — 320px de overflow, batendo com o excesso observado.

Corrigido sem tocar no alvo do `filter` (que continua em `#page-wrapper`, necessário para cobrir navbar/drawer de curso por D16) nem nos drawers do Moodle: `overflow-x: hidden` no `<body>`, mas só enquanto alguma dessas 3 opções está ativa (`body.a11y-invert, body.a11y-saturation-1/2/3, body.a11y-color-1/2/3`), aproveitando a propagação padrão de `overflow` do `<body>` para a viewport (o `<html>` do tema não declara `overflow` próprio). `document.documentElement.scrollWidth` continua reportando o mesmo valor "excedente" (isso é esperado — `overflow:hidden` recorta a área visível/rolável, não encolhe o conteúdo subjacente); o teste correto é tentar rolar de fato (`window.scrollTo`/roda do mouse) e confirmar que a posição não muda horizontalmente — confirmado. Rolagem vertical continua funcionando normalmente (testado com roda do mouse antes/depois).

Verificado via Playwright: Inverter Cores, Mudar Cores, Saturação (isolados e em combinação) não permitem mais rolagem horizontal; Contraste segue sem qualquer alteração de comportamento (nunca teve o problema); rolagem vertical intacta. PHPUnit 16/16 verde.

## D26 — Nenhuma opção de "Texto e Tipografia" deve alterar o painel do plugin

O usuário observou que as opções da categoria "Texto e Tipografia" (Fonte Legível, Fonte para Dislexia, Destacar Títulos, Destacar Links, Destacar Botões, Tamanho do Texto, Altura da Linha, Espaçamento do Texto) não deveriam alterar a aparência do próprio painel. D24 já tinha corrigido isso parcialmente (só `font-family` de `readableFont`/`dyslexicFont`); esta correção fecha as 7 lacunas restantes, todas com a mesma causa raiz de D24 (o painel/FAB vivem dentro de `#page`, então qualquer regra `body.a11y-* #page ...` alcança o próprio painel).

Duas famílias distintas de vazamento, cada uma com sua correção:

1. **Correspondência direta com `!important`** (Destacar Botões, Destacar Títulos, Destacar Links, e a parte "`#page span`/`#page p`/`#page h1-h3`" de Espaçamento do Texto): o seletor da regra casava diretamente com elementos do painel (`#page button`/`#page [role="button"]`/`#page span` etc. — o painel tem vários `<button>`/`role="button"`/`<span>`). Corrigido acrescentando `:not(.local-a11y-root, .local-a11y-root *)` a cada um desses seletores — impede que a regra sequer combine com qualquer coisa dentro do painel/FAB, sem precisar brigar com a cascata (mais simples que a técnica de D24, que tinha que igualar especificidade e vencer por ordem no arquivo). Confirmado suporte a `:not()` com lista/seletor complexo no Chromium usado nos testes (149), consistente com o uso já existente de `color-mix()` no mesmo arquivo (recurso ainda mais recente).

2. **Vazamento por herança, apesar do `:not()`** (Altura da Linha, Espaçamento do Texto, e a parte de `font-weight`/`letter-spacing` de Fonte para Dislexia): mesmo com a correspondência direta bloqueada, várias dessas regras também setam a propriedade no **próprio `#page`** (seletor "nu", sem `#page *`) — e como `line-height`, `font-weight`, `letter-spacing` e `word-spacing` são propriedades herdadas, o valor computado de `#page` continua se propagando por herança normal do CSS para qualquer elemento do painel que não declare seu próprio valor (a maioria declara, mas nem todos — ex.: `.local-a11y-option__desc` não tem `font-weight` próprio, e a maioria dos `<div>`/`<span>` estruturais do painel nunca declararam `letter-spacing`/`line-height`/`word-spacing`/`font-size` próprios). `:not()` no seletor de origem não resolve isso, porque herança não passa pela cadeia de seletores — só pelo valor computado do elemento pai.

   Corrigido "selando" essas 5 propriedades em `.local-a11y-root` (bloco de design tokens, junto com `font-family`), com os mesmos valores padrão que o painel já usa hoje (herdados do Bootstrap/navegador): `font-size: 16px; font-weight: 400; line-height: 1.5; letter-spacing: normal; word-spacing: normal;`. Como esses valores são idênticos ao que já estava em vigor, a aparência do painel no estado padrão não muda em nada — só passa a não depender mais de herdar de fora do painel, o que rompe a corrente de herança bem na raiz, antes que ela alcance qualquer elemento do painel sem valor próprio.

Verificado de forma exaustiva via Playwright: capturado `getComputedStyle` de `fontFamily/fontSize/fontWeight/lineHeight/letterSpacing/wordSpacing/outlineStyle/textDecorationLine` em **todos os 503 elementos** do painel+FAB, antes e depois de ativar as 8 opções de tipografia simultaneamente no nível máximo — **0 diferenças**. Front visual (screenshot) confere: painel idêntico ao padrão, sem contorno laranja, sem texto quebrando linha, "8 opções ativas" mostrado corretamente. PHPUnit 16/16 verde.

## D25 — Clique repetido nos steppers: shadow trocado por flash de background

O usuário reportou que as 7 opções tipo *stepper* (Tamanho do Texto, Altura da Linha, Espaçamento do Texto, Contraste, Mudar Cores, Saturação, Cursor) ganham um `box-shadow` ao serem clicadas de novo já ativas, e pediu para trocar esse indicador por um flash rápido do background voltando à cor de ativo.

Investigação (inspecionando `document.styleSheets` por regras com `box-shadow` que casam com o elemento focado) identificou a origem exata: `.local-a11y-option[data-kind="stepper"]` tem `role="button" tabindex="0"` (necessário para ser navegável por teclado, ao contrário das opções toggle, que delegam o foco a um `<button>` real aninhado — ver comentário em `option_toggle.mustache`), e o **próprio Moodle core** estiliza qualquer `[role="button"]:focus` com um anel de foco (`rgba(15,108,191,.75) 0 0 0 .25rem`) — usando `:focus` puro, não `:focus-visible`, então aparece em *qualquer* clique de mouse, não só em navegação por teclado.

Como é uma regra de acessibilidade legítima do Moodle (garante indicador de foco visível para `role="button"`, WCAG 2.4.7), a correção **não** podia simplesmente removê-la — precisava distinguir clique de mouse de navegação por teclado, preservando o anel só para o segundo caso:

```css
.local-a11y-option[data-kind="stepper"]:focus:not(:focus-visible) { box-shadow: none; }
```

`:focus-visible` já é exatamente a heurística nativa do navegador para "este foco veio do teclado" — `:not(:focus-visible)` cobre o caso de foco por mouse. Verificado que a navegação real por Tab ainda mostra o anel completo (`matches(':focus-visible')` = true, `box-shadow` intacto) — só o clique de mouse perdeu o anel.

No lugar disso, `amd/src/panel.js` agora adiciona uma classe `local-a11y-option--pulse` (removida sozinha no fim da animação via evento `animationend`) sempre que o clique aconteceu numa stepper **já ativa antes do clique** (`option.classList.contains('local-a11y-option--active')` checado antes de disparar `cb.onStepperCycle`) — não no primeiro clique que ativa a opção, já que aí a mudança visual (fundo/borda/ícone aparecendo) já é suficientemente óbvia. CSS:

```css
@keyframes local-a11y-option-pulse {
  0%, 100% { background: color-mix(in srgb, var(--local-a11y-accent, var(--a11y-accent)) 6%, transparent); }
  40% { background: color-mix(in srgb, var(--local-a11y-accent, var(--a11y-accent)) 28%, transparent); }
}
```

Opções toggle não têm o problema (nunca tiveram `role="button"` no row) e não foram tocadas.

Verificado via Playwright: box-shadow "none" em qualquer clique de mouse (1º e repetidos); classe `--pulse` aparece imediatamente no clique repetido e some sozinha após a animação, com o background visivelmente mais escuro em pleno voo (capturado em screenshot) e de volta ao tom padrão de ativo ao final; foco real por teclado (Tab, 16 pressões até alcançar a opção) mantém o anel completo. PHPUnit 16/16 verde; ESLint/build AMD limpos.

## D24 — Correção do "deslocamento" das opções ao ativar (não era a borda)

O usuário reportou que as opções dentro das categorias "ganham uma borda quando clicadas e isso faz com que as opções tenham um leve deslocamento", sugerindo reservar uma borda transparente em `.local-a11y-option` quando inativa como correção. Investigação (Playwright, medindo `getBoundingClientRect()` antes/depois de ativar várias opções em categorias diferentes) mostrou que:

1. **A borda nunca foi a causa.** `.local-a11y-option` já tinha `border: 1px solid transparent` na regra base desde sempre — `--active` só troca `border-color`, nunca `border-width`, então a borda por si só não move nada (confirmado: altura/posição do próprio row idênticas antes/depois em opções isoladas de deslocamento por outra causa).
2. **Causa raiz real: `.local-a11y-category__count`** (a bolha "1", "2" etc. de opções ativas ao lado do nome da categoria). Sua caixa (15px de line-height + 4px de padding = 19px) é mais alta do que o resto do cabeçalho da categoria (~15-17px de conteúdo). Como ela usava `[hidden]` puro (`display:none` quando a contagem é zero), o cabeçalho da categoria crescia ~1.75px assim que a categoria ganhava sua *primeira* opção ativa (a bolha aparecendo, antes ausente do fluxo) — empurrando todas as opções abaixo dela para baixo nesse exato instante, que é precisamente o momento em que o usuário clica numa opção e vê "algo se mexer".
3. Corrigido com a mesma técnica que o usuário sugeriu (reservar o espaço sempre), só que aplicada ao elemento certo: `.local-a11y-category__count[hidden] { display: inline-flex; visibility: hidden; }` — a caixa de 19px passa a existir sempre (mesmo com contagem zero), só ficando visualmente invisível via `visibility:hidden` (que também a remove da árvore de acessibilidade, como `display:none` fazia).
4. **Pegadinha à parte**: essa correção não bastou sozinha — o Bootstrap do tema tem uma regra global `[hidden] { display: none !important; }` (parte do reboot), que batia a minha regra mesmo com maior especificidade, porque `!important` decide antes de especificidade. Precisei marcar `display: inline-flex !important` também.

De passagem, ao investigar, encontrei e corrigi um problema real e separado: como `#local-a11y-panel`/`#local-a11y-fab` vivem dentro de `#page` (o hook `before_footer_html_generation` injeta no `#region-main`, apesar do nome), as regras `body.a11y-readable-font #page *`/`body.a11y-dyslexic-font #page *` (que trocam a fonte da página) também alcançavam o texto do próprio painel — mudando métricas de fonte e potencialmente contribuindo para pequenos desalinhamentos de texto. Corrigido com um par de regras `body.a11y-readable-font #local-a11y-panel, body.a11y-readable-font #local-a11y-panel *, ...` fixando `font-family: var(--a11y-font) !important` de volta — precisou usar seletores por `id` (não `.local-a11y-root`) para igualar a especificidade das regras originais (que usam `#page`) e vencer o empate por ordem no arquivo (mesma especificidade + `!important` = last-one-wins).

Verificado via Playwright, testando em duas categorias diferentes (Tipografia/`readableFont`, Mídia/`hideImages`) com estado limpo (preferência resetada via CLI antes de cada teste): delta de posição = 0px em ambos os casos após a correção (antes: 1.75px). Confirmado também que o texto do painel permanece na fonte `Inter` mesmo com `dyslexicFont`/`readableFont` ativos. PHPUnit 16/16 verde.

## D23 — Banner "perfil ativo" removido; reset consolidado num botão fixo no cabeçalho

A pedido do usuário, dois elementos do cabeçalho do painel foram substituídos por um único botão fixo:

1. `.local-a11y-panel__active-profile` — o banner (ícone + "Perfil ativo" + nome + botão de limpar) que aparecia/desaparecia (`hidden`) logo abaixo da primeira linha do cabeçalho quando um perfil estava ativo.
2. `.local-a11y-panel__reset` — o botão "↺ Restaurar padrões" (também condicional, `hidden` quando `!hasactive`) que ficava depois do banner.

Ambos foram removidos e substituídos por **um** botão (ícone de refresh) dentro de `.local-a11y-panel__header-row`, ao lado do botão de fechar (X):

- **Sempre presente no DOM** (nunca `hidden`) — por isso o cabeçalho passou a ter altura constante (antes, o banner e o botão apareciam/desapareciam, mudando a altura do cabeçalho conforme o estado). Verificado: 74.5px em ambos os estados (com e sem opção ativa).
- **`disabled` (não só visualmente apagado)** quando não há opções ativas — `.local-a11y-panel__reset-icon:disabled { opacity: 0.4; cursor: not-allowed; }`.
- **Colorido** quando há algo ativo: por padrão no `accent` configurado (azul), OU no tom (`--local-a11y-tone-*`) do perfil ativo especificamente, via a mesma cadeia de fallback de variáveis CSS já usada nos cards de perfil (`color: var(--local-a11y-tone-icon, var(--local-a11y-accent, var(--a11y-accent)))`). `amd/src/panel.js::renderActiveProfile()` foi reescrita para copiar as variáveis de tom do card do perfil ativo diretamente para este botão (em vez de para o banner removido), e limpá-las (`removeProperty`) quando nenhum perfil está ativo — deixando a cor cair de volta para o `accent` puro.
- **Tooltip**: `title` + `aria-label` com a string `resetlabel` ("Restaurar padrões"/"Reset all"), mesmo padrão já usado em `profile_card.mustache`.

`amd/src/panel.js::renderHeader()` passou a alternar `resetButton.disabled`/a classe `--active` em vez de `resetButton.hidden`. A string `activeprofile` ("Perfil ativo"), usada só pelo banner removido, foi apagada de `lang/{en,pt_br}/local_a11y.php`. O cenário Behat que verificava o banner (`tests/behat/local_a11y.feature`) foi reescrito para checar `.local-a11y-profile-card--active` no card e `.local-a11y-panel__reset-icon--active`/`[disabled]` no botão em vez do banner inexistente.

Verificado via Playwright: botão desabilitado+apagado sem opções ativas; azul (`rgb(59,130,246)`) com uma opção avulsa ativa; roxo (`#8b5cf6`, tom exato do card) com o perfil Dislexia ativo; volta a desabilitado ao desativar o perfil; altura do cabeçalho idêntica nos três estados. PHPUnit 16/16 verde; ESLint/build AMD limpos.

## D22 — Ícone do rodapé do painel removido

A pedido do usuário, `.local-a11y-panel__footer-icon` (o quadrado com o ícone de check ao lado da mensagem de crédito) foi removido do rodapé do painel — sobra apenas o texto ("Desenvolvido com ❤️ pela **CPTED** para você.") e o atalho `Alt+A`. Removido de ponta a ponta: `<span class="local-a11y-panel__footer-icon">` de `templates/panel.mustache`, o campo `saveiconsvg` de `classes/output/panel.php` (só existia para alimentar esse span) e a regra `.local-a11y-panel__footer-icon` de `styles.css`.

De passagem, também foi removida `.local-a11y-panel__footer-subtitle` de `styles.css` — CSS morto desde D19 (removeu o `<span>`/lang string correspondentes, mas deixou a regra para trás).

Verificado via Playwright (ícone não existe mais no DOM, texto e `Alt+A` continuam intactos) e PHPUnit (16/16 verde).

## D21 — Badge do logo da ONU volta a ser idêntico aos outros ícones (reverte D20)

A pedido do usuário, `.local-a11y-panel__badge` com o logo da ONU deixou de ter tratamento especial: mesmo tamanho (36px/20px, revertendo o aumento de D20 para 41px/28px) e mesma cor de fundo (o tom pastel do `accent`, revertendo o fundo sólido introduzido em D18) dos outros 3 ícones.

Isso só foi possível porque a causa raiz do tratamento especial (D18) foi eliminada, não contornada: `pix/accessibility-un.svg` tinha `fill`/`stroke` fixos em `#fff`, então nunca combinava com o fundo pastel do badge (branco sobre quase-branco). Corrigido a raiz: o SVG passou a usar `currentColor` (igual a todos os outros ícones em `classes/icons.php::PATHS`), então agora herda `color: var(--accent)` do badge normalmente. No FAB (`color: #fff` em `.local-a11y-fab`) o ícone continua branco, sem nenhuma mudança visual lá.

Com isso, removidos: `.local-a11y-panel__badge--un` (CSS), o campo `badgeclass` (`panel.php`/`panel.mustache`) e o branch de re-render em tamanho maior em `panel.php` — nada disso tinha mais razão de existir. `icons::fabicon_svg()` continua retornando `isun`, agora só para o FAB usar (`local-a11y-fab__icon--un`, que só ajusta padding/border-radius, não mais cor).

Verificado via Playwright: badge do logo da ONU agora é 36x36/20px com fundo pastel e `currentColor` resolvendo para o `accent` (idêntico aos outros 3 ícones); FAB continua branco, sem mudança. PHPUnit 16/16 verde.

## D20 — Badge do logo da ONU maior que o dos outros ícones (revertido em D21)

A pedido do usuário, `.local-a11y-panel__badge.local-a11y-panel__badge--un` (badge do cabeçalho do painel, só quando o ícone configurado é o logo da ONU) passou de 36px para 41px, e o SVG dentro dele de 20px para 28px — os outros 3 ícones (`accessibility`/`sparkles`/`user`) continuam em 36px/20px.

O SVG de `pix/accessibility-un.svg` usa `viewBox="0 0 1000 1000"` com `stroke-width` definido nesse mesmo espaço de coordenadas (32.9 unidades) — então aumentar apenas o `width`/`height` do `<svg>` (28 em vez de 20) já escala a grossura das linhas na mesma proporção automaticamente, sem precisar tocar no valor de `stroke-width`. `classes/output/panel.php` foi ajustado para re-renderizar com `icons::un_accessibility_svg(28)` só quando o ícone é o `un` (em vez de esticar via CSS a versão de 20px, que deixaria as linhas borradas).

Verificado via Playwright: badge do logo da ONU renderiza em 41x41 com svg 28x28 (`stroke-width` continua "32.9" no atributo, a grossura visual escala junto); trocando para outro ícone no admin, badge volta a 36x36/20 normalmente. PHPUnit 16/16 verde.

## D19 — Rodapé do painel: mensagem de crédito no lugar de "Preferências salvas"

A pedido do usuário, o texto do rodapé do painel (`savetitle`/`savesubtitle`, antes "Preferências salvas" / "Suas configurações são lembradas em todas as páginas do Moodle.") foi substituído por uma única mensagem de crédito: "Desenvolvido com ❤️ pela **CPTED** para você." (pt_br) / "Made with ❤️ by **CPTED**, for you." (en, tradução equivalente já que `en` é canônico — ver CLAUDE.md), com "CPTED" em negrito. O atalho `Alt+A` (`<kbd>` fixo no template, não vem de lang string) foi mantido intacto, conforme pedido.

Como a mensagem virou uma frase única, a string `savesubtitle` (e o `<span class="local-a11y-panel__footer-subtitle">` que a exibia) foi removida — não fazia sentido manter um segundo parágrafo vazio. `savetitle` passou a conter `<strong>CPTED</strong>` deliberadamente; `templates/panel.mustache` foi ajustado de `{{savetitle}}` (escapado) para `{{{savetitle}}}` (raw) para não exibir a tag literalmente como texto, com um comentário Mustache explicando o motivo (mesmo padrão de qualquer outro `{{{...}}}` do template, que já é reservado a SVGs confiavelmente estáticos — aqui a "confiança" é a mesma: a string vem de `get_string()`, não de entrada de usuário).

Verificado via Playwright: `<strong>CPTED</strong>` renderiza em negrito (font-weight computado maior que o resto do título), `Alt+A` continua visível, PHPUnit 16/16 verde.

## D18 — Badge do cabeçalho do painel passa a usar o mesmo ícone do FAB

A pedido do usuário, `.local-a11y-panel__badge` (o quadrado colorido no cabeçalho do painel) deixou de ser hardcoded para o ícone Lucide `accessibility` e passou a refletir o mesmo ícone configurado em `local_a11y/fabicon` — o mesmo que o FAB mostra.

A lógica de resolução do ícone (antes só em `fab.php`) foi extraída para `icons::fabicon_svg(string $fabicon, int $size): array`, retornando `['svg' => ..., 'isun' => bool]`; `fab.php` e `panel.php` agora chamam o mesmo método, então os dois nunca podem ficar dessincronizados.

Como o logo da ONU é um asset branco sólido (não um ícone `currentColor`), ele não fica legível no fundo padrão do badge (um tom pastel do `accent`, ~14% de opacidade) — precisaria de um branco sobre quase-branco. Corrigido com uma classe modificadora (`local-a11y-panel__badge--un`, aplicada só quando `isun`) que troca o fundo do badge para o `accent` sólido nesse caso — mesmo tratamento visual que o próprio FAB já dá a esse ícone. Os demais 3 ícones (`accessibility`/`sparkles`/`user`) continuam no fundo pastel de sempre.

Nota à parte: em algum momento após D17 o arquivo `pix/accessibility-un.svg` foi re-exportado (variante monocromática branca, sem mais o azul `#53C2EE`) usando um `<defs><style>.st0{...}.st1{...}</style></defs>` gerado pelo Illustrator — reintroduzindo o mesmo risco que D17 tinha evitado (classes CSS genéricas que vazam para a página inteira quando o SVG é inserido inline via `{{{iconsvg}}}`). Normalizado da mesma forma que da primeira vez: `<style>`/`class` trocados por atributos de apresentação (`fill`/`stroke`) diretamente nos `<g>`, geometria/cores idênticas, verificado visualmente lado a lado antes/depois.

Verificado via Playwright: com `fabicon=un` (padrão), badge mostra o logo da ONU em fundo `accent` sólido; trocando para `sparkles` no admin, badge e FAB mudam juntos para o ícone Lucide no fundo pastel de sempre. PHPUnit 16/16 verde.

## D17 — Ícone padrão do FAB trocado para o logo de acessibilidade da ONU

A pedido do usuário, o ícone padrão do botão flutuante passou a ser o
["Accessibility logo (UN)"](https://commons.wikimedia.org/wiki/File:Accessibility_logo.svg)
(Wikimedia Commons, CC BY-SA 4.0) em vez do ícone Lucide `accessibility` usado
até então. Diferente de todos os outros ícones do plugin (que são ícones Lucide
de traço único, renderizados com um wrapper `<svg>` compartilhado em
`icons::svg()` — `stroke="currentColor"`, sem preenchimento próprio), esse é um
logo de duas cores fixas (contorno preto + `#53C2EE`), então:

- Baixado e salvo localmente em `pix/accessibility-un.svg` (nunca carregado da
  Wikimedia em tempo de execução — mesma regra já seguida para as fontes, ver
  D8). O bloco `<style>`/classes CSS do arquivo original foi substituído por
  atributos de apresentação inline equivalentes nos `<g>`, porque o SVG é
  injetado *inline* na página via `{{{iconsvg}}}` (Mustache não-escapado) —
  um `<style>` com classes genéricas (`.c1`/`.c2`) correria risco real de
  colidir com CSS de outros elementos já presentes na página do Moodle.
  Geometria (paths/circles) idêntica ao arquivo original — verificado
  visualmente lado a lado antes/depois da limpeza.
- Ganhou seu próprio método `classes/icons.php::un_accessibility_svg()` (em
  vez de uma entrada em `icons::PATHS`), já que seu viewBox (`0 0 1000 1000`)
  e wrapper diferem do padrão Lucide de 24x24.
- `templates/fab.mustache` ganhou uma classe modificadora opcional
  (`iconclass`) e `styles.css` dá a esse ícone especificamente uma pequena
  base circular branca (`local-a11y-fab__icon--un`), já que suas cores fixas
  (ao contrário dos ícones `currentColor`) não se adaptam à cor de destaque
  (`accent`) configurada pelo admin — sem a base branca, o contorno preto
  ficaria pouco legível contra um `accent` escuro.
- Novo valor `'un'` adicionado ao `admin_setting_configselect` de
  `local_a11y/fabicon` (`settings.php`) e virou o novo default (era
  `'accessibility'`), com o mesmo fallback espelhado em
  `config::get_appearance()`. Os outros 3 ícones (`accessibility`/`sparkles`/`user`)
  continuam disponíveis no seletor.
- Atribuição CC BY-SA 4.0 documentada em `README.md` (obrigatória pela
  licença) e no comentário de cabeçalho do próprio `pix/accessibility-un.svg`.

## D16 — Correção pós-entrega #2: cor/contraste ainda não alcançava toda a página (`#page` → `#page-wrapper`)

Após D14, o usuário reportou que Contraste/Inverter Cores/Mudar Cores/Saturação ainda não se aplicavam a "todos os elementos da página". O usuário sugeriu, com base no CSS do protótipo (que usa `.moodle-shell` como alvo do `filter`), trocar o seletor-alvo pelo elemento real equivalente do Moodle — apontando `#page-wrapper` em vez de `#page`.

Investigação no DOM real (não só no protótipo) confirmou a causa exata: `#page-wrapper` > (`nav.navbar` do topo, o *drawer* do índice do curso `#theme_boost-drawers-courseindex`, o menu do usuário) **e** `#page` são todos irmãos dentro de `#page-wrapper` — ou seja, a navbar principal, o drawer do índice e o menu do usuário ficam **fora** de `#page`. Como D14 tinha escopado o `filter` combinado (Inverter/Mudar Cores/Saturação) e os overrides de cor de link de contraste a `#page`, esses três elementos de chrome nunca eram atingidos, exatamente o sintoma relatado.

Corrigido trocando o alvo de `#page` para `#page-wrapper` em `styles.css`: a pilha de variáveis `--a11y-filter-invert/saturate/color` e a regra `filter:` combinada (antes em `#page`), e os overrides `#page a:not(.btn)` de cor de link nos 3 níveis de contraste. Também adicionado `.navbar` à lista de fundo com cor "hardcoded" do Contraste nível 2 (só nível 1 e 3 tinham; inconsistência encontrada durante a correção).

`#local-a11y-fab`/`#local-a11y-panel` continuam dentro de `#page-wrapper` (na verdade sempre estiveram dentro de `#page` também — o hook `before_footer_html_generation` injeta o HTML deles dentro de `#region-main`, não como irmão de `#page-wrapper` como o nome do hook sugeriria) e continuam **imunes** aos filtros: verificado empiricamente com Playwright comparando a cor real (pixel, não `getComputedStyle`, que não reflete o resultado de `filter`) do FAB antes/depois de ativar Inverter Cores — permanece azul idêntico nos dois casos. Isso confirma que `.local-a11y-root { filter: none !important; }` de fato exclui o elemento do filtro do ancestral no Chromium (cada elemento com `filter` próprio é compositado como camada independente, não como parte de um único raster do subtree do ancestral).

Verificado via Playwright: navbar e drawer do índice do curso agora escurecem/inverte/mudam de cor junto com o resto da página nos 3 modos afetados; nível 3 de contraste agora deixa a navbar preta com links amarelos (antes ficava branca); FAB permanece imune em todos os casos. Limitação residual da `.moremenu` (D14) permanece — cosmética, texto legível, não revisitada aqui.

## D15 — Auditoria de segurança pós-entrega

A pedido do usuário ("verificar se nosso código não expõe nenhuma brecha de segurança"), foi feita uma auditoria cobrindo (a) exposição HTTP indevida do servidor web e (b) padrões de código inseguros no próprio plugin. Dois achados, ambos corrigidos:

1. **Crítico — exposição pública de todo o diretório do plugin via Apache.** Consequência direta de D1b: o repositório git *é* o diretório de instalação real dentro de `public/local/a11y/`, então tudo que vive no repo (não só os arquivos que o Moodle espera de um plugin) ficava dentro do docroot servido pelo Apache. Confirmado via `curl` que retornavam HTTP 200 (e, no caso de `.git/objects/`, *directory listing* navegável): `.git/` inteiro (histórico completo, clonável por HTTP "dumb protocol" sem autenticação), `ENVIRONMENT.md` (que contém a senha do admin de desenvolvimento em texto puro), `CLAUDE.md`, `PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `_design-reference/`, `_verification/`, `tests/*.php`, `local_a11y.zip`. Causa raiz: o vhost (`/etc/apache2/sites-available/moodle.conf` e `moodle-behat.conf`) nunca sobrescrevia o `Options Indexes FollowSymLinks` global de `/etc/apache2/apache2.conf` (linha 171) nem negava explicitamente nada além do que o próprio Moodle já nega, e `AllowOverride None` no vhost torna qualquer `.htaccess` inerte — a correção precisava ser no vhost, não no plugin.

   Corrigido adicionando a ambos os vhosts, dentro do `<Directory /var/www/moodle/public>`: `Options -Indexes +FollowSymLinks` (desliga listagem, mantém symlinks que o Moodle usa internamente); um `<DirectoryMatch "/\.git">` com `Require all denied` global (cobre `.git` em qualquer plugin, não só o nosso); e um `<LocationMatch>`/`<FilesMatch>` escopados a `local/a11y` negando `_design-reference/`, `_verification/`, `tests/`, os `.md` de instruções, `local_a11y.zip`, `phpunit.xml` e os dotfiles de lint. Validado com `apache2ctl configtest`, `systemctl reload apache2` e uma bateria de `curl` confirmando 403 em todos os caminhos sensíveis acima, 200 mantido em `styles.css`/`amd/build/*.min.js`/`pix/*` (o que o Moodle realmente precisa servir), e o site continuando a renderizar o FAB normalmente. Como a senha `A11yDev2026!` ficou exposta por um tempo (e permanece no histórico do git, ainda que o repositório no GitHub seja privado), foi trocada por precaução.

2. **Baixo risco — `amd/src/voice_commands.js::buildPill()` interpolava uma variável diretamente dentro de um template literal atribuído a `innerHTML`.** O valor (`listeningLabel`) vinha sempre de `getString()` (strings de idioma do próprio plugin, nunca de entrada do usuário), então não era explorável hoje, mas é um padrão perigoso caso a função algum dia receba texto de outra origem. Corrigido: o `innerHTML` agora contém só marcação estática (o ícone SVG), e o rótulo dinâmico é atribuído separadamente via `el.querySelector('[data-region="text"]').textContent = listeningLabel`. Rebuild de AMD (`grunt amd`) e reverificado via Playwright que o *pill* de comando de voz continua renderizando e sem erros de console.

Também revisado e confirmado **sem problemas** (nenhuma mudança necessária):
- `classes/`, `db/`, `lib.php`, `settings.php`: sem SQL cru fora de `$DB->`, sem `exec`/`shell_exec`/`system`/`passthru`/`eval`/`unserialize`/`extract`, sem leitura direta de superglobais (`$_GET`/`$_POST`/`$_REQUEST`) fora de `required_param`/`optional_param`.
- Acesso HTTP direto a `classes/manager.php`, `db/hooks.php`, `db/access.php`, `settings.php`, `lib.php`, `version.php` fora do bootstrap do Moodle retorna 200 com corpo vazio — inofensivo (definições de classe/dados puras, ou blocos gated por `$hassiteconfig`), comportamento padrão de plugin Moodle.
- Os demais 5 usos de `innerHTML` em `amd/src/` (`virtual_keyboard.js` ×2, `screen_reader.js` ×1, `panel.js` ×1) são marcação estática sem interpolação, ou copiam markup entre elementos já renderizados pelo próprio servidor (`panel.js::renderActiveProfile`, entre dois ícones vindos de `classes/icons.php`) — nenhuma entrada de usuário chega a um `innerHTML`.
- `classes/output/renderer.php::render_nofouc_script()` monta um `<script>` inline com valores vindos do servidor (preferências do usuário logado, mapas de classes), mas todos passam por `json_encode()` antes de entrar no JS — não há concatenação de string crua no contexto de script.
- Não existe endpoint AJAX/webservice próprio do plugin (`external.php`/`services.php` não existem) — toda escrita de preferência do usuário passa pela rota `core_user/repository` do próprio Moodle core (`amd/src/storage.js`), que já garante `sesskey` e capacidade — nada de CSRF customizado para auditar.
- `db/access.php`: `local/a11y:view` é `CAP_ALLOW` para todos os arquétipos incluindo `guest` (intencional — o overlay de acessibilidade deve funcionar antes do login); `local/a11y:configure` (escrita) é restrita a `manager`. `classes/config.php` usa `has_capability('local/a11y:view', ...)` para gatear a exibição do FAB/painel.
- `classes/manager.php::sanitize_settings()` (servidor) e `amd/src/storage.js::sanitize()` (cliente) clampam valores tipo *stepper* ao intervalo esperado e forçam booleanos — nenhum valor arbitrário de `localStorage`/preferência do usuário chega a nome de classe CSS sem sanitização.
- `classes/config.php::current_page_excluded()` constrói regex a partir do setting `excludedpages` (só editável por `manager`) usando `preg_quote()` antes de expandir `*`→`.*`; risco de ReDoS/injeção considerado desprezível mesmo por um admin malicioso.

## D1 — Estrutura do repositório de trabalho (revisado — ver D1b)

~~Decisão original: repositório git dedicado em `/var/www/moodle/public/local/a11y/`, plugin em `local/a11y/` dentro dele, symlinkado para `/var/www/moodle/public/local/a11y`.~~ **Revertida — ver D1b**: o build AMD do Moodle (`grunt amd`, especificamente `.grunt/babel-plugin-add-module-to-define.js`) resolve o *realpath* do arquivo-fonte antes de calcular o nome do módulo AMD a partir do `cwd`; como o symlink aponta para fora da árvore do Moodle, `fs.realpathSync()` escapa do `cwd` e o cálculo do nome do módulo falha (`Unable to find module name for ...`). Não é possível compilar AMD com o plugin fora da árvore do Moodle.

## D1b — Repositório = diretório real dentro do Moodle (decisão final)

O repositório git agora tem raiz em `/var/www/moodle/public/local/a11y/` (diretório real, não symlink). O plugin (`version.php`, `db/`, `classes/`, `amd/`, `templates/`, `lang/`, `styles.css`, `fonts/`, `pix/`, `tests/`) fica na raiz do repo (equivalente a "ser" o `local/a11y/` pedido pelo briefing — como é praticamente universal em repositórios de plugins Moodle reais, ex. `moodle-local_a11y` no GitHub tem `version.php` na raiz do repo, não em `local/a11y/version.php` dentro dele). `_design-reference/`, `_verification/`, `CLAUDE.md`, `PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `ENVIRONMENT.md` ficam **também** na raiz do repo, como pedido — o Moodle ignora arquivos/diretórios que não reconhece (não quebra phpcs/mustache-lint/plugin-scan, que só olham para nomes de arquivo específicos).

Permissões: `/var/www/moodle` é `www-data:www-data` 750. Para que o usuário do shell (`padilha`, sem grupo `www-data`) consiga editar os arquivos diretamente (as tools de edição não passam por `sudo`), apliquei `chmod o+rx` apenas nos diretórios ancestrais `/var/www/moodle`, `/var/www/moodle/public`, `/var/www/moodle/public/local` (travessia, não escrita/listagem), e `chown padilha:padilha` + `chmod -R a+rX` recursivo em `public/local/a11y` (padilha escreve direto; `www-data`/Apache continuam lendo via bit "outros"). Isso é aceitável neste host de desenvolvimento de uso único; não seria uma escolha de produção.

## D2 — Ambiente já existia

O host já tinha Moodle 5.2.1 + PostgreSQL + Apache funcionando (ver ENVIRONMENT.md). Não foi necessário provisionar via moodle-docker nem `admin/cli/install.php`. Apenas instalei `nodejs`/`npm` (ausentes) para o build AMD.

## D3 — moodle-page.jsx

Confirmado o aviso do briefing: `moodle-page.jsx` é mockup do Moodle usado só para demonstrar o protótipo isolado. Foi importado para `_design-reference/` por completude/rastreabilidade, mas **não** será portado — as páginas reais do Moodle (dashboard, curso, atividade) fazem esse papel.

## D4 — tweaks-panel.jsx → settings.php

`tweaks-panel.jsx` é o harness de edição do próprio Claude Design (protocolo `postMessage` com o host de design), não faz parte do produto final. Os *valores* que ele edita (`fabPosition`, `fabIconStyle`, `fabShape`, `panelFormat`, `density`, `accent`, `showProfiles`, `language`) definem 1:1 as settings de admin em `settings.php` conforme a seção 5.4 do briefing. O componente React/protocolo em si não é portado.

## D5 — Idioma do painel

`STRINGS` do protótipo tem chaves `pt-BR` e `en`; Moodle usa `pt_br` como código de idioma de plugin (`lang/pt_br/local_a11y.php`) e resolve o idioma efetivo via `current_language()`. O JS usa `M.cfg.language` (normalizado para `pt-BR`/`en`) para decidir qual conjunto de strings buscar — mas como strings vêm do `core/str` do Moodle (`get_strings`) em vez de hardcoded, o plugin herda automaticamente qualquer idioma adicional instalado no site sem precisar do fallback pt-BR/en do protótipo.

## D6 — Filtros de daltonismo com `<svg><filter>`

Especificado no briefing: comportamento visual (hue-rotate/sepia via CSS `filter`, como no protótipo) mantido igual — SVG `<filter>` com matrizes de cores é usado só para robustez em navegadores/telas onde CSS filter composto (`invert() saturate() hue-rotate()`) causa artefatos; a saída visual permanece equivalente ao protótipo.

## D7 — `local/a11y:view` para guest/frontpage

O FAB deve aparecer mesmo para visitantes não autenticados (`showforguests` setting, default ligado) — capability `local/a11y:view` com `CAP_ALLOW` para `guest`, `user`, `frontpage` nos `archetypes` de `db/access.php`, e fallback de persistência via `localStorage` para quem não está logado, migrando para `user_preference` no primeiro login (conforme briefing seção 3).

## D10 — Persistência via `core_user/repository`, sem `user_preference_allow_ajax_update()`

O briefing pedia `user_preference_allow_ajax_update()` + `core_user/repository::setUserPreference` (AMD). A primeira parte **não existe mais** nesta versão do Moodle: `user_preference_allow_ajax_update()`, `M.util.set_user_preference` e `lib/ajax/setuserpref.php` foram **removidos** (ver `public/user/UPGRADING.md`, MDL-79124), substituídos por uma rota REST (`/api/rest/v2/user/{user}/preferences/{preference}`, `public/user/classes/route/api/preferences.php`) que exige a preferência **registrada** via um *callback* de plugin `{component}_user_preferences()` em `lib.php` (descoberto via `get_plugins_with_function('user_preferences')`), retornando `['null' => NULL_ALLOWED, 'default' => null, 'type' => PARAM_RAW]` — o mesmo padrão usado por `mod_forum`, `theme_boost` etc. Implementado em `lib.php::local_a11y_user_preferences()`. Sem esse registro, `POST` na rota falha com HTTP 400 "Valor inválido de parâmetro detectado" (`invalid_parameter_exception` em `core_user\route\api\preferences::set_single_preference()`), pois `core\user::get_preference_definition()` não reconhece a chave.

O restante da segunda parte do pedido (`core_user/repository::setUserPreference` via AMD) foi seguido à risca — `amd/src/storage.js` usa exatamente esse módulo.

## D14 — Correção pós-entrega: efeitos de Contraste/Inverter/Mudar Cores/Saturação/Modo Foco não funcionavam de verdade

Após a entrega do M8, o usuário reportou que vários efeitos não funcionavam corretamente em uso real. Investigação encontrou **dois bugs distintos**, ambos no `styles.css` (nenhum no JS/PHP):

1. **Bug crítico (Inverter Cores, Mudar Cores, Saturação totalmente inertes)**: a regra que de fato aplica o `filter` combinado estava condicionada a `body.a11y-active #page { filter: ... }`, mas **nenhum código JS jamais adiciona a classe `a11y-active` ao `<body>`** — ela nunca existiu em `manager::get_boolean_class_map()`/`effects.js`, era resquício de uma ideia abandonada. Resultado: as variáveis `--a11y-filter-invert`/`--a11y-filter-saturate`/`--a11y-filter-color` eram definidas corretamente pelas classes `a11y-invert`/`a11y-saturation-N`/`a11y-color-N`, mas nunca consumidas. Corrigido tornando a regra `#page { filter: ...}` incondicional (as variáveis não usadas resolvem para vazio, então é inofensivo quando nada está ativo) — mesmo padrão do `.moodle-shell` original do protótipo, que nunca teve esse gate.

2. **Bug de cobertura (Contraste só mudava bg/nav/texto, Modo Foco só escondia um item)**: o CSS de M3 usava seletores calcados no protótipo (`.m-page`, `.m-card` etc., que são classes do **mock** em `moodle-page.jsx`) ou seletores Moodle genéricos demais (`#page`, `.navbar`). O Moodle real (tema Boost/Bootstrap 5.3) tem duas categorias de superfícies visuais bem diferentes:
   - Componentes Bootstrap genéricos (`.card`, `.dropdown-menu`, `.popover`, `.modal-content`) — herdam `background-color` de variáveis CSS próprias (`--bs-card-bg: var(--bs-body-bg)` etc., confirmado no CSS compilado do tema), então sobrescrever `--bs-body-bg`/`--bs-body-color`/`--bs-link-color`/`--bs-border-color` (e os pares `-rgb`, usados por utilitários como `.bg-body`) em `body.a11y-contrast-N` já re-tema esses automaticamente, sem precisar enumerar cada componente.
   - Regiões estruturais do **próprio Moodle** (`#region-main`, `.main-inner`, `.drawer`, `.moremenu`) — têm `background-color` **hardcoded** no CSS compilado (`#region-main{background-color:#fff}`), completamente alheias às variáveis do Bootstrap. Essas precisam de override explícito com `!important` por seletor.

   A correção final combina as duas abordagens: variáveis `--bs-*` (cobre componentes genéricos em qualquer página, inclusive fora do curso) **+** overrides explícitos e `!important` na lista `#region-main, .main-inner, .drawer, .moremenu, .card, .bg-white, .dropdown-menu, .popover, .modal-content, footer#page-footer` (cobre as regiões hardcoded do Moodle). Modo Foco similarmente trocou os seletores do mock (`[data-region="blocks-column"]`) por estrutura real do tema Boost (`#theme_boost-drawers-courseindex`, `#theme_boost-drawers-primary`, `.secondary-navigation`, `.drawertoggle`).

   Verificado via Playwright com checagem de `getComputedStyle` (não só screenshot, já que uma investigação preliminar mostrou que `document.querySelector('.card')`/`.section.card` no DOM real correspondia a elementos fora de tela — resquício da versão pré-hidratação-JS do curso, não a seção visível; o seletor certo passou a ser validado por `elementFromPoint()` + `getBoundingClientRect()`), confirmando `#region-main`, `.main-inner`, `.moremenu`, `.navbar`, o drawer do índice do curso e os cards de seção todos corretamente escurecidos/reclareados/altíssimo-contraste conforme o nível.

   **Limitação residual conhecida e aceita**: a barra de abas secundária (`.moremenu`, tag `<nav class="moremenu navigation observed">`) tem `getComputedStyle` correto (confirmado programaticamente) mas ocasionalmente pinta com a cor antiga em capturas de tela do Chromium headless — muito provavelmente uma reafirmação de estilo inline feita pelo próprio JS de scroll do Moodle (`observed` sugere um `IntersectionObserver` que ajusta o visual dessa barra ao rolar), correndo em paralelo ao nosso CSS. Texto permanece legível (não é uma falha de contraste/acessibilidade), e o problema é cosmético, isolado a esse elemento específico — não investigado mais a fundo dado o custo/benefício.

## D13 — Empacotamento: `zip` não inclui dotfiles recursivamente por padrão

Ao gerar `local_a11y.zip`, um `rsync --exclude='.eslintrc'` (sem barra inicial) removeu **todas** as ocorrências de `.eslintrc` na árvore, inclusive `amd/src/.eslintrc` (que é funcional, não é o `.eslintrc` de conveniência da raiz — ver M2). Corrigido ancorando os padrões de exclusão à raiz (`--exclude='/.eslintrc'`). Isso só afetou o artefato do ZIP de distribuição, nunca o repositório git (que sempre teve o arquivo correto) nem a instalação em disco durante o desenvolvimento. Validado publicando o ZIP corrigido e comparando `git status` após reinstalar por cima — sem diffs inesperados.

## D12 — Behat com cenários `@javascript` escrito mas não executado

`tests/behat/local_a11y.feature` foi escrito (steps genéricos documentados do `behat_general.php`, sem *step definitions* customizadas), e o ambiente Behat foi inicializado com sucesso (`admin/tool/behat/cli/init.php`, incluindo build de CSS de Boost e Classic). A **execução** dos cenários `@javascript` exige um WebDriver clássico (Selenium + chromedriver na mesma major version do navegador), que este host não tinha; a tentativa de montar isso rapidamente (Java + `npm i chromedriver`) esbarrou em descasamento de versão com o Chromium do Playwright e problema de permissão de cache entre os usuários `padilha`/`www-data`. Decisão: não persegui uma instalação completa de Selenium (custo desproporcional nesta sessão) e, em vez disso, verifiquei os mesmos dois cenários do `.feature` (mudar Tamanho do Texto + reload persiste; aplicar/desfazer perfil Dislexia) de ponta a ponta com Playwright real contra o Moodle rodando, com captura de tela — ver `_verification/m3/`, `_verification/m4/` e ENVIRONMENT.md para os detalhes e o caminho para terminar a configuração do Selenium depois.

O **axe-core** (também amarrado ao mesmo WebDriver na integração `--axe` do Behat) foi rodado com sucesso de forma independente, via Playwright + `axe-core` injetado na página real — ver M7 em PROGRESS.md e `_verification/m7/`.

## D11 — `templates/virtual_keyboard.mustache` não foi criado

A seção 4 do briefing lista `templates/virtual_keyboard.mustache` entre os templates a criar. Decidi **não** criá-lo: ao contrário do FAB/painel (que precisam ser renderizados no servidor para o no-FOUC e para SEO/acessibilidade sem JS), o teclado virtual só existe quando o usuário ativa a opção correspondente — é inteiramente client-side, criado/destruído por `amd/src/virtual_keyboard.js` via DOM puro. Um template Mustache exigiria buscá-lo de forma assíncrona via `core/templates` (`Templates.renderForPromise`) toda vez que a opção é ligada, sem nenhum ganho real (a estrutura muda de qualquer forma a cada toggle de Shift, o que já é regenerado em JS). Optei por manter a paridade de estrutura HTML/CSS (classes `local-a11y-vk__*` já definidas em `styles.css`) sem o round-trip assíncrono desnecessário.

## D9 — Subconjunto de `ICON_PATHS` portado

`classes/icons.php` porta todos os ícones usados pelo FAB, painel, perfis, categorias e recursos avançados (teclado virtual, leitor de tela) — 1:1 com o protótipo. Os ícones que só existiam em `ICON_PATHS` para desenhar o **mockup** do Moodle (`moodleLogo`, `menu`, `home`, `calendar`, `fileText`, `video`, `edit`, `clipboard`, `messageSquare`, `folder`, `award`, `users`, `graduationCap`, `settings`, `logOut`, `download`, `upload`, `globe`) foram omitidos, consistente com D3 (moodle-page.jsx não é implementado — o Moodle real já tem seus próprios ícones/tema). Nenhum ícone usado por OPTIONS, PROFILES ou pela chrome do painel foi omitido ou renomeado.

## D8 — Fontes locais

`Atkinson Hyperlegible` e `Lexend` empacotadas em `local/a11y/fonts/` (WOFF2, subconjunto latin) em vez de Google Fonts (bloqueio de CDN institucional / LGPD), conforme já determinado no briefing — registrado aqui apenas para consolidar a fonte exata usada (peso 400/700 Atkinson, 400/500/600 Lexend, batendo com o `<link>` do protótipo).
