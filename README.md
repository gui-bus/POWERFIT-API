# <p align="center"><img src="https://raw.githubusercontent.com/gui-bus/POWERFIT-Frontend/refs/heads/master/public/images/powerfit-logo.svg" alt="POWER.FIT Logo" width="400" /></p>

<p align="center">
  <img alt="Typescript" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Typescript.svg">
  <img alt="Zod" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Zod.svg">
  <img alt="Node JS" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NodeJS.svg">
  <img alt="Fastify" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Fastify.svg">
  <img alt="Prisma" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/PrismaORM.svg">
  <img alt="Postgresql" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Postgresql.svg">
  <img alt="Next Auth" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Next%20Auth.svg">
  <img alt="Docker" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Docker.svg">
  <img alt="Vercel" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Vercel.svg">
  <img alt="Vitest" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Vitest.svg">
  <img alt="Husky" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Husky.svg">
  <img alt="Conventional Commits" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Conventional%20Commits.svg">
  <img alt="Cursor" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Cursor.svg">
  <img alt="Gemini" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Gemini.svg">
  <img alt="Windsurf" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Windsurf.svg">
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

## 🧪 Engenharia de Qualidade

A API mantém um padrão rigoroso de estabilidade com mais de 140 testes automatizados:
- **Use Case Testing:** Validação isolada de todas as regras de negócio e cálculos de XP/Volume.
- **Integration Testing:** Garantia de que o fluxo entre Banco de Dados, Auth e Rotas está íntegro.
- **Contract Validation:** Testes que asseguram que os schemas Zod correspondem à realidade dos dados.
pnpm test
```
