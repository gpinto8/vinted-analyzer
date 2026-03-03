# Vinted Analyzer

Web app to upload product photos, set condition, and get listing data (title, category, size, suggested prices) using **Google Gemini** for image analysis. Optimize your Vinted listings with AI-generated titles and descriptions.

## Stack

- **Next.js 14** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**
- **Google Gemini** (REST API) for vision and listing generation

## Setup

### 1. Gemini API key

Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 2. Local development

```bash
cd vinted-analyzer
npm install
cp .env.example .env.local
```

Edit **`.env.local`** and set your Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Deploy on Vercel

1. Push the repo to **GitHub**.
2. In [Vercel](https://vercel.com), **Import** the GitHub repository.
3. Add **Environment Variables**: `GEMINI_API_KEY` = your Gemini API key.
4. Deploy.

The app uses the `/api/analyze` route to call Gemini locally. The API key is only used on the server.

## Usage

1. Upload one or more product images (max 16).
2. Select **Condition** (e.g. Ottimo stato, Come nuovo).
3. Optionally fill **Product type** and **Brand**.
4. Click **Analyze**.
5. The result (title, category, prices, etc.) is shown on the page.

## License

MIT
