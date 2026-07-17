# Exemplo real de execução

Este arquivo registra uma execução real do agente, de ponta a ponta, para servir como
referência de entrada e saída sem depender de rodar o projeto localmente. O arquivo de saída
completo gerado por essa execução (idêntico ao reproduzido abaixo) fica em
`docs/outputs/`, mas essa pasta é ignorada pelo Git (ver [`.gitignore`](../../.gitignore)) por
conter artefatos gerados a cada execução — por isso este exemplo é mantido versionado à parte.

## Comando executado

```bash
npm run agent -- examples-testes/demanda-login.txt
```

## Entrada (`examples-testes/demanda-login.txt`)

```text
Tipo: História de Usuário

Como usuário do sistema,
quero realizar login usando e-mail e senha,
para acessar minha área restrita com segurança.

Critérios de aceite:
- O usuário deve conseguir acessar o sistema com credenciais válidas.
- O sistema deve exibir mensagem de erro para senha incorreta.
- Após 5 tentativas inválidas consecutivas, a conta deve ser bloqueada temporariamente por 15 minutos.
- O sistema deve registrar data, hora e IP das tentativas de login.
- O usuário deve poder solicitar recuperação de senha.
```

## Saída gerada pelo agente

> Executado em 17/07/2026, modelo `openai/gpt-oss-120b` (Groq). Tool de análise escolhida pelo
> LLM: `analisar_texto_livre`. Nesta execução, a revisão de consistência identificou pendências
> reais (seção "Pendências de consistência" abaixo) que não foram resolvidas dentro do limite de
> tentativas — por isso o relatório final as expõe explicitamente em vez de escondê-las,
> exatamente o comportamento descrito em
> [`docs/arquitetura/visao-geral-agente.md`](../arquitetura/visao-geral-agente.md#L5-fluxo-geral-do-agente).

---

# Análise de Demanda para QA

## Classificação

Tipo: **historia-usuario** (confiança: 0.99)

O texto descreve claramente uma história de usuário com critérios de aceite, não se trata de bug, tarefa ou outra categoria.

## Resumo técnico

A funcionalidade permite que o usuário realize login no sistema utilizando e‑mail e senha, garantindo acesso à área restrita de forma segura. O fluxo inclui a validação das credenciais, a exibição de mensagens de erro em caso de senha incorreta e o bloqueio temporário da conta após cinco tentativas falhas consecutivas, impedindo novos acessos por 15 minutos. Todas as tentativas de login são auditadas, registrando data, hora e endereço IP, o que reforça a rastreabilidade e a segurança. Além disso, o usuário tem a opção de iniciar o processo de recuperação de senha, assegurando que possa restabelecer o acesso caso esqueça a senha.

## Componentes afetados

- Módulo de Autenticação
- Controlador de Login
- Serviço de Conta de Usuário
- Módulo de Segurança
- Módulo de Auditoria/Log
- Módulo de Recuperação de Senha

## Entidades de negócio

- Usuário
- Conta
- Credenciais
- Tentativa de Login
- Senha

## Premissas identificadas

- O sistema deve registrar data, hora e IP das tentativas de login.
- O usuário deve poder solicitar recuperação de senha.

## Informações faltantes

- Critérios de aceite para bloqueio temporário da conta após 5 tentativas inválidas consecutivas
- Ambiente afetado (ex: produção, desenvolvimento, etc.)
- Volume esperado de usuários

## Estratégia de testes

Categorias aplicáveis: funcional

A demanda descreve uma história de usuário com critérios de aceite, o que indica que a funcionalidade está sendo testada em um cenário realista e com requisitos específicos. Além disso, a presença de critérios como validação de credenciais, exibição de mensagens de erro e bloqueio de conta após tentativas falhas sugere que a funcionalidade está sendo testada em termos de comportamento e resultados esperados, o que é típico de testes funcionais. A ausência de critérios relacionados a bugs ou problemas de desempenho também apoia a escolha de testes funcionais.

## Cenários de teste funcionais

- **Login com credenciais válidas**
  1. Pré-condição: e-mail e senha válidos
  2. Ação: realizar login com e-mail e senha válidos
  3. Verificação: verificar se o usuário é redirecionado para a área restrita
  - Resultado esperado: O usuário é redirecionado para a área restrita
- **Login com senha incorreta**
  1. Pré-condição: e-mail válido e senha incorreta
  2. Ação: realizar login com e-mail válido e senha incorreta
  3. Verificação: verificar se a mensagem de erro é exibida
  - Resultado esperado: A mensagem de erro é exibida
- **Bloqueio após 5 tentativas inválidas consecutivas**
  1. Pré-condição: 5 tentativas inválidas consecutivas
  2. Ação: realizar login com e-mail e senha inválidos
  3. Verificação: verificar se a conta é bloqueada temporariamente
  - Resultado esperado: A conta é bloqueada temporariamente
- **Recuperação de senha**
  1. Pré-condição: usuário solicitou recuperação de senha
  2. Ação: realizar recuperação de senha
  3. Verificação: verificar se a senha é atualizada
  - Resultado esperado: A senha é atualizada
- **Registro de data, hora e IP**
  1. Pré-condição: usuário realizou login
  2. Ação: verificar registro de data, hora e IP
  3. Verificação: verificar se os dados são registrados corretamente
  - Resultado esperado: Os dados são registrados corretamente

## Cenários de teste unitários

_Não aplicável a esta demanda._

## Cenários de integração

_Não aplicável a esta demanda._

## Cenários não funcionais

_Não aplicável a esta demanda._

## Pendências de consistência

- Falta de cenário ou checklist que verifique o conteúdo das mensagens de erro para evitar vazamento de informação (risco de negócio alto).
- Nenhum cenário cobre o desbloqueio da conta após o período de bloqueio de 15 minutos (risco de negócio alto).
- Nenhum cenário ou checklist verifica a conformidade completa dos registros de auditoria (risco de negócio crítico).
- Recomendações não incluem teste de usabilidade/confusão no fluxo de recuperação de senha (risco de negócio médio).
- O checklist não reflete as recomendações de testes de concorrência, carga de logs e segurança de tokens, apesar de esses riscos técnicos serem identificados.

## Checklist de validação

- Verificar se o usuário é redirecionado para a área restrita após login com credenciais válidas
- Verificar se a mensagem de erro é exibida após login com senha incorreta
- Verificar se a conta é bloqueada temporariamente após 5 tentativas inválidas consecutivas
- Verificar se a senha é atualizada após recuperação de senha
- Verificar se os dados são registrados corretamente

## Riscos técnicos

- [ALTA] A contagem de tentativas falhas pode sofrer condições de corrida quando múltiplas requisições são processadas simultaneamente, resultando em bloqueios indevidos ou na falha de aplicar o bloqueio temporário. Isso compromete a disponibilidade da conta para usuários legítimos e pode gerar inconsistências no controle de segurança.
- [MEDIA] O registro de data, hora e IP para cada tentativa de login gera um volume elevado de dados de auditoria, o que pode sobrecarregar o banco de dados ou o serviço de logs, levando a atrasos na gravação ou perda de informações críticas para investigação de incidentes.
- [CRITICA] A geração e validação de tokens para recuperação de senha pode ser implementada com algoritmos fracos ou tempos de expiração inadequados, permitindo que um atacante reutilize ou adivinhe tokens e acesse contas de usuários sem autorização.
- [ALTA] A integração da nova lógica de login com o módulo de autenticação existente pode introduzir regressões, fazendo com que usuários com credenciais válidas sejam impedidos de acessar o sistema ou recebam mensagens de erro incorretas.
- [MEDIA] A dependência de um serviço externo de e‑mail para o fluxo de recuperação de senha pode causar falhas de entrega ou atrasos, impedindo que usuários concluam o processo de redefinição e fiquem bloqueados fora da aplicação.

## Riscos de negócio

- [ALTA] O bloqueio temporário após cinco tentativas falhas pode impedir o acesso de usuários que simplesmente erraram a senha, gerando frustração, aumento de tickets de suporte e risco de churn.
- [ALTA] Mensagens de erro detalhadas que indicam que a senha está incorreta podem revelar que o e‑mail está cadastrado, facilitando ataques de força bruta ou credential stuffing por parte de agentes maliciosos.
- [CRITICA] Caso o registro de tentativas de login não seja completo ou confiável, a empresa pode não atender a requisitos de auditoria e conformidade regulatória, expondo‑se a sanções legais e danos reputacionais.
- [MEDIA] Um fluxo de recuperação de senha confuso ou demorado pode levar usuários a abandonarem a tentativa de acesso, impactando negativamente a retenção e a satisfação geral com o serviço.

## Recomendações para o QA

- Testar a integração com serviço externo de e-mail para recuperação de senha
- Testar a segurança dos tokens de recuperação de senha
- Testar a concorrência na contagem de tentativas falhas
- Testar a carga/performance do sistema com volume elevado de logs de auditoria
