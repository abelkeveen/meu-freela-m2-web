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
