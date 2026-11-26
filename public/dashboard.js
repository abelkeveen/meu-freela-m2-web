// Variáveis globais
let currentTab = "clientes";
let clients = [];
let jobs = [];
let payments = [];
let currentEditingClient = null;
let currentEditingJob = null;

// Função para verificar autenticação
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return false;
  }
  return token;
}

// Função para fazer requisições autenticadas
async function authenticatedRequest(url, options = {}) {
  const token = checkAuth();
  if (!token) return null;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.error || "Erro na requisição", "danger");
      return null;
    }

    return data;
  } catch (error) {
    showNotification(
      "Erro de conexão. Verifique se a API está rodando.",
      "danger"
    );
    return null;
  }
}

// Função para mostrar notificações
function showNotification(message, type = "info", duration = 5000) {
  const notificationArea = document.getElementById("notification-area");
  const notificationId = Date.now();

  const notification = document.createElement("div");
  notification.className = `notification is-${type}`;
  notification.id = `notification-${notificationId}`;
  notification.dataset.cy = "notification";
  notification.dataset.type = type;
  notification.innerHTML = `
        <button class="delete" onclick="removeNotification('${notificationId}')"></button>
        ${escapeHtml(message)}
    `;

  notificationArea.appendChild(notification);

  setTimeout(() => {
    removeNotification(notificationId);
  }, duration);
}

function removeNotification(id) {
  const notification = document.getElementById(`notification-${id}`);
  if (notification) {
    notification.remove();
  }
}

// Função para logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

// Função para alternar abas
function showTab(tabName) {
  // Esconder todas as seções
  document.getElementById("section-clientes").style.display = "none";
  document.getElementById("section-jobs").style.display = "none";
  document.getElementById("section-pagamentos").style.display = "none";

  // Remover classe active de todas as abas
  document.getElementById("tab-clientes").classList.remove("is-active");
  document.getElementById("tab-jobs").classList.remove("is-active");
  document.getElementById("tab-pagamentos").classList.remove("is-active");

  // Mostrar seção atual e ativar aba
  document.getElementById(`section-${tabName}`).style.display = "block";
  document.getElementById(`tab-${tabName}`).classList.add("is-active");

  currentTab = tabName;

  // Carregar dados da aba atual
  if (tabName === "clientes") {
    loadClients();
  } else if (tabName === "jobs") {
    loadJobs();
  } else if (tabName === "pagamentos") {
    loadPayments();
  }
}

// Escapa texto vindo da API antes de inserir no HTML
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Data/hora local no formato aceito por <input type="datetime-local">
function toLocalInputValue(date) {
  const d = new Date(date);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Funções para formatar valores
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("pt-BR");
}

// Carregar resumo financeiro
async function loadSummary() {
  const data = await authenticatedRequest("/api/payments/summary");
  if (data) {
    document.getElementById("total-recebido").textContent = formatCurrency(
      data.totalRecebido
    );
    document.getElementById("total-pendente").textContent = formatCurrency(
      data.totalPendente
    );
  }
}

// === CLIENTES ===

// Carregar clientes
async function loadClients() {
  const data = await authenticatedRequest("/api/clients");
  if (data) {
    clients = data;
    renderClients();
  }
}

