import { faker } from '@faker-js/faker'

Cypress.Commands.add('start', () => {
  cy.viewport(1440, 900)
  cy.visit('/')
})

// Cadastra um usuário pela tela de registro e devolve as credenciais
Cypress.Commands.add('createUser', () => {
  const username = faker.internet.username()
  const password = 'senha123'

  cy.get('#register-tab > a').click()
  cy.get('#register-username').type(username)
  cy.get('#register-password').type(password)
  cy.get('#register-btn').click()

  cy.contains('Usuário criado com sucesso! Agora você pode fazer login.')
    .should('be.visible')

  // Retorna as credenciais para utilização nos testes
  return cy.wrap({ username, password })
})

// Atalho para os testes do dashboard: cria um usuário e faz login direto pela API
// (sem passar pela tela), deixando o token no localStorage.
Cypress.Commands.add('loginByApi', () => {
  const login = `${faker.internet.username()}_${Date.now()}`
  const senha = 'senha123'

  cy.request('POST', '/api/auth/register', { login, senha })
  return cy.request('POST', '/api/auth/login', { login, senha }).then(({ body }) => {
    cy.wrap(body.token, { log: false }).as('token')
    cy.window().then((win) => win.localStorage.setItem('token', body.token))
    return cy.wrap({ login, senha, token: body.token })
  })
})

// Abre o dashboard já autenticado
Cypress.Commands.add('openDashboard', () => {
  cy.intercept('GET', '/api/payments/summary').as('summary')
  cy.loginByApi().then(({ token }) => {
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token)
      },
    })
  })
  cy.wait('@summary')
  cy.get('[data-cy=total-recebido]').should('be.visible')
})

// Requisições autenticadas para preparar dados (pré-condições)
const authRequest = (method, url, body) =>
  cy.get('@token', { log: false }).then((token) =>
    cy.request({ method, url, body, headers: { Authorization: `Bearer ${token}` } })
  )

Cypress.Commands.add('createClientByApi', (cliente = {}) => {
  const body = {
    nome: `${faker.person.fullName()} ${Date.now()}`,
    contato: faker.internet.email(),
    ...cliente,
  }
  return authRequest('POST', '/api/clients', body).its('body')
})

Cypress.Commands.add('createJobByApi', (job) => {
  const body = {
    descricao: `Job ${faker.commerce.productName()} ${Date.now()}`,
    valor: 500,
    status: 'pendente',
    data: '2026-12-01T10:00',
    ...job,
  }
  return authRequest('POST', '/api/jobs', body).its('body')
})

Cypress.Commands.add('createPaymentByApi', (pagamento) => {
  const body = { valor: 200, recebido: false, data: '2026-12-02T10:00', ...pagamento }
  return authRequest('POST', '/api/payments', body).its('body')
})

Cypress.Commands.add('summaryByApi', () =>
  authRequest('GET', '/api/payments/summary').its('body')
)

// Notificação exibida no canto da tela do dashboard
Cypress.Commands.add('notification', (texto) =>
  cy.contains('[data-cy=notification]', texto).should('be.visible')
)
