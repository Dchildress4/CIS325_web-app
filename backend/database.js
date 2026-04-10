const sqlite3 = require("sqlite3").verbose();

const database = new sqlite3.Database("./database.db", (err) => {
    
    if (err) {
    console.error(err.message);
  }

    else {
    console.log("Connected to SQLite database");
  }
});

database.serialize(() => {
  database.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      accessibilityNeeds TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS Posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      content TEXT,
      imageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES Users(id)
    )
  `);
});

module.exports = database;