// Renderizar lista de clientes
function renderClients() {
  const clientsList = document.getElementById("clients-list");

  if (clients.length === 0) {
    clientsList.innerHTML = `
            <div class="notification is-info" data-cy="clients-empty">
                <i class="fas fa-info-circle mr-2"></i>
                Nenhum cliente cadastrado. Clique em "Novo Cliente" para adicionar o primeiro.
            </div>
        `;
    return;
  }

  const clientsHtml = clients
    .map(
      (client) => `
        <div class="card mb-3" data-cy="client-card" data-id="${client.id}">
            <div class="card-content">
                <div class="level">
                    <div class="level-left">
                        <div class="level-item">
                            <div>
                                <p class="title is-5" data-cy="client-card-nome">${escapeHtml(client.nome)}</p>
                                <p class="subtitle is-6" data-cy="client-card-contato">${escapeHtml(
                                  client.contato || "Sem contato"
                                )}</p>
                            </div>
                        </div>
                    </div>
                    <div class="level-right">
                        <div class="level-item">
                            <div class="buttons">
                                <button class="button is-small is-info" data-cy="client-edit-btn" onclick="editClient(${
                                  client.id
                                })">
                                    <span class="icon">
                                        <i class="fas fa-edit"></i>
                                    </span>
                                </button>
                                <button class="button is-small is-danger" data-cy="client-delete-btn" onclick="deleteClient(${
                                  client.id
                                })">
                                    <span class="icon">
                                        <i class="fas fa-trash"></i>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  clientsList.innerHTML = clientsHtml;
}

// Modal de cliente
function openClientModal(client = null) {
  currentEditingClient = client;

  if (client) {
    document.getElementById("client-modal-title").textContent =
      "Editar Cliente";
    document.getElementById("client-id").value = client.id;
    document.getElementById("client-nome").value = client.nome;
    document.getElementById("client-contato").value = client.contato || "";
  } else {
    document.getElementById("client-modal-title").textContent = "Novo Cliente";
    document.getElementById("client-form").reset();
    document.getElementById("client-id").value = "";
  }

  document.getElementById("client-modal").classList.add("is-active");
}

function closeClientModal() {
  document.getElementById("client-modal").classList.remove("is-active");
  currentEditingClient = null;
}

function editClient(id) {
  const client = clients.find((c) => c.id === id);
  if (client) {
    openClientModal(client);
  }
}

async function saveClient() {
  const id = document.getElementById("client-id").value;
  const nome = document.getElementById("client-nome").value;
  const contato = document.getElementById("client-contato").value;

  if (!nome.trim()) {
    showNotification("Nome é obrigatório", "danger");
    return;
  }

  const clientData = { nome, contato };

  let data;
  if (id) {
    // Editar cliente existente
    data = await authenticatedRequest(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    });
  } else {
    // Criar novo cliente
    data = await authenticatedRequest("/api/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    });
  }

  if (data) {
    showNotification(
      id ? "Cliente atualizado com sucesso!" : "Cliente criado com sucesso!",
      "success"
    );
    closeClientModal();
    loadClients();
  }
}

async function deleteClient(id) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) {
    return;
  }

  try {
    const response = await fetch(`/api/clients/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 204) {
      showNotification("Cliente removido com sucesso!", "success");
      loadClients();
      return;
    }

    // Se não for 204, tenta ler o corpo
    const data = await response.json();
    if (response.ok) {
      showNotification("Cliente removido com sucesso!", "success");
      loadClients();
    } else {
      showNotification(data.error || "Erro ao remover cliente", "danger");
    }
  } catch (error) {
    showNotification(
      "Erro de conexão. Verifique se a API está rodando.",
      "danger"
    );
  }
}

// === JOBS ===

// Carregar jobs
async function loadJobs() {
  const data = await authenticatedRequest("/api/jobs");
  if (data) {
    jobs = data;
    // Recarrega os clientes antes de desenhar, para mostrar o nome correto
    await fetchClients();
    renderJobs();
  }
}

