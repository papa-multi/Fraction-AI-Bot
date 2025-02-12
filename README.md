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

🔹 **Register at ************[Fraction AI](https://dapp.fractionai.xyz/?referral=75DFCD04)************.**\
🔹 **Create your agent.**\
🔹 **Ensure you have enough Sepolia ETH.**\
🔹 **Customize settings in ************`config.json`************.**

---

## 📂 Project Structure

```
Fraction-AI-Bot/
├── config.json      # Configuration file
├── data.txt         # Stores private keys (for test wallets only)
├── src/             # Source code of the bot
├── logs/            # Log files
├── package.json     # Node.js dependencies
└── README.md       # Documentation
```

---

## 🔧 System Requirements

Before installing **FractionAI-BOT**, make sure you have:

- ✅ **Node.js v18+**
- ✅ **npm or yarn**
- ✅ **Ethereum Wallet with Sepolia ETH**
- ✅ **Git Installed (For Linux/macOS)**

---

## 📥 Installation Guide

### 📌 Option 1: Clone the Repository (Recommended)

#### ✅ For Linux/macOS/Windows:

```bash
git clone https://github.com/rpchubs/Fraction-AI-Bot.git
cd Fraction-AI-Bot
```

### 📌 Option 2: Download as ZIP

1. Go to the repository: [FractionAI-BOT GitHub](https://github.com/rpchubs/Fraction-AI-Bot)
2. Click on the **`Code`** button → Select **`Download ZIP`**
3. Extract the ZIP file
4. Open a terminal or command prompt and navigate to the extracted folder:
   ```bash
   cd path/to/extracted-folder
   ```

---

### 📌 Step 3: Install Dependencies

#### ✅ For Linux/macOS/Windows:

```bash
npm install
```

---

## 🔧 Configuration Guide

### 📌 Step 4: Configure Wallets (Edit `data.txt`)

#### ✅ Linux/macOS:

```bash
nano data.txt
```

#### ✅ Windows:

1. Open the `data.txt` file using Notepad or any text editor.
2. Enter your **private keys** (one per line):

```txt
your_private_key
```

⚠️ **Only use test wallets! Never use your main wallet.**

---

### 📌 Step 5: Adjust Configuration (`config.json`)

#### ✅ Linux/macOS:

```bash
nano config.json
```

#### ✅ Windows:

1. Open the `config.json` file using Notepad or any text editor.

Modify the entry fee and other settings:

```json
{
  "fee": 0.01
}
```

💰 **Supported Entry Fees:** `0.01`, `0.001`, `0.0001` ETH.

---

## 🎯 How to Use

### 📌 Step 6: Create a Screen Session (For Linux/macOS Users)

```bash
screen -S fractionai-bot
```

### ▶️ Start the Bot

#### ✅ For Linux/macOS:

```bash
npm start
```

#### ✅ For Windows (Command Prompt/PowerShell):

```powershell
npm start
```

---

## 🎮 Bot Controls

🛑 Press **`Q`** → Quit the bot.\
🔄 Press **`R`** → Refresh the dashboard.\
🧹 Press **`C`** → Clear the logs.

---

## ⚠️ Important Warnings

⚠️ **Use at your own risk.**\
🔑 **Only use test wallets – NEVER use your main wallet.**\
📖 **Make sure you fully understand the bot’s functionality.**

---

## 🔗 Useful Resources

📂 **GitHub Repository**: [RPC-Foundation](https://github.com/RPC-Foundation)\
💬 **Community Support**: [Telegram](https://t.me/RPC_Hubs)\
📜 **License**: MIT License

---

💡 **Need Help?** Join our Telegram group for real-time support and discussions! 🚀

