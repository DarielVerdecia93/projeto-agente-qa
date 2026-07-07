# Análise de Demanda para QA

## Classificação

Tipo: **historia-usuario** (confiança: 1.00)

A demanda técnica se encaixa claramente no tipo 'historia-usuario' pois descreve uma funcionalidade específica do sistema, incluindo os critérios de aceite, que é característico de uma história de usuário.

## Resumo técnico

O sistema deve permitir que os usuários realizem login com e-mail e senha, com segurança e registro de tentativas de login. O sistema deve bloquear a conta temporariamente após 5 tentativas inválidas consecutivas e permitir a recuperação de senha.

## Componentes afetados

- Módulo de Login
- Módulo de Segurança
- Módulo de Recuperação de Senha

## Entidades de negócio

- Usuário
- Conta
- Senha

## Premissas identificadas

- O sistema já possui uma base de dados para armazenar informações de usuário
- O sistema tem um mecanismo de criptografia para proteger as senhas
- O sistema tem um limite de tentativas de login definido

## Informações faltantes

- Detalhes sobre o ambiente de desenvolvimento e deploy
- Informações sobre o volume esperado de usuários e acessos
- Critérios de desbloqueio da conta após o período de 15 minutos

## Estratégia de testes

Categorias aplicáveis: funcional, unitario, integracao

A demanda técnica se encaixa claramente no tipo 'historia-usuario' e inclui funcionalidades específicas do sistema, como login com e-mail e senha, segurança e registro de tentativas de login, bloqueio temporário da conta e recuperação de senha. Portanto, os testes funcionais, unitários e de integração são aplicáveis. Os testes funcionais verificarão se as funcionalidades estão corretas, os testes unitários verificarão se as unidades de código estão corretas e os testes de integração verificarão se as diferentes partes do sistema estão integradas corretamente. Os testes não-funcionais não são aplicáveis pois a demanda não menciona requisitos de desempenho, escalabilidade ou segurança não relacionados a funcionalidades específicas.

## Cenários de teste funcionais

- **Login com credenciais válidas**
  1. Informar e-mail e senha válidos
  2. Clicar em login
  - Resultado esperado: Acesso à área restrita
  - Evidência sugerida: Print de tela da área restrita
- **Login com senha incorreta**
  1. Informar e-mail válido e senha incorreta
  2. Clicar em login
  - Resultado esperado: Mensagem de erro
  - Evidência sugerida: Print de tela com mensagem de erro
- **Bloqueio temporário da conta**
  1. Informar e-mail e senha inválidos 5 vezes seguidas
  2. Clicar em login
  - Resultado esperado: Mensagem de bloqueio temporário
  - Evidência sugerida: Print de tela com mensagem de bloqueio temporário
- **Recuperação de senha**
  1. Clicar em esqueci minha senha
  2. Informar e-mail
  - Resultado esperado: E-mail de recuperação de senha
  - Evidência sugerida: Print de tela com mensagem de envio de e-mail

## Cenários de teste unitários

_Não aplicável a esta demanda._

## Cenários de integração

_Não aplicável a esta demanda._

## Cenários não funcionais

_Não aplicável a esta demanda._

## Checklist de validação

- Verificar se o login com credenciais válidas é bem-sucedido
- Verificar se o login com senha incorreta exibe mensagem de erro
- Verificar se o bloqueio temporário da conta é ativado após 5 tentativas inválidas
- Verificar se a recuperação de senha é bem-sucedida

## Riscos técnicos

- [MEDIA] Implementação do mecanismo de bloqueio temporário da conta pode ser complexa e requer testes rigorosos
- [ALTA] Integração com o módulo de segurança para registrar tentativas de login pode apresentar desafios
- [CRITICA] Desenvolvimento do módulo de recuperação de senha pode ser vulnerável a ataques de segurança

## Riscos de negócio

- [BAIXA] Bloqueio temporário da conta pode causar insatisfação do usuário
- [ALTA] Falha no registro de data, hora e IP das tentativas de login pode impactar a segurança do sistema

## Recomendações para o QA

- Testar login com credenciais válidas
- Testar login com senha incorreta
- Testar bloqueio temporário da conta após 5 tentativas inválidas
- Testar recuperação de senha
