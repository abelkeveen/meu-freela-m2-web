import { faker } from '@faker-js/faker'

// Observação: a API guarda os dados em memória e não separa por usuário,
// então as listas podem ter dados de outros testes. Por isso os cards são
// localizados pelo data-id do registro criado.
describe('Clientes', () => {
  beforeEach(() => {
    cy.openDashboard()
  })

  it('Deve cadastrar um cliente', () => {
    const nome = `${faker.person.fullName()} ${Date.now()}`

    cy.get('[data-cy=new-client-btn]').click()
    cy.get('[data-cy=client-modal]').should('have.class', 'is-active')
    cy.get('[data-cy=client-nome]').type(nome)
    cy.get('[data-cy=client-contato]').type('cliente@teste.com')
    cy.get('[data-cy=client-save-btn]').click()

    cy.notification('Cliente criado com sucesso!')
    cy.contains('[data-cy=client-card]', nome)
      .should('contain', 'cliente@teste.com')
  })

  it('Não deve cadastrar cliente sem nome', () => {
    cy.get('[data-cy=new-client-btn]').click()
    cy.get('[data-cy=client-save-btn]').click()

    cy.notification('Nome é obrigatório')
    cy.get('[data-cy=client-modal]').should('have.class', 'is-active')
  })

  it('Não deve cadastrar cliente com nome repetido', () => {
    cy.createClientByApi().then((cliente) => {
      cy.get('[data-cy=new-client-btn]').click()
      cy.get('[data-cy=client-nome]').type(cliente.nome)
      cy.get('[data-cy=client-save-btn]').click()

      cy.notification('Nome de cliente já existente.')
    })
  })

  it('Deve editar um cliente', () => {
    const novoNome = `Editado ${Date.now()}`

    cy.createClientByApi().then((cliente) => {
      cy.reload()
      cy.get(`[data-cy=client-card][data-id=${cliente.id}]`)
        .find('[data-cy=client-edit-btn]').click()
      cy.get('[data-cy=client-modal-title]').should('have.text', 'Editar Cliente')
      cy.get('[data-cy=client-nome]').clear().type(novoNome)
      cy.get('[data-cy=client-save-btn]').click()

      cy.notification('Cliente atualizado com sucesso!')
      cy.get(`[data-cy=client-card][data-id=${cliente.id}]`)
        .should('contain', novoNome)
    })
  })

  it('Deve remover um cliente sem jobs', () => {
    cy.createClientByApi().then((cliente) => {
      cy.reload()
      cy.get(`[data-cy=client-card][data-id=${cliente.id}]`)
        .find('[data-cy=client-delete-btn]').click()

      cy.notification('Cliente removido com sucesso!')
      cy.get(`[data-cy=client-card][data-id=${cliente.id}]`).should('not.exist')
    })
  })

  it('Não deve remover cliente com job vinculado', () => {
    cy.createClientByApi().then((cliente) => {
      cy.createJobByApi({ clienteId: cliente.id })
      cy.reload()
      cy.get(`[data-cy=client-card][data-id=${cliente.id}]`)
        .find('[data-cy=client-delete-btn]').click()

      cy.notification('Não é permitido remover cliente com jobs vinculados.')
      cy.get(`[data-cy=client-card][data-id=${cliente.id}]`).should('exist')
    })
  })
})
