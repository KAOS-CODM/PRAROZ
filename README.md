# PRAROZ

## by kaos-codm(aka isaiahwebdev)
## sponsored by KAOS KONSEPT DIGITALS

## 🍽️ Recipe Hub

A simple and elegant recipe website where users can explore, submit, and manage delicious recipes. Designed with a clean frontend, JSON-based backend to feed frontend contents, supabase database functions integration, and admin functionality for approving submissions.

---

## 🚀 Features

- 🧑‍🍳 Browse curated and user-submitted recipes  
- 📤 Submit your own recipes via an intuitive form  
- 🔍 Instant search bar with live filtering  
- 🔐 Admin panel for approving or rejecting submissions  
- 💬 Comment system linked to individual recipes  (not implemented yet)
- ☁️ Cloud image upload support (Cloudinary)  
- 📦 Supabase data storage (recipes, submissions, users, comments)

---

## 📁 Project Structure

- **/functions/data**  
  Contains contents.json, comments.json that feeds frontend via corresponding API endpoints

- **/functions**
  Contains:
  Node.js backend with API endpoints
  Data folder that holds JSON-based files
  .env.example that handles API based keys
  A schema.sql that sets up database tables compatible with web structure

- **/public**  
  Frontend files (HTML, CSS, JS)
  Images folder that serves icon, logos etc

- **gitignore**  
  Ignores uneccessary documents upload

---

## 🧰 Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js (Express)  
- **Storage:** Supabase Database storage 
- **Hosting:** Render  
- **Image Uploads:** Cloudinary (unsigned uploads)  
- **Mailing List Integration:** Mailchimp popup API  
- **Search System:** Reusable search component in pure JS

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/KAOS-CODM/PRAROZ.git
cd PRAROZ

