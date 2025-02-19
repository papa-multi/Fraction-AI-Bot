# 🎮 Fraction AI BOT - Automate Your Battles in Fraction AI

*A fully automated bot for seamless battles in ********Fraction AI********.*

---

## 🚀 Key Features

✨ **Auto Match Making** – Join battles automatically, no manual effort needed.\
💰 **Multiple Wallet Support** – Manage multiple Ethereum wallets effortlessly.\
📊 **User-Friendly Dashboard** – A clean, intuitive, and interactive UI.\
⚙️ **Easy Setup & Configuration** – Minimal setup with flexible settings.

---

## ✅ Pre-Run Checklist

🔹 **Register at ************[Fraction AI](https://dapp.fractionai.xyz?referral=C9590E72)************.**\
🔹 **Create your agent.**\
🔹 **Ensure you have enough Sepolia ETH.**\
🔹 **Customize settings in ************`config.json`************.**

---


---

## 🔧 System Requirements

Before installing **FractionAI-BOT**, make sure you have:

- ✅ **Node.js v18+**
- ✅ **npm or yarn**
- ✅ **Ethereum Wallet with Sepolia ETH**
- ✅ **Git Installed (For Linux/macOS)**

---

## 📥 Installation Guide

### 🐧 Linux/macOS Users

#### 📌 Step 1: Clone the Repository

```bash
git clone https://github.com/rpchubs/Fraction-AI-Bot.git
cd Fraction-AI-Bot
```

#### 📌 Step 2: Install Dependencies

```bash
npm install
```

#### 📌 Step 3: Configure Wallets (Edit `data.txt`)

```bash
nano data.txt
```

Enter your **private keys** (one per line):

```txt
your_private_key
```

⚠️ **Only use test wallets! Never use your main wallet.**

#### 📌 Step 4: Adjust Configuration (`config.json`)

```bash
nano config.json
```

Modify settings as needed:

```json
{
  "fee": 0.01,
  "useProxy": false
}
```

💰 **Supported Entry Fees:** `0.01`, `0.001`, `0.0001` ETH.

🌐 **Proxy Configuration:**
- If you want to use a proxy, set `"useProxy": true` in `config.json`.
- If you do not want to use a proxy, keep `"useProxy": false`.

#### 📌 Step 5: Create a Screen Session (For Continuous Running)

```bash
screen -S fractionai-bot
```

#### 📌 Step 6: Start the Bot

```bash
npm start
```





## ⚠️ Important Warnings

⚠️ **Use at your own risk.**\
🔑 **Only use test wallets – NEVER use your main wallet.**\
📖 **Make sure you fully understand the bot’s functionality.**

---




# check point 

```
node fetch-fractal.js
```
---

💡 **Need Help?** Join our Telegram group for real-time support and discussions! 🚀

