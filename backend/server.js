const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// ===================== USERS CRUD =====================

// CREATE USER
app.post("/users", (req, res) => {
  const { username, email, password, accessibilityNeeds } = req.body;

  const sql = `
    INSERT INTO Users (username, email, password, accessibilityNeeds)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [username, email, password, accessibilityNeeds], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// READ ALL USERS
app.get("/users", (req, res) => {
  db.all("SELECT * FROM Users", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// READ SINGLE USER
app.get("/users/:id", (req, res) => {
  db.get("SELECT * FROM Users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json(row);
  });
});

// UPDATE USER
app.put("/users/:id", (req, res) => {
  const { username, email, accessibilityNeeds } = req.body;

  const sql = `
    UPDATE Users
    SET username = ?, email = ?, accessibilityNeeds = ?
    WHERE id = ?
  `;

  db.run(sql, [username, email, accessibilityNeeds, req.params.id], function (err) {
    if (err) return res.status(400).json(err);
    res.json({ updated: this.changes });
  });
});

// DELETE USER
app.delete("/users/:id", (req, res) => {
  db.run("DELETE FROM Users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(400).json(err);
    res.json({ deleted: this.changes });
  });
});

// ===================== POSTS CRUD =====================

// CREATE POST
app.post("/posts", (req, res) => {
  const { userId, content, imageUrl } = req.body;

  const sql = `
    INSERT INTO Posts (userId, content, imageUrl)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [userId, content, imageUrl], function (err) {
    if (err) return res.status(400).json(err);
    res.json({ id: this.lastID });
  });
});

// READ POSTS
app.get("/posts", (req, res) => {
  db.all("SELECT * FROM Posts", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// UPDATE POST
app.put("/posts/:id", (req, res) => {
  const { content, imageUrl } = req.body;

  const sql = `
    UPDATE Posts
    SET content = ?, imageUrl = ?
    WHERE id = ?
  `;

  db.run(sql, [content, imageUrl, req.params.id], function (err) {
    if (err) return res.status(400).json(err);
    res.json({ updated: this.changes });
  });
});

// DELETE POST
app.delete("/posts/:id", (req, res) => {
  db.run("DELETE FROM Posts WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(400).json(err);
    res.json({ deleted: this.changes });
  });
});

// ======================================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});