// Renderizar lista de jobs
function renderJobs() {
  const jobsList = document.getElementById("jobs-list");

  if (jobs.length === 0) {
    jobsList.innerHTML = `
            <div class="notification is-info" data-cy="jobs-empty">
                <i class="fas fa-info-circle mr-2"></i>
                Nenhum job cadastrado. Clique em "Novo Job" para adicionar o primeiro.
            </div>
        `;
    return;
  }

  const jobsHtml = jobs
    .map((job) => {
      const client = clients.find((c) => c.id == job.clienteId);
      const statusColor = getStatusColor(job.status);

      return `
            <div class="card mb-3" data-cy="job-card" data-id="${job.id}">
                <div class="card-content">
                    <div class="level">
                        <div class="level-left">
                            <div class="level-item">
                                <div>
                                    <p class="title is-5" data-cy="job-card-descricao">${escapeHtml(
                                      job.descricao
                                    )}</p>
                                    <p class="subtitle is-6" data-cy="job-card-cliente">Cliente: ${escapeHtml(
                                      client
                                        ? client.nome
                                        : "Cliente não encontrado"
                                    )}</p>
                                    <p class="subtitle is-6" data-cy="job-card-valor">Valor: ${formatCurrency(
                                      job.valor
                                    )}</p>
                                    <span class="tag ${statusColor}" data-cy="job-card-status">${escapeHtml(
                                      job.status
                                    )}</span>
                                    <p class="has-text-grey is-size-7 mt-2">${formatDate(
                                      job.data
                                    )}</p>
                                </div>
                            </div>
                        </div>
                        <div class="level-right">
                            <div class="level-item">
                                <div class="buttons">
                                    <button class="button is-small is-info" data-cy="job-edit-btn" onclick="editJob(${
                                      job.id
                                    })">
                                        <span class="icon">
                                            <i class="fas fa-edit"></i>
                                        </span>
                                    </button>
                                    <button class="button is-small is-danger" data-cy="job-delete-btn" onclick="deleteJob(${
                                      job.id
                                    })">
                                        <span class="icon">
                                            <i class="fas fa-trash"></i>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");

  jobsList.innerHTML = jobsHtml;
}

function getStatusColor(status) {
  switch (status) {
    case "pendente":
      return "is-warning";
    case "em_andamento":
      return "is-info";
    case "concluido":
      return "is-success";
    case "cancelado":
      return "is-danger";
    default:
      return "is-light";
  }
}

// Modal de job
async function openJobModal(job = null) {
  currentEditingJob = job;
  await loadClientsForSelect();

  if (job) {
    document.getElementById("job-modal-title").textContent = "Editar Job";
    document.getElementById("job-id").value = job.id;
    document.getElementById("job-cliente").value = job.clienteId;
    document.getElementById("job-descricao").value = job.descricao;
    document.getElementById("job-valor").value = job.valor;
    document.getElementById("job-status").value = job.status;
    document.getElementById("job-data").value = toLocalInputValue(job.data);
  } else {
    document.getElementById("job-modal-title").textContent = "Novo Job";
    document.getElementById("job-form").reset();
    document.getElementById("job-id").value = "";
    // Definir data atual como padrão
    document.getElementById("job-data").value = toLocalInputValue(new Date());
  }

  document.getElementById("job-modal").classList.add("is-active");
}

function closeJobModal() {
  document.getElementById("job-modal").classList.remove("is-active");
  currentEditingJob = null;
}

// Busca a lista atual de clientes (sem mexer na tela)
async function fetchClients() {
  const data = await authenticatedRequest("/api/clients");
  if (data) {
    clients = data;
  }
}

// Preenche o select de clientes do modal de job
async function loadClientsForSelect() {
  await fetchClients();

  const select = document.getElementById("job-cliente");
  select.innerHTML = '<option value="">Selecione um cliente</option>';

  clients.forEach((client) => {
    select.innerHTML += `<option value="${client.id}">${escapeHtml(
      client.nome
    )}</option>`;
  });
}

function editJob(id) {
  const job = jobs.find((j) => j.id === id);
  if (job) {
    openJobModal(job);
  }
}

async function saveJob() {
  const id = document.getElementById("job-id").value;
  const clienteId = parseInt(document.getElementById("job-cliente").value);
  const descricao = document.getElementById("job-descricao").value;
  const valor = parseFloat(document.getElementById("job-valor").value);
  const status = document.getElementById("job-status").value;
  const data = document.getElementById("job-data").value;

  if (!clienteId || !descricao.trim() || !valor || !status || !data) {
    showNotification("Todos os campos são obrigatórios", "danger");
    return;
  }

  const jobData = { clienteId, descricao, valor, status, data };

  let result;
  if (id) {
    // Editar job existente
    result = await authenticatedRequest(`/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    });
  } else {
    // Criar novo job
    result = await authenticatedRequest("/api/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  }

  if (result) {
    showNotification(
      id ? "Job atualizado com sucesso!" : "Job criado com sucesso!",
      "success"
    );
    closeJobModal();
    loadJobs();
    loadSummary(); // Atualizar resumo financeiro
  }
}

async function deleteJob(id) {
  if (!confirm("Tem certeza que deseja excluir este job?")) {
    return;
  }

  try {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 204) {
      showNotification("Job removido com sucesso!", "success");
      loadJobs();
      loadSummary();
      return;
    }

    // Se não for 204, tenta ler o corpo
    const data = await response.json();
    if (response.ok) {
      showNotification("Job removido com sucesso!", "success");
      loadJobs();
      loadSummary();
    } else {
      showNotification(data.error || "Erro ao remover job", "danger");
    }
  } catch (error) {
    showNotification(
      "Erro de conexão. Verifique se a API está rodando.",
      "danger"
    );
  }
}

// === PAGAMENTOS ===

// Carregar pagamentos
async function loadPayments() {
  const data = await authenticatedRequest("/api/payments");
  if (data) {
    payments = data;
    // Recarrega os jobs antes de desenhar, para mostrar a descrição correta
    await fetchJobs();
    renderPayments();
  }
}

