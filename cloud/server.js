require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ================= DATABASE =================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.log("❌ DB ERROR:", err);
  } else {
    console.log("✅ DB CONNECTED");
  }
});

// ================= EMAIL =================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================= ROUTES =================

// TEST
app.get("/", (req, res) => {
  res.send("Backend OK 🚀");
});

// GET ALL
app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, result) => {
    if (err) return res.status(500).send("DB error");
    res.json(result);
  });
});

// ADD
app.post("/add-customer", (req, res) => {
  const { name, email, phone, address } = req.body;

  const sql = "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, phone, address], (err) => {
    if (err) return res.status(500).send("Insert error");
    res.send("Added");
  });
});

// DELETE
app.delete("/delete-customer/:id", (req, res) => {
  db.query("DELETE FROM customers WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Delete error");
    res.send("Deleted");
  });
});

// UPDATE
app.put("/update-customer/:id", (req, res) => {
  const { name, email, phone, address } = req.body;

  db.query(
    "UPDATE customers SET name=?, email=?, phone=?, address=? WHERE id=?",
    [name, email, phone, address, req.params.id],
    (err) => {
      if (err) return res.status(500).send("Update error");
      res.send("Updated");
    }
  );
});

// ================= SEND EMAIL =================
app.post("/send-email", async (req, res) => {
  const { emails } = req.body;

  try {
    for (let email of emails) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "CRM SaaS Notification",
        text: "Hello, this is email from your CRM SaaS 🚀"
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Email error");
  }
});

// ================= START =================
app.listen(80, () => {
  console.log("🚀 Server running on port 80");
});