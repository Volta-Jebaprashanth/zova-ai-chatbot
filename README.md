# Zova - AI Shopping Assistant 🤖

![Zova Banner](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red?style=for-the-badge)

> A free, open-source, and fully customizable AI chatbot powered by Google's Gemini. Integrate it into any website in minutes.
# **Official Website:** [https://zova.voltajeba.com/](https://zova.voltajeba.com/)


### **Live Demo:** [https://aura-living.voltajeba.com/](https://aura-living.voltajeba.com/)  

---

## ✨ Why Choose Zova?

### 🚀 Powered by Gemini
Leverages the speed and intelligence of **Gemini** for instant, accurate responses that enhance customer experience.

### 🎨 Fully Customizable
Configure everything from the bot's name and personality to theme colors via a simple JSON file. Make it truly yours!

### 🔒 Secure & Private
Hide your API keys using **Cloudflare Workers**. Your data and your customers' privacy are prioritized.

### 🌐 Universal Integration
Works with **any website**. Just drop the folder, add the script tag, and you're ready to go - no complex setup required!

---

## 📦 Quick Start

### Prerequisites

- A website (any HTML-based site)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))
- Cloudflare account (free tier works!)

### Integration in 3 Simple Steps

#### 1️⃣ Download & Drop

Clone or download the `chatbot` folder and place it in your website's root directory:

```bash
git clone https://github.com/Volta-Jebaprashanth/zova-ai-chatbot.git
```

Your project structure should look like:
```
your-website/
├── index.html
├── chatbot/
│   ├── config.json
│   ├── data/
│   ├── src/
│   └── icon/
└── ...
```

#### 2️⃣ Add the Script

Include this script tag just before the closing `</body>` tag in your HTML:

```html
<script src="chatbot/src/chatbot.js"></script>
</body>
```

#### 3️⃣ Configure

