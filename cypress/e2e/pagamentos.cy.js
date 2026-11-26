// Converte o texto "R$ 1.234,56" em número
const valorEmReais = (texto) =>
  Number(texto.replace(/[^\d,]/g, '').replace(',', '.'))

describe('Pagamentos', () => {
  beforeEach(() => {
    cy.openDashboard()
    cy.createClientByApi().as('cliente').then((cliente) => {
      cy.createJobByApi({ clienteId: cliente.id }).as('job')
    })
  })

  it('Deve registrar um pagamento pendente e somar no total pendente', function () {
    cy.summaryByApi().then(({ totalPendente: antes }) => {
      cy.get('[data-cy=tab-pagamentos-link]').click()
      cy.get('[data-cy=new-payment-btn]').click()
      cy.get('[data-cy=payment-job]').select(String(this.job.id))
      cy.get('[data-cy=payment-valor]').type('250')
      cy.get('[data-cy=payment-save-btn]').click()

      cy.notification('Pagamento registrado com sucesso!')
      cy.contains('[data-cy=payment-card]', this.job.descricao).within(() => {
        cy.get('[data-cy=payment-card-cliente]').should('contain', this.cliente.nome)
        cy.get('[data-cy=payment-card-status]').should('have.text', 'Pendente')
      })
      cy.get('[data-cy=total-pendente]').should(($el) => {
        expect(valorEmReais($el.text())).to.eq(antes + 250)
      })
    })
  })

  it('Deve registrar um pagamento já recebido', function () {
    cy.get('[data-cy=tab-pagamentos-link]').click()
    cy.get('[data-cy=new-payment-btn]').click()
    cy.get('[data-cy=payment-job]').select(String(this.job.id))
    cy.get('[data-cy=payment-valor]').type('100')
    cy.get('[data-cy=payment-recebido]').check()
    cy.get('[data-cy=payment-save-btn]').click()

    cy.notification('Pagamento registrado com sucesso!')
    cy.contains('[data-cy=payment-card]', this.job.descricao)
      .find('[data-cy=payment-card-status]').should('have.text', 'Recebido')
  })

  it('Não deve registrar pagamento sem job e valor', () => {
    cy.get('[data-cy=tab-pagamentos-link]').click()
    cy.get('[data-cy=new-payment-btn]').click()
    cy.get('[data-cy=payment-save-btn]').click()

    cy.notification('Job, valor e data são obrigatórios')
  })

  it('Deve marcar um pagamento como recebido', function () {
    cy.createPaymentByApi({ jobId: this.job.id, valor: 300, recebido: false }).then((pagamento) => {
      cy.get('[data-cy=tab-pagamentos-link]').click()
      cy.get(`[data-cy=payment-card][data-id=${pagamento.id}]`)
        .find('[data-cy=payment-toggle-btn]').should('contain', 'Marcar como Recebido').click()

      cy.notification('Status do pagamento atualizado com sucesso!')
      cy.get(`[data-cy=payment-card][data-id=${pagamento.id}] [data-cy=payment-card-status]`)
        .should('have.text', 'Recebido')
    })
  })
})
