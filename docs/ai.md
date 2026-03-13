# AI Personal Trainer

PowerFIT integrates state-of-the-art Generative AI to provide a personalized coaching experience.

## 🤖 Technology

- **Model:** Google Gemini 2.0.
- **Provider:** Vercel AI SDK.
- **Implementation:** Structured Prompting + Function Calling (Tools).

## 🧠 Capabilities

The AI Trainer is more than just a chatbot; it has "eyes" on the user's data and "hands" to perform actions through **Function Calling**.

### 1. Contextual Coaching
The AI receives the user's full profile, level, recent workout history, and personal records as context before each interaction.

### 2. Automated Actions (Tools)
The AI can autonomously perform the following actions based on user requests:
- **`generateWorkoutPlan`**: Creates a complete, periodized workout plan and saves it directly to the user's account.
- **`updateBodyProgress`**: Records new weight or body fat measurements if mentioned in the chat.
- **`analyzePerformance`**: Provides insights into volume trends and suggests progressive overload.

## 🛡️ Safety & Guardrails

- **Domain Restriction:** The system prompt restricts the AI to fitness and health topics only.
- **Data Privacy:** Personal data is used only for prompt context and is never used for training the global model.