Edit `chatbot/config.json` to match your brand and add your Cloudflare Worker URL (see [detailed setup guide](https://zova.voltajeba.com/setup-guide.html)).

---

## ⚙️ Configuration

Zova is controlled entirely through `config.json`. Here's what you can customize:

### Business Information
```json
{
  "business": {
    "name": "Your Business Name",
    "description": "Your business description"
  }
}
```

### Bot Configuration
```json
{
  "bot": {
    "name": "Zova",
    "role": "AI Shopping Assistant",
    "initialMessage": "Hello! How can I help you today?"
  }
}
```

### Theme Customization
```json
{
  "theme": {
    "mode": "light",
    "colors": {
      "primaryColor": "#22c55e",
      "primaryGlow": "rgba(34, 197, 94, 0.4)"
    },
    "icon": "icon/icon.png"
  }
}
```

### LLM Configuration
```json
{
  "llmConfig": {
    "model": "gemini-2.5-flash-lite",
    "systemPrompt": "You are a helpful AI assistant...",
    "constraints": [
      "Keep answers concise (under 50 words)",
      "Speak in user's preferred language",
      "Maintain a friendly tone"
    ]
  }
}
```

### Features
```json
{
  "features": {
    "enableVoiceInput": true,
    "enableTextToSpeech": false
  }
}
```

### Data Sources
```json
{
  "dataSources": [
    "data/data.json",
    "data/products.txt",
    "data/faq.json"
  ]
}
```

---

## 📊 Data Sources

Zova supports both **JSON** and **TXT** files as data sources to understand your business. Configure them in `config.json`:

```json
{
  "dataSources": [
    "data/data.json",
    "data/policies.txt",
    "data/faq.json"
  ]
}
```

### JSON Data Files
Edit `chatbot/data/data.json` to include structured information:

- Store information and story
- Products and services
- Contact details and hours
- FAQs
- Staff information
- Policies (shipping, returns, warranty)

**Example structure:**
```json
{
  "name": "Your Store Name",
  "tagline": "Your tagline",
  "description": "Store description",
  "contact": {
    "email": "hello@example.com",
    "phone": "+1 (555) 123-4567"
  },
  "products": [
    {
      "name": "Product Name",
      "price": "$99.00",
      "description": "Product description",
      "stock": "In Stock"
    }
  ],
  "FAQs": [
    {
      "question": "Your question?",
      "answer": "Your answer"
    }
  ]
}
```

### TXT Data Files
You can also use plain text files (`.txt`) for unstructured information like policies, guides, or any other textual content. The chatbot will read and understand the content.

**Example `data/policies.txt`:**
```txt
Shipping Policy:
Free shipping on orders over $500. Standard US shipping takes 3–5 business days.

Return Policy:
30-day return policy for all items in original condition. Return shipping is free.

Warranty:
All furniture includes a 2-year manufacturer warranty.
```

> **Note:** You can mix and match JSON and TXT files. Add all data source paths to the `dataSources` array in `config.json`.

---

## 🔐 Cloudflare Worker Setup

To secure your Gemini API key, deploy a Cloudflare Worker:

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create Worker

```bash
wrangler init zova-api
cd zova-api
```

### Step 3: Add Worker Code

Create or edit `src/index.js` with your API proxy logic (see [full setup guide](https://zova.voltajeba.com/setup-guide.html)).

### Step 4: Secure API Key

```bash
wrangler secret put GEMINI_API_KEY
# Enter your Gemini API key when prompted
```

### Step 5: Deploy

```bash
wrangler deploy
```

### Step 6: Update Config

Copy your Worker URL and add it to `chatbot/config.json`:

```json
{
  "workerUrl": "https://your-worker.your-subdomain.workers.dev"
}
```

---

## 🎨 Customization Examples

### Change Primary Color
Edit `config.json`:
```json
{
  "theme": {
    "colors": {
      "primaryColor": "#3b82f6",
      "primaryGlow": "rgba(59, 130, 246, 0.4)"
    }
  }
}
```

### Enable Dark Mode
```json
{
  "theme": {
    "mode": "dark"
  }
}
```

### Change Bot Personality
```json
{
  "llmConfig": {
    "systemPrompt": "You are a friendly and enthusiastic AI assistant...",
    "constraints": [
      "Be energetic and upbeat",
      "Use emojis occasionally"
    ]
  }
}
```

---

## 🚀 Features

- ✅ **Powered by Gemini 2.5 Flash** - Lightning-fast responses
- ✅ **Voice Input Support** - Speak to the bot naturally
- ✅ **Fully Customizable** - Colors, branding, personality
- ✅ **Privacy-Focused** - API keys hidden via Cloudflare Workers
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Easy Integration** - One script tag and you're done
- ✅ **Context-Aware** - Uses your business data to answer questions
- ✅ **Open Source** - Free to use and modify

---

## 📁 Project Structure

```
chatbot/
├── config.json          # Main configuration file
├── data/
│   └── data.json       # Your business data
├── icon/
│   └── icon.png        # Chatbot icon 
└── src/
    ├── chatbot.js      # Main chatbot script
    └── chatbot.css     # Chatbot styles
```

---

## 🌟 Live Examples

- **Demo Store:** [Aura Living](https://aura-living.voltajeba.com/)
- **Zova Homepage:** [zova.voltajeba.com](https://zova.voltajeba.com/)

---

## 📖 Documentation

For detailed setup instructions, visit:
- [Setup Guide](https://zova.voltajeba.com/setup-guide.html)
- [Configuration Reference](https://zova.voltajeba.com/#config)
- [Integration Guide](https://zova.voltajeba.com/#integration)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💡 Support

- **GitHub Issues:** [Report a bug](https://github.com/Volta-Jebaprashanth/zova-ai-chatbot/issues)
- **Website:** [zova.voltajeba.com](https://zova.voltajeba.com/)

---

## 🙏 Acknowledgments

- Powered by [Google Gemini](https://ai.google.dev/)
- Secured with [Cloudflare Workers](https://workers.cloudflare.com/)

---

<div align="center">
  
### Made with ❤️ by [Volta Jebaprashanth](https://github.com/Volta-Jebaprashanth)

⭐ **Star this repo if you find it useful!** ⭐

</div>
