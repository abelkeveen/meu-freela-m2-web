import { faker } from '@faker-js/faker'

describe('Login', () => {
  beforeEach(() => {
    cy.start()
  })

  it('Deve realizar login com sucesso', () => {
    // Pré-condição: cadastrar usuário
    cy.createUser().then((user) => {
      cy.get('#login-username').type(user.username)
      cy.get('#login-password').type(user.password)
      cy.get('#login-btn').click()

      // Validar autenticação
      cy.location('pathname').should('eq', '/dashboard')
      cy.contains('Total Recebido').should('be.visible')
      cy.contains('Total Pendente').should('be.visible')
    })
  })

  it('Não deve logar usuário não cadastrado', () => {
    cy.get('#login-username').type(`naoexiste_${Date.now()}`)
    cy.get('#login-password').type('senha123')
    cy.get('#login-btn').click()

    cy.contains('[data-cy=message]', 'Usuário não encontrado.').should('be.visible')
    cy.location('pathname').should('eq', '/')
  })

  it('Não deve logar com senha incorreta', () => {
    const login = faker.internet.username()
    cy.request('POST', '/api/auth/register', { login, senha: 'senha123' })

    cy.get('#login-username').type(login)
    cy.get('#login-password').type('senhaErrada')
    cy.get('#login-btn').click()

    cy.contains('[data-cy=message]', 'Senha incorreta.').should('be.visible')
  })

  it('Deve voltar para o login ao sair do dashboard', () => {
    cy.openDashboard()
    cy.get('[data-cy=logout-btn]').click()
    cy.location('pathname').should('eq', '/')
  })

  it('Não deve abrir o dashboard sem estar logado', () => {
    cy.visit('/dashboard')
    cy.location('pathname').should('eq', '/')
  })
})
