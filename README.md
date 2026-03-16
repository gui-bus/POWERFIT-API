# <p align="center"><img src="https://raw.githubusercontent.com/gui-bus/POWERFIT-Frontend/refs/heads/master/public/images/powerfit-logo.svg" alt="POWER.FIT Logo" width="400" /></p>

<p align="center">
  <strong>O Engine de Alta Performance para Gestão Fitness: Escalabilidade, IA e Gamificação.</strong>
</p>

<p align="center">
  <a href="https://powerfit.guibus.dev/"><img src="https://img.shields.io/badge/Live_Demo-POWER.FIT-orange?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://powerfit-api.guibus.dev/"><img src="https://img.shields.io/badge/API_Docs-Scalar-blue?style=for-the-badge&logo=scalar" alt="API Docs" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24.x-green?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Fastify-5.x-black?style=flat-square&logo=fastify" alt="Fastify" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/BetterAuth-1.4-red?style=flat-square" alt="BetterAuth" />
  <img src="https://img.shields.io/badge/AI_SDK-Vercel-black?style=flat-square&logo=vercel" alt="AI SDK" />
  <img src="https://img.shields.io/badge/Vitest-3.x-yellow?style=flat-square&logo=vitest" alt="Vitest" />
</p>

---

## 📖 Panorama Geral

A **PowerFIT API** é o núcleo de processamento do ecossistema POWER.FIT, uma infraestrutura de backend de nível industrial projetada para suportar alta concorrência e operações complexas de fitness. Construída sobre o **Fastify 5**, a API entrega uma performance superior com tipagem estrita via **Zod**, garantindo segurança e integridade de dados em cada request.

### 🎯 Diferenciais Estratégicos
- **Arquitetura Orientada a Casos de Uso:** Implementação rigorosa de Clean Architecture, separando lógica de negócio de infraestrutura para máxima testabilidade.
- **Contract-First Design:** Documentação interativa via **Scalar** e **Swagger**, servindo como fonte da verdade para a geração de tipos no frontend.
- **Segurança Multicamadas:** Proteção nativa com Helmet, Rate Limiting dinâmico e gestão de sessões robusta via Better-Auth.

---

## ✨ Ecossistema de Funcionalidades

### 🧠 Engine de Inteligência Artificial
Integrado ao **Vercel AI SDK** e **Google Gemini 2.0**, o backend atua como um personal trainer autônomo:
- **Intelligent Workout Generation:** Processamento de linguagem natural para transformar intenções de treino em esquemas de dados estruturados.
- **Function Calling:** Capacidade da IA de interagir diretamente com o banco de dados para criar e gerenciar planos em tempo real.

### 🏋️ Gestão de Performance
- **Workout Orchestrator:** Gerenciamento complexo de sessões de treino, templates reutilizáveis e histórico de volume de carga.
- **Biometric Tracking:** Rastreamento de evolução corporal e hidratação com análises estatísticas integradas.

### 🏆 Gamificação & Social Graph
- **XP & Achievement Pipeline:** Sistema assíncrono de recompensas baseado em ações do usuário (treinos, interações, recordes).
- **Social Interaction Engine:** Feed dinâmico com suporte a "Powerups" (curtidas), comentários e sistema de amizades bidirecional.
- **Competitive Challenges:** Infraestrutura para desafios globais e rankings em tempo real.

---

## 🛠️ Deep Dive Tecnológico

### Arquitetura de Backend
O projeto utiliza uma abordagem modular baseada em **Node.js 24 (ESM)** explorando:
- **Fastify Type Provider Zod:** Validação e tipagem automática de entrada/saída, eliminando inconsistências de dados.
- **Prisma ORM v7:** Modelagem de dados eficiente com PostgreSQL 16, utilizando transações ACID para operações críticas de gamificação.
- **Better-Auth:** Framework de autenticação moderno que gerencia sessões, RBAC (Role-Based Access Control) e segurança de identidade.

### Resiliência e Monitoramento
- **Structured Logging:** Logs detalhados com **Pino**, facilitando a observabilidade em ambientes de produção.
- **Sentry Integration:** Rastreamento de erros em tempo real com captura de contexto completo para depuração rápida.
- **UploadThing:** Gestão segura e performática de arquivos e mídias de perfil/atividades.

---

## 🏗️ Estrutura Arquitetural

```text
├── prisma/               # Schema do banco de dados e migrações
├── src/
│   ├── routes/           # Entrypoints da API (Fastify) com schemas Zod
│   ├── useCases/         # Lógica de negócio pura e independente
│   ├── lib/              # Infraestrutura (DB, Auth, AI, Sentry)
│   ├── schemas/          # Contratos de dados centralizados
│   ├── errors/           # Definições de erros customizados
│   └── index.ts          # Configuração e bootstrap do servidor
├── tests/                # Engenharia de Qualidade (Vitest)
└── docs/                 # Documentação técnica detalhada por módulo
```

---

## 🧪 Engenharia de Qualidade

A API mantém um padrão rigoroso de estabilidade com mais de 140 testes automatizados:
- **Use Case Testing:** Validação isolada de todas as regras de negócio e cálculos de XP/Volume.
- **Integration Testing:** Garantia de que o fluxo entre Banco de Dados, Auth e Rotas está íntegro.
- **Contract Validation:** Testes que asseguram que os schemas Zod correspondem à realidade dos dados.

Para rodar a suíte de testes:
```bash
pnpm test
```
