# local_a11y — Referência de Templates Mustache

Compilado a partir dos comentários `{{! ... }}` no topo de cada arquivo em `templates/`. Não existe um gerador de documentação padrão para Mustache (ao contrário de PHPDoc/JSDoc/KSS), então esta referência é montada manualmente a partir do que já está documentado no código-fonte.

- **Autor:** Rodrigo Padilha Silveira <padilhars@gmail.com>
- **Copyright:** Universidade Federal de Pelotas - UFPel
- **Versão:** 0.1.0

---

## `local_a11y/fab`

**Arquivo:** `templates/fab.mustache`

O botão flutuante de acessibilidade (FAB).

**Variáveis de contexto:**

| Variável | Descrição |
|---|---|
| `positionclass` | Classe CSS modificadora para a posição do FAB |
| `shapeclass` | Classe CSS modificadora para formato círculo/quadrado |
| `iconclass` | Classe CSS extra opcional para o wrapper do ícone (string vazia se nenhuma) |
| `iconsvg` | Markup `<svg>` inline cru |
| `ariaopenlabel` | Rótulo acessível quando fechado |
| `accent` | Cor de acento em hex |

**Exemplo de contexto (JSON):**
```json
{
    "positionclass": "local-a11y-fab--bottom-right",
    "shapeclass": "local-a11y-fab--circle",
    "iconclass": "",
    "iconsvg": "<svg></svg>",
    "ariaopenlabel": "Open accessibility panel",
    "accent": "#3b82f6"
}
```

---

## `local_a11y/option_stepper`

**Arquivo:** `templates/option_stepper.mustache`

Uma linha de opção de acessibilidade multi-nível (controle stepper cíclico).

**Variáveis de contexto:**

| Variável | Descrição |
|---|---|
| `id` | Id da opção, ex. `"textSize"` |
| `iconsvg` | Markup `<svg>` inline cru |
| `label` | Texto do rótulo da opção |
| `desc` | Texto de descrição da opção ou `null` |
| `max` | Índice do nível mais alto |
| `levelprefix` | Prefixo de string de idioma usado pelo JS para re-rotular ao ciclar |
| `currentlabel` | Rótulo de texto do nível atual |
| `levels` | Array de `{index, active}` |

**Exemplo de contexto (JSON):**
```json
{
    "id": "textSize",
    "iconsvg": "<svg></svg>",
    "label": "Text Size",
    "desc": null,
    "max": 4,
    "levelprefix": "level_",
    "currentlabel": "Default",
    "levels": [
        {"index": 0, "active": true},
        {"index": 1, "active": false}
    ]
}
```

---

## `local_a11y/option_toggle`

**Arquivo:** `templates/option_toggle.mustache`

Uma linha de opção de acessibilidade booleana (controle switch).

**Variáveis de contexto:**

| Variável | Descrição |
|---|---|
| `id` | Id da opção, ex. `"readableFont"` |
| `iconsvg` | Markup `<svg>` inline cru |
| `label` | Texto do rótulo da opção |
| `desc` | Texto de descrição da opção ou `null` |

**Exemplo de contexto (JSON):**
```json
{
    "id": "readableFont",
    "iconsvg": "<svg></svg>",
    "label": "Readable Font",
    "desc": "Applies Atkinson Hyperlegible"
}
```

**Nota de acessibilidade:** não há `role`/`tabindex` no `<div>` externo — o `<button>` aninhado é o único controle focável (WCAG/axe "nested-interactive" proíbe um `div[role=button]` envolvendo um `<button>` real). Clicar em qualquer lugar da linha ainda funciona via delegação de evento em `amd/src/panel.js`.

---

## `local_a11y/panel`

**Arquivo:** `templates/panel.mustache`

O painel de acessibilidade: cabeçalho, busca, perfis predefinidos, categorias de opções colapsáveis e rodapé. Renderizado oculto (fechado); `amd/src/panel.js` cuida de abrir/fechar, filtro de busca, colapso de categoria e aplicação das configurações salvas do usuário.

**Variáveis de contexto:** ver `classes/output/panel.php` (contexto complexo, gerado programaticamente — inclui título, subtítulo, ícones, lista de perfis, lista de categorias/opções, classes de formato/posição/densidade e cor de acento).

---

## `local_a11y/profile_card`

**Arquivo:** `templates/profile_card.mustache`

Um card de perfil de acessibilidade predefinido.

**Variáveis de contexto:**

| Variável | Descrição |
|---|---|
| `id` | Id do perfil, ex. `"lowVision"` |
| `iconsvg` | Markup `<svg>` inline cru |
| `label` | Texto do rótulo do perfil |
| `desc` | Texto de descrição do perfil (usado como atributo `title`) |
| `bg`, `text`, `iconcolor`, `border` | Cores hex do "tom" do perfil |

**Exemplo de contexto (JSON):**
```json
{
    "id": "lowVision",
    "iconsvg": "<svg></svg>",
    "label": "Low Vision",
    "desc": "Larger text, high contrast, big cursor",
    "bg": "#eff6ff",
    "text": "#1d4ed8",
    "iconcolor": "#3b82f6",
    "border": "#dbeafe"
}
```
