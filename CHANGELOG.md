# Histórico de Alterações (Changelog)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).


## [1.0.1] - 2026-05-15

### Adicionado

Esta versão corrige a estrutura de publicação do pacote no npm, garantindo que o README e os arquivos de distribuição (CJS, ESM e Types) sejam incluídos corretamente.

- **Correções Técnicas**
  - Adicionado o campo `files` no `package.json` para incluir a pasta `dist`.
  - Configurado o campo `exports` para suporte híbrido (CommonJS e ES Modules).
  - Vinculado o `README.md` explicitamente para exibição no registro do npm.
  - Adicionado selo de **Provenance** na publicação via GitHub Actions.

**Full Changelog**: https://github.com/box4dev/gerador-boleto/compare/v1.0.0...v1.0.1

## [1.0.0] - 2026-05-14

### Adicionado
- **Lançamento Inicial**
  - Primeira versão pública do pacote `@box4dev/gerador-boleto`.
  - Implementação de geradores de boleto para Bradesco, Caixa, Itaú e Santander.
  - Suporte completo a TypeScript, incluindo geração automática de tipos.
  - Disponibilidade de builds em múltiplos formatos (ESM, CJS) para ampla compatibilidade.
  - Configuração de pipeline de Integração Contínua (CI) com GitHub Actions.
  - Documentação básica e guias para contribuição.
  - Implementação de testes unitários.
  - Implementação de testes E2E.