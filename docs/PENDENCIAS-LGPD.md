# Pendências de LGPD do `local_a11y` — para a assessoria jurídica/DPO da UFPel

Este documento existe para ser entregue à assessoria jurídica/encarregado de dados (DPO) da UFPel. Não é uma auditoria técnica completa (isso existe como registro interno, não publicado) — é a lista **objetiva** do que falta decidir, com o contexto mínimo necessário para decidir, e sem repetir texto genérico da lei.

## O que já está pronto no plugin (não precisa de decisão)

- Só uma preferência do usuário é armazenada pelo plugin (`local_a11y_settings`), exportável e visível ao próprio titular via Meus dados pessoais do Moodle (Privacy API implementada e testada).
- O rótulo de qualquer "perfil" (ex.: clicar em "Dislexia" ou "Epilepsia" no painel) nunca é gravado — só o resultado das opções técnicas que ele aplica (ex.: tamanho de fonte, espaçamento).
- Câmera (Navegação por Face): a imagem nunca sai do navegador do usuário — processamento 100% local. Aviso de privacidade mostrado antes de pedir a permissão.
- Microfone (Comandos por Voz): aviso de privacidade mostrado antes de pedir a permissão, informando que o navegador pode enviar o áudio a um serviço de terceiro.
- Estatísticas de uso agregadas são opcionais (desligadas por padrão) e nunca identificam um usuário individual.

## Perguntas concretas para a assessoria jurídica/DPO

### 1. Classificação do dado

O plugin grava, por usuário identificado, um JSON com até 30 chaves técnicas de acessibilidade (tamanho de fonte, contraste, etc). Uma dessas chaves se chama literalmente `dyslexicFont` (fonte para dislexia). Outras chaves indicam o uso de leitor de tela, teclado virtual, comandos por voz, navegação por rastreamento facial, ou integração com Libras (VLibras) — recursos cada um fortemente associado a um tipo específico de deficiência.

**Pergunta:** essa informação, associada a uma conta de usuário identificada, constitui dado pessoal sensível referente à saúde (LGPD art. 5º, II)?

- [ ] Sim
- [ ] Não
- [ ] Depende de [especificar condição]

**Se sim**, uma segunda pergunta segue diretamente: qual hipótese do art. 11 sustenta o tratamento hoje (a UFPel já tem uma política de acessibilidade que cobriria isso sem precisar de consentimento específico, ou é necessário implementar um consentimento específico e destacado antes de o usuário poder salvar essas preferências)?

### 2. Base legal geral

Para o restante do dado (as ~25 opções que não são fortemente indicativas de deficiência específica — tamanho de texto, contraste geral, etc.), qual base do art. 7º a UFPel usa (ex.: execução de políticas públicas, cumprimento de obrigação legal pela LBI)?

**Pergunta:** existe já um texto padrão da UFPel para isso (de outro sistema institucional) que possa ser reaproveitado, ou precisa ser redigido especificamente para este plugin?

### 3. RIPD

O plugin já está em produção, em uso real, há mais de um mês (histórico de commits desde 24/07/2026).

**Pergunta:** a UFPel quer abrir um Relatório de Impacto à Proteção de Dados (art. 38) para este plugin, dado o resultado da pergunta 1? Se sim, quem conduz.

### 4. Encarregado/DPO

**Pergunta:** quem é o encarregado de dados da UFPel hoje, e qual é a forma de contato que deve aparecer citada a partir do plugin (rodapé do painel, tela de configurações, ou só a política de privacidade institucional linkada)?

### 5. Política de privacidade institucional do Moodle

**Pergunta:** a política de privacidade institucional do Moodle da UFPel já cobre "preferências de acessibilidade, incluindo uso opcional de webcam e microfone quando o próprio usuário decide ativar"? Se não, ela precisa ser atualizada antes de qualquer divulgação mais ampla do plugin.

## Onde a resposta entra no plugin, quando vier

Já deixei os "ganchos" identificados no código para quando as respostas chegarem — nenhum texto foi inventado ou adivinhado:

- **Base legal / RIPD / DPO**: hoje não existe nenhum campo de texto no plugin para isso. O lugar mais natural é uma nova seção `admin_setting_description` em `settings.php` (mesmo padrão já usado para o aviso de colisão do VLibras, `settings.php:112-119`), com o texto final vindo da assessoria — ou, mais simples, um parágrafo no `README.md` do plugin apontando para a política de privacidade institucional (sem duplicar o texto legal ali).
- **Encarregado/DPO**: mesmo lugar, ou no rodapé do painel (`local_a11y/footertext`, já existe como campo de texto rico configurável pelo admin — `settings.php:207-213` — dá para colocar um link ali sem mudar código, só a configuração).
- **Se a resposta da pergunta 1 for "sim, é dado sensível"**: a mitigação técnica parcial identificada numa auditoria interna **já foi implementada**: a chave que nomeava a condição específica (`dyslexicFont`) foi renomeada para a neutra `fontVariant` em todo o código, incluindo as 3 representações persistidas (`classes/options.php`, `db/upgrade.php`, migração de dados para sites já em produção). Isso **não substitui** a revisão jurídica - a interface ainda rotula a opção como "Dislexia" visivelmente, por desenho (o usuário precisa saber o que a opção faz), então o dado em si continua inferível a partir do uso. Documentado como mitigação de defesa em profundidade, não como resposta à pergunta 1.
