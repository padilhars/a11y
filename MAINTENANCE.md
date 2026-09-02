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
  de um site Moodle 5.0+ funcional.
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

## Contato para dúvidas de manutenção

Ver `SECURITY.md` para o canal de contato dos mantenedores atuais.
