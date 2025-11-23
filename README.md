<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<br/>

<div align="center">

# Group Photo Fusion

A free, React-based AI web app that uses Google’s Gemini generative models to merge 2–4 separate portraits into a single, realistic group photo — without anyone needing to be photographed together.

Preserves identity, clothing, lighting, and visual consistency while reconstructing a believable shared moment.

<br/>

🔗 **Live App:** https://ai.studio/apps/drive/1Mzco4JGgDjy_u0uNd3-bEnhpXegLpP74  
💬 **Discord Community:** https://discord.gg/Aj2zqx7S  
☕ **Support development:** https://ko-fi.com/zgenmedia

</div>

---

## 🚀 Key Features

- **2–4 Person Fusion** — combine individual portraits into a cohesive group shot  
- **Identity Preservation** — faces, hairstyles, accessories & clothing remain intact  
- **Scenario Selection** — classic portraits, cinematic poses, candid interactions & more  
- **Custom Backgrounds** — upload your own and the AI matches lighting + perspective  
- **Body “Personas”** — optional descriptors (hourglass, athletic, rectangular, etc.)  
- **Batch Output** — multiple full-res generations per run  
- **No prompting required** — beginner-friendly UI  
- **Privacy-respecting** — user images are not stored

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite  
- **Styling:** Tailwind CSS  
- **AI Model:** Google Gemini (gemini-2.5-flash-image via `@google/genai`)  
- **Utilities:** jszip for bulk downloads

---

## 🧩 How It Works

1. Upload 2–4 separate portraits  
2. Select a scenario & optional body persona  
3. (Optional) Upload a background image  
4. The app auto-generates a cohesive group photo using Gemini AI  
5. Download or rerun for variations

---

## 💻 Run Locally

**Prerequisite:** Node.js

1. Install dependencies  
   ```sh
   npm install
