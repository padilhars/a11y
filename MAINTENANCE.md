# Continuidade e manutenção

Este documento existe porque uma auditoria de SDLC deste projeto (`audit/05-sdlc.md`)
identificou um risco real de continuidade: no histórico git deste repositório, **100% dos
commits estão sob um único autor** (`padilhars@gmail.com`), apesar de o projeto creditar dois
mantenedores em `README.md` e nos cabeçalhos `@author` do código. Este arquivo é um primeiro
passo para reduzir o risco de "conhecimento que só existe na cabeça de uma pessoa".

## Mantenedores creditados

Ver `README.md` e os cabeçalhos `@author` dos arquivos-fonte. Ambos servidores da mesma unidade
de coordenação na UFPel.

## O que este repositório público NÃO contém

Por convenção deste projeto (ver `.gitignore`), os seguintes arquivos existem apenas na máquina
de quem desenvolve, nunca são commitados nem publicados:

- `DECISIONS.md` - log de decisões técnicas tomadas ao longo do projeto, com a justificativa de
  cada uma. É a fonte de verdade para "por que o código é assim" quando isso não é óbvio pela
  leitura do próprio código.
- `ENVIRONMENT.md` - notas do ambiente de desenvolvimento/produção específico onde este plugin
  roda hoje (caminhos, como subir a infraestrutura de teste). **Contém informação sensível de
  ambiente e não deve, em nenhuma circunstância, ser publicado ou versionado.**
- `CLAUDE.md`, `PLAN.md`, `PROGRESS.md` - instruções de trabalho e acompanhamento de progresso
  de sessões de desenvolvimento assistido.

**Implicação prática para quem for assumir a manutenção**: um clone limpo deste repositório
público, por si só, não contém o histórico de decisões nem as notas de ambiente. Peça essas
informações diretamente aos mantenedores atuais durante a transição, ou reconstrua o
equivalente a partir de `CHANGELOG.md` (que registra o resultado de cada decisão, mesmo sem a
justificativa completa) e da documentação pública em `docs/`.

## Como reconstruir o ambiente de desenvolvimento/teste (visão geral)

Detalhes específicos de infraestrutura são do ambiente onde o plugin roda hoje e não estão
aqui - o objetivo desta seção é orientar o que perguntar/procurar, não substituir
`ENVIRONMENT.md`.

- **Instalação do plugin**: como qualquer plugin `local_*` do Moodle - em `local/a11y/` dentro
  de um site Moodle funcional na versão declarada em `version.php:$plugin->supported` (hoje,
  só 5.2 tem suporte confirmado - ver a seção de compatibilidade futura abaixo).
- **Build de JS/CSS**: usa o pipeline Grunt/Babel padrão do Moodle core (não um `package.json`
  próprio deste plugin) - requer a versão de Node.js que o Moodle core especifica para a versão
  em uso (verificado nesta auditoria: Node 22.x funciona; Node 24.x, a versão mais recente
  disponível no momento desta nota, **não** funciona com o Grunt deste Moodle).
- **Ferramental de QA**: `moodle-plugin-ci` (ver `.github/workflows/ci.yml` para a lista
  completa de comandos usados: phplint, codechecker, phpmd, phpcpd, validate, savepoints,
  mustache, grunt, phpunit, behat).
- **Testes `@javascript` (Behat)**: exigem um WebDriver real (Selenium + Chrome/chromedriver na
  mesma versão major) apontando para uma instância Moodle dedicada a testes
  (`$CFG->behat_wwwroot`), com seu próprio `$CFG->dataroot` e banco de dados, separados da
  instância de produção.

## Compatibilidade com versões futuras do Moodle

`version.php:$plugin->supported` hoje declara só `[502, 502]` (Moodle 5.2) - a única versão
com suporte real, testado ao vivo (ver `DECISIONS.md` D2, D67). Isso **não é uma garantia de
que versões futuras vão quebrar**, só o reflexo honesto de que nada além de 5.2 foi verificado.

Plano declarado (o que existia antes desta nota era nenhum plano - isto substitui a ausência,
não um processo antigo mais elaborado):

- Antes de declarar suporte a uma nova versão do Moodle (ex: 5.3), rodar a suíte completa
  (`.github/workflows/ci.yml` já cobre isso mecanicamente - basta adicionar a nova branch à
  matriz `moodle-branch` e observar se os 4 tipos de teste continuam passando) contra essa
  versão antes de mudar `version.php:$plugin->supported`.
- Só ampliar `$plugin->supported` depois desse teste real ter passado - nunca por assumir que
  "nada aqui usa API nova o suficiente para quebrar" (essa mesma suposição, feita sem teste,
  foi exatamente o que gerou o achado de incompatibilidade real com Moodle 5.0, corrigido em
  D67 - ver `audit/05-sdlc.md`).
- `tests/version_readme_parity_test.php` falha automaticamente se `README.md` ficar
  dessincronizado do valor real de `$plugin->supported` depois dessa mudança.

## Resposta a incidente em produção e rollback

Não existe hoje um ambiente de homologação separado do de produção (achado registrado em
`audit/05-sdlc.md` - risco real, não resolvido por esta nota). Enquanto isso não muda, o
procedimento mínimo para um incidente causado por uma mudança deste plugin é:

1. **Desativar o plugin sem remover código**: `Administração do site → Plugins → Plugins locais
   → A11Y for Moodle → Desativar` (ou, via CLI, ajustar a configuração `enabled` do plugin) -
   reversível instantaneamente, não exige tocar em arquivos.
2. **Se a causa for uma mudança de código recente**: reverter para o commit anterior no
   repositório git (`git revert` do commit problemático, não `git reset --hard` - preserva o
   histórico) e reimplantar o `local/a11y/` a partir dele. Como não há ambiente de
   homologação, esse passo já é, na prática, a primeira vez que a reversão roda contra um
   ambiente real - testar localmente contra uma cópia do banco antes, se o tempo permitir.
3. **Se a causa for uma mudança de dados** (uma opção de `db/upgrade.php` que rodou mal): não
   existe um "downgrade" automático no Moodle - reverter dados manualmente exige entender
   exatamente o que aquele bloco de upgrade mudou (ver `db/upgrade.php` e o savepoint
   correspondente em `DECISIONS.md`) antes de tentar desfazê-lo à mão.
4. **Quem responde**: não há hoje uma pessoa nomeada além dos mantenedores creditados (ver
   `README.md`/`SECURITY.md`) - qualquer incidente real depende de um deles estar disponível.
   Isto é uma lacuna real, não resolvida por este documento (ver bus factor, acima).

## Contato para dúvidas de manutenção

Ver `SECURITY.md` para o canal de contato dos mantenedores atuais.
