# 🪹 CodeNest – A Code-Sharing Platform

**CodeNest** is a web app that lets users securely save, manage, and share their code snippets across devices. Built with **FastAPI** and **React**, it provides user authentication, encryption, and AI-assisted functionality.

---

## 🚀 Features

- 🔐 User authentication with **JWT**
- 🔒 Encrypted user data for enhanced privacy
- 📦 Create, delete, and view code snippets with title, language, and content
- 🧠 Persistent user sessions with secure token handling
- 🧹 Filter and search snippets
- 🤖 AI integration for code explanation using Google Generative AI
- ⚙️ Modern backend with **FastAPI + PostgreSQL**
- ⚛️ Lightweight frontend with **React + Vite + React Router**

---

## 🛠️ Tech Stack

### Frontend
- **React**
- **Vite**
- **React Router**

### Backend
- **FastAPI**
- **uvicorn**
- **psycopg2**
- **pydantic**
- **pyjwt**
- **cryptography**
- **google-generativeai**


---

## 📁 Folder Structure

```
CodeNest/
├── backend/
│   ├── main.py
│   ├── login.py
│   ├── auth/ # Contains database, login systems and etc
│   ├── snippets.py
│   ├── database.py
│   └── ai.py               # (If you're using Google GenAI)
│
├── frontend/
    ├── public/
    └── src/
        ├── components/     # Reusable UI elements
        ├── pages/          # Page-level React components
        ├── App.js
        └── main.jsx



```

### How to run

WIP
