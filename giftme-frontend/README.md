# 🎁 GiftME — A Mini Social Network for GIFs

**GiftME** is a complete full-stack GIF-sharing social app built with **React**, **Node.js**, and **MongoDB**. It allows users to sign up, upload or share GIFs, like and comment, follow others, receive notifications, and explore trending or recent GIFs — all wrapped in a modern dark/light responsive UI.

---

## 🚀 Features

### ✅ Core Functionality
- 🔐 JWT-based authentication with avatar upload (GIF support)
- 🧑 User profiles with tabbed views: uploaded, liked, and commented GIFs
- 📤 GIF upload via file or Giphy link
- ❤️ Like & comment system (including top comment)
- 🔔 Real-time-like notification system
- 📬 Explore section with filters (recent/popular) or Giphy search
- 🧵 Social features: follow/unfollow users
- 🖼️ Dynamic avatars, feed, and UI built entirely around GIFs
- 🌓 Dark mode & light mode with local preference
- ⚙️ Profile settings & account deletion
- 🧪 Seed script with admin user and dummy data

---

## 🧰 Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React, TypeScript, TailwindCSS, Vite |
| Backend   | Node.js, Express, MongoDB     |
| Auth      | JWT (JSON Web Token)          |
| File Upload | Multer for GIF and avatar uploads |
| Giphy API | Integration for search and fallback avatars |
| Validation | Zod (frontend), schema validation needed in backend |
| Notifications | MongoDB + API routes + visual counters |
| State Mgmt | React Context API            |

---

## 🖥️ Project Structure

📦 giftme/ ├─ backend/ │ ├─ models/ │ ├─ controllers/ │ ├─ routes/ │ ├─ middleware/ │ ├─ config/ │ ├─ utils/ │ └─ server.js └─ frontend/ ├─ src/ │ ├─ pages/ │ ├─ components/ │ ├─ contexts/ │ ├─ hooks/ │ └─ App.tsx

yaml
Copiar

---

## 🔧 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/giftme.git
cd giftme
2. Setup Backend
bash
Copiar
cd backend
npm install
Create a .env file with:

env
Copiar
PORT=5000
MONGO_URI=mongodb://localhost:27017/giftme
JWT_SECRET=your_jwt_secret
Then run:

bash
Copiar
npm run dev
🧪 The database will automatically seed dummy users and an admin account (ado@example.com / Ador#123) on first run.

3. Setup Frontend
bash
Copiar
cd ../frontend
npm install
npm run dev
The app will run on http://localhost:5173

🧪 Example Credentials

Username	Password	Role
ado	ado12345	admin           email ado@example.com
testuser1	password123	user    email test1@example.com
