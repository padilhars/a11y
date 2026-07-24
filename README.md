# local_a11y — A11y for Moodle

Um plugin de acessibilidade para Moodle 5.0+ que adiciona um botão flutuante (FAB) e um painel com **22 opções de acessibilidade** organizadas em 5 categorias e **9 perfis prontos**, disponível em qualquer página do site. Réplica fiel do protótipo criado no Claude Design (`_design-reference/`, mantido no repositório apenas como referência somente-leitura, nunca enviado para produção).

![Painel aberto mostrando os perfis de acessibilidade](_verification/m2/02-panel-open.png)

## Requisitos

- Moodle 5.0 ou superior.
- PHP 8.2+.
- Nenhuma dependência externa em tempo de execução (as fontes Atkinson Hyperlegible e Lexend são empacotadas localmente; nada é carregado de CDNs de terceiros).

## Instalação

1. Extraia `local_a11y.zip` de forma que o diretório `a11y` fique em `<moodleroot>/local/a11y` (layout Moodle 5.0+: dentro do webroot, ou seja `<moodleroot>/public/local/a11y` se o seu checkout já usa a nova estrutura com `public/`).
2. Acesse **Administração do site → Notificações** para concluir a instalação, ou rode:
   ```bash
   php admin/cli/upgrade.php --non-interactive
   ```
3. Pronto — o botão de acessibilidade já aparece em todas as páginas para todos os usuários (inclusive visitantes, por padrão).

## O que o plugin faz

### Botão flutuante + painel

- Botão circular (ou quadrado) fixo, canto configurável, com contador de opções ativas.
- Painel com busca, perfis de acessibilidade, categorias colapsáveis e rodapé com atalho de teclado.
- **Atalho global `Alt + A`** abre/fecha o painel de qualquer página.
- Focus trap (WCAG 2.2), `Esc` fecha e devolve o foco ao botão, `aria-live` no contador de opções ativas.

### As 22 opções (5 categorias)

| Categoria | Opções |
|---|---|
| Texto e Tipografia | Fonte Legível, Fonte para Dislexia, Destacar Títulos/Links/Botões, Tamanho do Texto, Altura da Linha, Espaçamento do Texto |
| Cores e Contraste | Contraste (4 níveis), Inverter Cores, Mudar Cores (filtros de daltonismo via SVG), Saturação |
| Mídia e Animação | Ocultar Imagens, Pausar Animações, Dicas de Ferramentas |
| Foco e Navegação | Guia de Leitura, Máscara de Leitura, Cursor (3 níveis), Modo Foco |
| Recursos Avançados | Leitor de Tela (texto-para-fala), Teclado Virtual, Comandos por Voz |

### Os 9 perfis

Baixa Visão, Daltonismo, Dislexia, TDAH/Foco, Idoso/Sênior, Epilepsia, Deficiência Motora, Cognitivo e Modo Noturno — cada um aplica um conjunto de opções otimizado com um clique (e reseta o restante).

### Persistência

- **Usuários logados**: preferência do usuário (`local_a11y_settings`), sincronizada em todas as páginas e dispositivos.
- **Visitantes**: `localStorage` do navegador, migrado automaticamente para a preferência do usuário no primeiro login.
- Aplicação **sem FOUC**: um script inline no topo do `<body>` aplica as classes de acessibilidade antes da primeira pintura da página.

## Configuração (administrador)

**Administração do site → Plugins → Plugins locais → Acessibilidade (A11y)**:

- Ativar/desativar o plugin globalmente; mostrar (ou não) para visitantes; padrões de URL a excluir.
- Quais das 22 opções ficam disponíveis para os usuários.
- Posição/ícone/forma do botão flutuante; formato do painel (popover/gaveta/modal); densidade; mostrar perfis; cor de acento.

## Privacidade

O plugin implementa a Privacy API do Moodle (`classes/privacy/provider.php`): a única informação pessoal armazenada é a preferência `local_a11y_settings` do próprio usuário (suas opções de acessibilidade escolhidas). Nenhuma tabela de banco de dados própria; nada é compartilhado com terceiros. Visitantes usam apenas `localStorage` do navegador, fora do alcance do Moodle.

## Desenvolvimento

Ver `CLAUDE.md` para convenções e comandos, `PLAN.md`/`PROGRESS.md` para o histórico de marcos, `DECISIONS.md` para decisões de arquitetura, `ENVIRONMENT.md` para reproduzir o ambiente de desenvolvimento/testes.

```bash
# Recompilar AMD após editar amd/src/*.js
npx grunt amd --root=local/a11y

# Testes PHPUnit
vendor/bin/phpunit --configuration local/a11y/phpunit.xml
```

## Licença

GNU GPL v3 ou posterior — ver `COPYING.txt` do Moodle.

### Atribuição de terceiros

`pix/accessibility-un.svg` (ícone padrão do botão flutuante) é uma cópia local de
["Accessibility logo (UN)"](https://commons.wikimedia.org/wiki/File:Accessibility_logo.svg),
Wikimedia Commons, licenciado sob
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (Creative Commons
Attribution-ShareAlike 4.0 International). A geometria (paths/circles) é idêntica ao
arquivo original; o único ajuste foi substituir o bloco `<style>`/classes CSS do
arquivo original por atributos de apresentação equivalentes aplicados diretamente
nos elementos, para que o SVG possa ser inserido com segurança inline na página do
Moodle (sem depender de nomes de classe CSS globais que poderiam colidir com outros
elementos da página). Ver `classes/icons.php::un_accessibility_svg()`.
