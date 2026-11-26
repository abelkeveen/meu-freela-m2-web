const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 4000;
const API_BASE_URL = "http://localhost:3000";

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Middleware para verificar token JWT nas rotas protegidas
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  req.token = token;
  next();
};

// Rota principal - Login/Register
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota do dashboard (após login)
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// API Routes - Autenticação
app.post("/api/auth/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro interno do servidor";
    res.status(status).json({ error: message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Credenciais inválidas";
    res.status(status).json({ error: message });
  }
});

// API Routes - Clientes
app.get("/api/clients", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro ao buscar clientes";
    res.status(status).json({ error: message });
  }
});

app.post("/api/clients", authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/clients`, req.body, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro ao criar cliente";
    res.status(status).json({ error: message });
  }
});

app.put("/api/clients/:id", authenticateToken, async (req, res) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/clients/${req.params.id}`,
      req.body,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error || "Erro ao atualizar cliente";
    res.status(status).json({ error: message });
  }
});

app.delete("/api/clients/:id", authenticateToken, async (req, res) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/clients/${req.params.id}`,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );
    res
      .status(response.status)
      .json({ message: "Cliente removido com sucesso" });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro ao remover cliente";
    res.status(status).json({ error: message });
  }
});

// API Routes - Jobs
app.get("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs`, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro ao buscar jobs";
    res.status(status).json({ error: message });
  }
});

app.post("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs`, req.body, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro ao criar job";
    res.status(status).json({ error: message });
  }
});

app.put("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/jobs/${req.params.id}`,
      req.body,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro ao atualizar job";
    res.status(status).json({ error: message });
  }
});

app.delete("/api/jobs/:id", authenticateToken, async (req, res) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/jobs/${req.params.id}`,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );
    res.status(response.status).json({ message: "Job removido com sucesso" });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Erro ao remover job";
    res.status(status).json({ error: message });
  }
});

// API Routes - Pagamentos
app.get("/api/payments", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payments`, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error || "Erro ao buscar pagamentos";
    res.status(status).json({ error: message });
  }
});

app.post("/api/payments", authenticateToken, async (req, res) => {
  try {
    // O campo clienteNome será repassado para a API
    const response = await axios.post(`${API_BASE_URL}/payments`, req.body, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error || "Erro ao registrar pagamento";
    res.status(status).json({ error: message });
  }
});

app.get("/api/payments/summary", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payments/summary`, {
      headers: { Authorization: `Bearer ${req.token}` },
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error || "Erro ao buscar resumo financeiro";
    res.status(status).json({ error: message });
  }
});

app.put("/api/payments/:id/status", authenticateToken, async (req, res) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/payments/${req.params.id}/status`,
      req.body,
      {
        headers: { Authorization: `Bearer ${req.token}` },
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error || "Erro ao atualizar status do pagamento";
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
