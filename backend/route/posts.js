const express = require("express");
const router = express.Router();
const db = require("../db");

// ================= CREATE POST =================
router.post("/", (req, res) => {
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

// ================= READ ALL POSTS =================
router.get("/", (req, res) => {
  db.all("SELECT * FROM Posts", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ================= READ ONE POST =================
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM Posts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json(row);
  });
});

// ================= UPDATE POST =================
router.put("/:id", (req, res) => {
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

// ================= DELETE POST =================
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM Posts WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(400).json(err);
    res.json({ deleted: this.changes });
  });
});

module.exports = router;