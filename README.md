# VeduBuild Server

VeduBuild Server is a Node.js backend project built using Express and MongoDB. It provides a complete RESTful API with full CRUD operations, secure authentication & authorization, and data handling features including Excel-based import/export.

---

## 🚀 Features

- ✅ RESTful API with Express.js  
- 🔐 JWT-based Authentication & Authorization  
- 📥 Bulk Student Data Upload using Excel  
- 📤 Export Student Data to Excel File  
- 📚 Full CRUD Operations (Create, Read, Update, Delete)  
- 🌐 Connected with MongoDB database  
- 🧩 Clean and modular code structure  

---

## 📦 Tech Stack

- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT (jsonwebtoken)  
- Multer (for file uploads)  
- ExcelJS (for Excel handling)  
- dotenv, morgan, bcryptjs, etc.  

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/vedubuild-server.git
cd vedubuild-server
```

---

## 📦 Dependencies Used

- express  
- mongoose  
- cors  
- dotenv  
- bcryptjs  
- cookie-parser  
- jsonwebtoken  
- exceljs  
- morgan  
- nodemon (dev)

---

### 2. Install dependencies

```bash
npm install
```

### 3. Setup `.env` file

Create a `.env` file in the root directory and add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Start the server

```bash
npm start
```

For development with live reload:

```bash
nodemon index.js
```

---

## 📁 Project Structure

```
vedubuild-server/
│
├── controllers/       # All controller logic
├── models/            # Mongoose data models
├── routes/            # API routes
├── uploads/           # Uploaded Excel files
├── .env               # Environment variables
├── index.js           # Server entry point
└── README.md
```



## 👨‍💻 Author

Developed by **Shubham Narayan**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