// Renderizar lista de pagamentos
function renderPayments() {
  const paymentsList = document.getElementById("payments-list");

  if (payments.length === 0) {
    paymentsList.innerHTML = `
            <div class="notification is-info" data-cy="payments-empty">
                <i class="fas fa-info-circle mr-2"></i>
                Nenhum pagamento registrado. Clique em "Novo Pagamento" para adicionar o primeiro.
            </div>
        `;
    return;
  }

  const paymentsHtml = payments
    .map((payment) => {
      const job = jobs.find((j) => j.id == payment.jobId);
      const statusColor = payment.recebido ? "is-success" : "is-warning";
      const statusText = payment.recebido ? "Recebido" : "Pendente";
      const clienteNome = payment.clienteNome || "Cliente não informado";

      return `
            <div class="card mb-3" data-cy="payment-card" data-id="${payment.id}">
                <div class="card-content">
                    <div class="level">
                        <div class="level-left">
                            <div class="level-item">
                                <div>
                                    <p class="title is-5" data-cy="payment-card-valor">${formatCurrency(
                                      payment.valor
                                    )}</p>
                                    <p class="subtitle is-6" data-cy="payment-card-job">Job: ${escapeHtml(
                                      job ? job.descricao : "Job não encontrado"
                                    )}</p>
                                    <p class="subtitle is-6" data-cy="payment-card-cliente">Cliente: ${escapeHtml(
                                      clienteNome
                                    )}</p>
                                    <span class="tag ${statusColor}" data-cy="payment-card-status">${statusText}</span>
                                    <p class="has-text-grey is-size-7 mt-2">${formatDate(
                                      payment.data
                                    )}</p>
                                </div>
                            </div>
                        </div>
                        <div class="level-right">
                            <div class="level-item">
                                <div class="buttons">
                                    <button data-cy="payment-toggle-btn" class="button is-small ${
                                      payment.recebido
                                        ? "is-warning"
                                        : "is-success"
                                    }" 
                                            onclick="togglePaymentStatus(${
                                              payment.id
                                            }, ${payment.recebido})">
                                        <span class="icon">
                                            <i class="fas ${
                                              payment.recebido
                                                ? "fa-undo"
                                                : "fa-check"
                                            }"></i>
                                        </span>
                                        <span>${
                                          payment.recebido
                                            ? "Marcar como Pendente"
                                            : "Marcar como Recebido"
                                        }</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");

  paymentsList.innerHTML = paymentsHtml;
}

// Modal de pagamento
async function openPaymentModal() {
  await loadJobsForPaymentSelect();
  document.getElementById("payment-form").reset();
  // Definir data atual como padrão
  document.getElementById("payment-data").value = toLocalInputValue(new Date());
  document.getElementById("payment-modal").classList.add("is-active");
}

function closePaymentModal() {
  document.getElementById("payment-modal").classList.remove("is-active");
}

// Busca a lista atual de jobs (sem mexer na tela)
async function fetchJobs() {
  const data = await authenticatedRequest("/api/jobs");
  if (data) {
    jobs = data;
  }
}

// Preenche o select de jobs do modal de pagamento
async function loadJobsForPaymentSelect() {
  await fetchJobs();

  const select = document.getElementById("payment-job");
  select.innerHTML = '<option value="">Selecione um job</option>';

  jobs.forEach((job) => {
    select.innerHTML += `<option value="${job.id}">${escapeHtml(
      job.descricao
    )} - ${formatCurrency(job.valor)}</option>`;
  });
}

async function savePayment() {
  const jobId = parseInt(document.getElementById("payment-job").value);
  const valor = parseFloat(document.getElementById("payment-valor").value);
  const recebido = document.getElementById("payment-recebido").checked;
  const data = document.getElementById("payment-data").value;

  if (!jobId || !valor || !data) {
    showNotification("Job, valor e data são obrigatórios", "danger");
    return;
  }

  const paymentData = { jobId, valor, recebido, data };

  const result = await authenticatedRequest("/api/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });

  if (result) {
    showNotification("Pagamento registrado com sucesso!", "success");
    closePaymentModal();
    loadPayments();
    loadSummary(); // Atualizar resumo financeiro
  }
}

async function togglePaymentStatus(paymentId, currentStatus) {
  const token = localStorage.getItem("token");
  const novoStatus = !currentStatus;
  try {
    const response = await fetch(`/api/payments/${paymentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recebido: novoStatus }),
    });
    if (response.ok) {
      showNotification(
        "Status do pagamento atualizado com sucesso!",
        "success"
      );
      loadPayments();
      loadSummary();
    } else {
      const data = await response.json();
      showNotification(
        data.error || "Erro ao atualizar status do pagamento",
        "danger"
      );
    }
  } catch (error) {
    showNotification(
      "Erro de conexão. Verifique se a API está rodando.",
      "danger"
    );
  }
}

// Inicialização da página
window.addEventListener("load", () => {
  if (checkAuth()) {
    loadSummary();
    showTab("clientes"); // Mostrar aba de clientes por padrão
  }
});
