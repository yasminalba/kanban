# 📋 Kanban CRM

Sistema de CRM desenvolvido para organizar e acompanhar leads e tarefas de forma visual através de um quadro Kanban.

O projeto foi desenvolvido como uma forma de praticar desenvolvimento web, integração com banco de dados e publicação de uma aplicação completa na internet.

🔗 **Demo:** https://kanban-q9u2.vercel.app/

---

## ✨ Funcionalidades

- 📌 Visualização de leads e tarefas em um quadro Kanban
- 🔄 Movimentação dos cards entre diferentes etapas
- 📝 Organização visual do andamento das atividades
- 💾 Persistência dos dados utilizando Supabase
- ⚡ Integração com backend e banco de dados
- 🌐 Aplicação publicada na Vercel
- 🤖 Interface desenvolvida com apoio de Inteligência Artificial

---

## 🖥️ Preview

![Preview do Kanban](./src/assets/preview.png)

---

## 🛠️ Tecnologias utilizadas

- **React** — construção da interface
- **TypeScript** — tipagem e organização do código
- **Vite** — desenvolvimento e configuração do projeto
- **Supabase** — backend e banco de dados
- **Vercel** — deploy e hospedagem
- **Google AI Studio / Gemini** — apoio durante o desenvolvimento

---

## 📌 O que pratiquei

Durante o desenvolvimento deste projeto, pratiquei:

- Desenvolvimento de interfaces com React
- Utilização de TypeScript
- Criação e organização de componentes
- Integração de uma aplicação com banco de dados
- Manipulação e persistência de dados com Supabase
- Organização de informações em um quadro Kanban
- Configuração de variáveis de ambiente
- Deploy de uma aplicação web utilizando Vercel
- Uso de Inteligência Artificial como ferramenta de apoio ao desenvolvimento

---

## 🚀 Como executar o projeto

### Pré-requisitos

Para executar o projeto localmente, é necessário ter:

- [Bun](https://bun.sh/) instalado
- Uma conta no [Supabase](https://supabase.com/)
- Um projeto criado no Supabase

### 1. Clone o repositório

```bash
git clone https://github.com/yasminalba/kanban.git
cd kanban
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Abra o `.env` e preencha com as credenciais do seu projeto Supabase (disponíveis em **Project Settings → API** no painel do Supabase):

```env
VITE_SUPABASE_URL=sua-url-aqui
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 4. Execute o projeto

```bash
bun run dev
```

O app estará disponível em `http://localhost:5173` (ou na porta indicada no terminal).

---

## 📦 Deploy

O projeto está configurado para deploy automático na [Vercel](https://vercel.com/). Basta conectar o repositório e adicionar as mesmas variáveis de ambiente do `.env` nas configurações do projeto na Vercel.

---

## 📁 Estrutura do projeto

```
kanban/
├── src/              # Código-fonte da aplicação
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar e adaptar.

---

Feito por [Yasmin Alba](https://github.com/yasminalba) 💜
