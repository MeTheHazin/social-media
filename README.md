
# social-media

# 🌐 Minimalist Social Media Web App

A clean, full-stack social media platform built with **Node.js**, **Express**, **PostgreSQL**, **EJS**, and **Passport.js (local strategy)**. Designed with simplicity in mind, this app brings together key features of classic social platforms. **authentication**, **posting**, **likes**, **follows**, and **search**. while maintaining clarity in architecture and UI.

Whether you're browsing user profiles, liking posts, or connecting with others, everything feels intuitive and purposefully minimal.

---

## Features

-  Secure **sign up / log in** system with Passport.js local strategy
-  Create and share text-based posts
- ❤ Like posts by other users
-  Follow and unfollow users
-  Search for users by name
-  Grid-based user feed and profile views
-  Modular architecture with clean middleware and SQL queries

---

##  Tech Stack

| Category       | Tools Used                          |
|----------------|-------------------------------------|
| Backend        | Node.js, Express.js, Passport.js    |
| Database       | PostgreSQL (vanilla SQL schema)     |
| Frontend       | EJS templating, CSS grid layouts    |
| Auth & Security| Passport (local), session & cookie |
| Structure      | MVC-style with modular routing      |

---


---

## 🛠️ Getting Started

Want to test it locally or build on it? Here's how to clone and run:

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/socialMedia.git
cd socialMedia

npm install
```

3. Set up PostgreSQL
Create a local database using psql and name it socialapp

Run the schema script:

```bash
psql -d YOUR_DB_NAME -f models/schema.sql
```

Create a .env file and add your database credentials:

CONNECTION_STRING="postgresql://<you-username>:<you=password>@localhost:5432/socialapp"
SESSION_SECRET=some_secret_string
  
good. now you can use it in you local machine. have a amazing day.
