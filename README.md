# 🌿 Ayurveda Fruits & Veggies API

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-5A67D8.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-blue.svg)](https://www.postgresql.org/)
[![Groq API](https://img.shields.io/badge/LLM-Groq%20Cloud-orange.svg)](https://groq.com/)

API RESTful desenvolvida com **Node.js**, **Express**, **PostgreSQL** e **Prisma ORM**, integrada a um modelo de **LLM Open-Source via Groq API (Llama / Qwen)** para recomendação e análise de frutas e legumes sazonais com base nos princípios da Medicina Ayurveda (Estações x Doshas).

O projeto conta com um CRUD completo de alimentos, validações estruturadas, suporte a filtros via query parameters e uma interface interativa de terminal (CLI) para testes e depuração dos endpoints.

---

## 📐 Arquitetura do Projeto

A aplicação adota o padrão de arquitetura em camadas (**MVC / Clean Lite**), garantindo separação de responsabilidades e facilidade de manutenção:

```text
ayurveda-fruits-api/
├── prisma/
│   └── schema.prisma              # Definições de tabelas, enums e relacionamentos
├── src/
│   ├── config/
│   │   └── database.js            # Instância centralizada do Prisma Client
│   ├── controllers/
│   │   ├── FoodController.js      # Handlers HTTP para o CRUD de alimentos
│   │   └── AyurvedaController.js  # Handler HTTP para consultas LLM
│   ├── services/
│   │   ├── FoodService.js         # Regras de negócio e chamadas ao banco
│   │   └── LlmService.js          # Integração e descoberta dinâmica de modelos da Groq
│   ├── routes/
│   │   ├── foodRoutes.js          # Rotas REST de alimentos
│   │   └── ayurvedaRoutes.js      # Rota de recomendação via LLM
│   ├── cli.js                     # Interface interativa de terminal (CLI)
│   ├── app.js                     # Configuração do Express e Middlewares
│   └── server.js                  # Ponto de entrada do servidor
├── .env.example                   # Exemplo de variáveis de ambiente
├── package.json
└── README.md
```

---

## ⚙️ Tecnologias e Ferramentas

| Categoria | Tecnologia |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework Web | Express.js |
| Banco de Dados | PostgreSQL |
| ORM | Prisma ORM |
| IA / LLM | Groq SDK (`llama-3.1-8b-instant`, `gemma2-9b-it`, `llama-3.3-70b`) |
| CLI / UX Terminal | Inquirer, Axios, Chalk |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js v18+ instalado
- Instância do PostgreSQL ativa
- Chave de API gratuita da [Groq Cloud Console](https://console.groq.com/)

### 1. Clonar o Repositório e Instalar Dependências

```bash
git clone https://github.com/SEU_USUARIO/ayurveda-fruits-api.git
cd ayurveda-fruits-api
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/ayurveda_db?schema=public"
PORT=3000
GROQ_API_KEY="gsk_sua_chave_groq_aqui"
```

### 3. Executar as Migrations do Prisma

Crie as tabelas no banco PostgreSQL:

```bash
npx prisma migrate dev
```

### 4. Iniciar o Servidor

```bash
# Modo de desenvolvimento (com auto-reload)
npm run dev

# Modo de produção
npm start
```

O servidor estará rodando em `http://localhost:3000`.

---

## 🖥️ Testando a API via CLI no Terminal

O projeto possui uma ferramenta CLI interativa para realizar consultas e cadastros diretamente pelo terminal.

Com a API rodando em um terminal, abra uma segunda janela do terminal e execute:

```bash
npm run cli
```

---

## 📌 Endpoints da API REST

### 🥑 Alimentos (`/api/foods`)

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/foods` | Cadastra um novo alimento |
| `GET` | `/api/foods` | Lista todos os alimentos (suporta `?season=` e `?category=`) |
| `GET` | `/api/foods/:id` | Busca alimento por UUID |
| `PUT` | `/api/foods/:id` | Atualiza dados de um alimento |
| `DELETE` | `/api/foods/:id` | Deleta um alimento por UUID |

**Exemplo de Payload — Criar Alimento (`POST /api/foods`):**

```json
{
  "name": "Manga",
  "category": "FRUIT",
  "season": "SUMMER",
  "pacifies": ["VATA", "PITTA"],
  "description": "Fruta doce e nutritiva, excelente para pacificar Vata e Pitta no verão."
}
```

### 🧘 Ayurveda & LLM (`/api/ayurveda`)

| Método | Endpoint | Parâmetros | Descrição |
|---|---|---|---|
| `GET` | `/api/ayurveda/recommendations` | `season`, `dosha` | Retorna lista de frutas/legumes sazonais via LLM |

**Exemplo de Requisição:**

```
GET http://localhost:3000/api/ayurveda/recommendations?season=WINTER&dosha=VATA
```

**Exemplo de Resposta JSON:**

```json
{
  "recommendations": [
    {
      "name": "Abóbora",
      "category": "VEGETABLE",
      "reason": "Alimento denso e aquecedor, ideal para pacificar o ar e a secura do Vata no inverno."
    },
    {
      "name": "Gengibre",
      "category": "VEGETABLE",
      "reason": "Estimula o agni (fogo digestivo), combatendo o frio característico da estação."
    }
  ]
}
```

---

## 📄 Licença

Este projeto está sob a licença ISC.