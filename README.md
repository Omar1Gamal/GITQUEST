<div align="center">
  <img src="public/favicon.svg" alt="GitQuest Logo" width="120" />
  <h1>🚀 GitQuest</h1>
  <p><strong>Master Git visually with an interactive, in-browser learning platform.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Zustand-State-black?style=for-the-badge" alt="Zustand" />
  </p>
</div>

---

## 🌟 Overview

**GitQuest** is a fully gamified, interactive platform designed to teach version control from the ground up. Instead of reading boring tutorials, users type real Git commands into a fully simulated terminal and instantly see their repository evolve via a real-time, interactive node graph.

Whether you're a beginner learning `git init` or an advanced user practicing `git rebase` and dealing with merge conflicts, GitQuest provides a safe, sandboxed environment to break things and learn by doing.

---

## ✨ Key Features

- 🖥️ **Interactive Terminal Simulation:** Powered by `xterm.js`, providing a native feel with command history, autocomplete, and color formatting.
- 🌳 **Real-Time Visual Graph:** See branches diverge, commits stack, and merges happen instantly as you type commands.
- 🔍 **Interactive Diff Viewer:** Click on any commit in the graph to see exactly which files changed with a built-in line-by-line diff tool.
- 🛡️ **Secure Authentication:** Seamless Google Sign-In and Email/Password auth powered by Firebase.
- 💾 **Isolated Cloud State:** Your progress, achievements, and virtual repository state are automatically saved and isolated to your specific user profile.
- 🎓 **Achievement System & Certificates:** Earn XP, level up, and generate a downloadable, unique PDF certificate of completion.
- 🏖️ **Sandbox Mode:** A free-play environment to test complex Git workflows without any lesson restrictions.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + Vite
- **State Management:** Zustand (with persist middleware for local storage)
- **Authentication:** Firebase Auth
- **Terminal Emulator:** xterm.js
- **PDF Generation:** html2canvas + jsPDF
- **Styling:** Pure, semantic CSS with modern UI/UX design (Glassmorphism, Dark Mode)
- **Deployment Ready:** Strict CSP headers and XSS sanitization for production security.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/omargamaal18-create/GITQUEST.git
   cd GITQUEST
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on the provided `.env.example` file and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📚 How It Works (The Git Engine)

At the core of GitQuest is a custom-built, client-side **Git Engine** (`src/engine/GitEngine.js`). It simulates a local filesystem and core Git commands completely in the browser without needing a backend server!

It supports advanced operations like:
- `commit`, `branch`, `checkout`, `switch`
- `merge` (including Fast-Forward and 3-way simulated conflicts)
- `rebase` and interactive simulated rebasing
- `cherry-pick`, `stash`, `reset`, `revert`
- `remote`, `fetch`, `pull`, `push`

---

## 🔒 Security Posture
- **XSS Prevention:** Terminal output (`echo`) is strictly sanitized before rendering.
- **Data Privacy:** Passwords are never stored locally. User progress is namespaced securely via Firebase UID `localStorage`.
- **Content Security Policy:** Strict CSP implementation prevents malicious external scripts from executing in production.

---

## 📜 License
This project is licensed under the MIT License. Feel free to fork it, use it for educational purposes, and build upon it!

<div align="center">
  <p>Built with ❤️ by Omar Gamal</p>
</div>
