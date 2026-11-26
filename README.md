# Meu Freela M2 Web

Aplicação Web para Agendamento e Organização de Freelancer/Diárias

## Descrição

Sistema web que permite o cadastro, login, gerenciamento de clientes, jobs (trabalhos) e pagamentos, integrado a uma API REST documentada via Swagger.

## Tecnologias Utilizadas

- **Backend:** Express.js (Node.js)
- **Frontend:** HTML, CSS, JavaScript
- **Framework CSS:** Bulma
- **HTTP Client:** Axios

## Como Executar

1. Certifique-se que a API está rodando em `http://localhost:3000`.
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```
3. Inicie o servidor web:
   ```bash
   npm start
   ```
4. Acesse a aplicação em `http://localhost:4000`.

## Funcionalidades

- Cadastro e login de usuários
- Listagem, criação, edição e exclusão de clientes
- Listagem, criação, edição e exclusão de jobs
- Listagem e registro de pagamentos
- Resumo financeiro (total recebido e pendente)
- Mensagens de erro amigáveis para falhas da API

## Estrutura do Projeto

```
meu-freela-m2-web/
├── server.js              # Servidor Express
├── package.json           # Dependências e scripts
├── recursos/
│   └── swagger.json       # Documentação da API
└── public/
    ├── index.html        # Página de login/registro
    ├── dashboard.html    # Dashboard principal
    └── dashboard.js      # Lógica JavaScript do dashboard
```

## Observações

- O frontend utiliza Bulma para estilização e Font Awesome para ícones.
- O token JWT é armazenado no localStorage após login.
- Todas as requisições para a API são feitas via rotas `/api/*` do Express, que faz proxy para a API real.
- Mensagens de erro são exibidas para qualquer resposta fora da faixa 200.

## Licença

Este projeto está sob licença ISC.

## Testes E2E (Cypress)

Os testes ficam em `cypress/e2e/` e cobrem registro, login, clientes, jobs e pagamentos.

1. Suba a API (`meu-freela-m2`) em `http://localhost:3000`.
2. Suba esta aplicação com `npm start` (porta 4000).
3. Rode os testes:
   ```bash
   npm run cy:run    # modo headless
   npm run cy:open   # interface do Cypress
   ```

Seletores: os elementos usados nos testes têm o atributo `data-cy` (ex.: `[data-cy=client-nome]`, `[data-cy=new-job-btn]`). Os cards das listas têm `data-cy` e `data-id` com o id do registro (ex.: `[data-cy=client-card][data-id=3]`).

Comandos customizados (`cypress/support/commands.js`): `cy.openDashboard()` cria um usuário e abre o dashboard já logado; `cy.createClientByApi()`, `cy.createJobByApi()` e `cy.createPaymentByApi()` preparam dados pela API.

A API guarda tudo em memória e não separa dados por usuário. Reinicie a API para começar com o banco vazio.

### CI (GitHub Actions)

O workflow `.github/workflows/e2e.yml` roda a cada PR, a cada push na `main` e manualmente (aba Actions). Ele baixa a API do repositório `meu-freela-m2`, sobe a API (porta 3000) e o app (porta 4000) e roda todos os specs do Cypress. Se algum teste falhar, os screenshots e o log da API ficam disponíveis como artefatos da execução.
