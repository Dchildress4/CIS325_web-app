const express = require("express");
const router = express.Router();
const db = require("../db");

// ================= CREATE USER =================
router.post("/", (req, res) => {
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

// ================= READ ALL USERS =================
router.get("/", (req, res) => {
  db.all("SELECT * FROM Users", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ================= READ ONE USER =================
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM Users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json(row);
  });
});

// ================= UPDATE USER =================
router.put("/:id", (req, res) => {
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

// ================= DELETE USER =================
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM Users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(400).json(err);
    res.json({ deleted: this.changes });
  });
});

module.exports = router;