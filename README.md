<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1HO-ynlTDXZHOaXa0ffEg378b1MCefB3f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev` (porta 5000)

## Usuários na planilha + deploy na Vercel

Para login multi-dispositivo com dados sincronizados numa planilha do Google e
publicação na Vercel, siga o guia: **[SETUP_SHEETS.md](SETUP_SHEETS.md)**.
Sem configurar a planilha, o app funciona normalmente só com `localStorage`.
