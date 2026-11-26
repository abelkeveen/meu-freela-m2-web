describe('Jobs', () => {
  beforeEach(() => {
    cy.openDashboard()
    cy.createClientByApi().as('cliente')
  })

  it('Deve cadastrar um job vinculado a um cliente', function () {
    const descricao = `Site institucional ${Date.now()}`

    cy.get('[data-cy=tab-jobs-link]').click()
    cy.get('[data-cy=new-job-btn]').click()
    cy.get('[data-cy=job-cliente]').select(this.cliente.nome)
    cy.get('[data-cy=job-descricao]').type(descricao)
    cy.get('[data-cy=job-valor]').type('1500')
    cy.get('[data-cy=job-status]').select('em_andamento')
    cy.get('[data-cy=job-save-btn]').click()

    cy.notification('Job criado com sucesso!')
    cy.contains('[data-cy=job-card]', descricao).within(() => {
      cy.get('[data-cy=job-card-cliente]').should('contain', this.cliente.nome)
      cy.get('[data-cy=job-card-valor]').should('contain', '1.500,00')
      cy.get('[data-cy=job-card-status]').should('have.text', 'em_andamento')
    })
  })

  it('Não deve cadastrar job sem campos obrigatórios', () => {
    cy.get('[data-cy=tab-jobs-link]').click()
    cy.get('[data-cy=new-job-btn]').click()
    cy.get('[data-cy=job-save-btn]').click()

    cy.notification('Todos os campos são obrigatórios')
  })

  it('Deve editar o status de um job', function () {
    cy.createJobByApi({ clienteId: this.cliente.id }).then((job) => {
      cy.get('[data-cy=tab-jobs-link]').click()
      cy.get(`[data-cy=job-card][data-id=${job.id}]`)
        .find('[data-cy=job-edit-btn]').click()
      cy.get('[data-cy=job-status]').select('concluido')
      cy.get('[data-cy=job-save-btn]').click()

      cy.notification('Job atualizado com sucesso!')
      cy.get(`[data-cy=job-card][data-id=${job.id}] [data-cy=job-card-status]`)
        .should('have.text', 'concluido')
    })
  })

  it('Deve remover um job sem pagamentos', function () {
    cy.createJobByApi({ clienteId: this.cliente.id }).then((job) => {
      cy.get('[data-cy=tab-jobs-link]').click()
      cy.get(`[data-cy=job-card][data-id=${job.id}]`)
        .find('[data-cy=job-delete-btn]').click()

      cy.notification('Job removido com sucesso!')
      cy.get(`[data-cy=job-card][data-id=${job.id}]`).should('not.exist')
    })
  })

  it('Não deve remover job com pagamento vinculado', function () {
    cy.createJobByApi({ clienteId: this.cliente.id }).then((job) => {
      cy.createPaymentByApi({ jobId: job.id })
      cy.get('[data-cy=tab-jobs-link]').click()
      cy.get(`[data-cy=job-card][data-id=${job.id}]`)
        .find('[data-cy=job-delete-btn]').click()

      cy.notification('Não é possível remover o job: existem pagamentos vinculados.')
      cy.get(`[data-cy=job-card][data-id=${job.id}]`).should('exist')
    })
  })
})
