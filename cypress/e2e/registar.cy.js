import { faker } from '@faker-js/faker'

describe('Registro', () => {
  beforeEach(() => {
    cy.start()
    cy.get('#register-tab > a').click()
  })

  it('Deve cadastrar um novo usuário', () => {
    cy.get('#register-username').type(faker.internet.username())
    cy.get('#register-password').type('senha123')
    cy.get('#register-btn').click()

    cy.contains('Usuário criado com sucesso! Agora você pode fazer login.')
      .should('be.visible')
  })

  it('Deve impedir o cadastro de um usuário com login já existente', () => {
    const username = faker.internet.username()
    const password = 'senha123'

    // Pré-condição: usuário já cadastrado
    cy.request('POST', '/api/auth/register', { login: username, senha: password })

    cy.get('#register-username').type(username)
    cy.get('#register-password').type(password)
    cy.get('#register-btn').click()

    // Mensagem vem da API (409)
    cy.contains('Usuário já existe.').should('be.visible')
  })

  it('Não deve cadastrar usuário sem senha', () => {
    cy.get('#register-username').type(faker.internet.username())
    cy.get('#register-btn').click()

    // O campo é obrigatório: o navegador bloqueia o envio
    cy.get('#register-password:invalid').should('exist')
    cy.contains('Usuário criado com sucesso!').should('not.exist')
  })
})
