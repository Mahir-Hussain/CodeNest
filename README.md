# 🪹 CodeNest – A Code-Sharing Platform

**CodeNest** is a web app that lets users securely save, manage, and share their code snippets across devices. Built with **FastAPI** and **React**, it provides user authentication, encryption, and AI-assisted functionality.

<img width="1896" height="867" alt="image" src="https://github.com/user-attachments/assets/efc235c0-4a22-4593-af7f-c4c565b22da8" />
<img width="1902" height="867" alt="image" src="https://github.com/user-attachments/assets/4231551a-6f01-4b99-abd0-5cee23c4d681" />


## 🚀 Features

- 🔐 User authentication with **JWT**
- 🔒 Encrypted user data for enhanced privacy
- 📦 Create, delete, and view code snippets with title, language, and content
- 🧠 Persistent user sessions with secure token handling
- 🧹 Filter and search snippets
- 🤖 AI integration for code explanation using Google Generative AI
- ⚙️ Modern backend with **FastAPI + PostgreSQL**
- ⚛️ Lightweight frontend with **React + Vite + React Router**



## 🛠️ Tech Stack

#### 🧩 Frontend
- **React** – UI framework  
- **Vite** – Build tool for fast development  
- **React Router** – Client-side routing

### ⚙️ Backend
- **FastAPI** – High-performance Python web framework  
- **PostgreSQL** – Relational database  
- **Uvicorn** – ASGI server for running FastAPI

#### 🔐 Auth & Security
- **pyJWT** – Token-based user authentication  
- **Fernet (cryptography)** – User data encryption

#### 🤖 AI Integration
- **Google Generative AI** – Smart title and tag generation for code snippets


## 📁 Folder Structure

```
Main files for CodeNest
CodeNest/
├── backend/
│   ├── main.py # Only used for testing and can run backend/frontend together
│   ├── login.py
│   ├── auth/ # Contains database, login systems and etc
│   ├── snippets.py
│   ├── routes.py
│   ├── database.py
│   └── code_data_ai.py
│
├── frontend/
    ├── public/ # Favicon location
    └── src/
        ├── components/     # Reusable parts of the webpage, contains more css and services relating to frontend funcitonality
        ├── app.css
        └── App.jsx # Where frontend links are defined



```

## ▶️ How to Run the Project Locally

### 💾 Database

```python
# Edit the host, port to match your database setup. You can either make a supabase account like done so below OR run a database locally.
class Database:
    def __init__(self, host="aws-0-eu-west-2.pooler.supabase.com", port="5432"):
        """
        Sets up database connection parameters and calls the connect() method.
        """
        self.db_name = "postgres"
        self.db_user = "postgres.rgxatektsqhjpjgmfncu"
        self.db_password = os.getenv("database_password")
        self.db_host = host
        self.db_port = port
```

### ⚙️ Backend (FastAPI)

```bash
# 1. Clone the repo using: git clone https://github.com/Mahir-Hussain/CodeNest.git
# 1. (Optional) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create a .env file in the backend folder and add your keys:
database_password = ""
ai_key = "" # Get the key from https://ai.google.dev/gemini-api/docs
jwt_secret = "" # Can be whatever you want
fernet_key = b"" # Create this key using fernet documentation  https://cryptography.io/en/latest/fernet/#using-the-key


# 4. Run the FastAPI server
uvicorn main:app --reload
# Server will run at http://localhost:8000
OR
💡You can also run `main.py` (instead of uvicorn) to launch both the FastAPI server and the React frontend using subprocess — helpful for development or demo purposes.
```
### Frontend (vite)
```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Start the Vite dev server
npm run dev
# App will run at http://localhost:3000
```

<!-- Centered section at the bottom -->
<p align="center">
  Made by <a href="https://github.com/Mahir-Hussain">Mahir-Hussain</a> and <a href="https://github.com/samyamp">Samyamp</a>  
  <br>
</p>
