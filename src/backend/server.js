import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import db from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//Creates a new user
app.post('/users', async (req, res) => {
  const { firstName, lastName, email, password, school_level, disability, bio, interests } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const formattedInterests = interests
    ? interests.split(',').map(i => i.trim().toLowerCase()).join(',')
    : null;

    const sql = `
      insert into Users (firstName, lastName, email, password, school_level, disability, bio, interests)
      values (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [firstName, lastName, email, hashedPassword, school_level, disability, bio, formattedInterests],
      function (err) {
        if (err) {
          if (err.message.includes("unique")) {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: err.message });
        }

        res.json({
          status: "success",
          data: { id: this.lastID, firstName, lastName, email, interests }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Gets all users
app.get('/users', (req, res) => {
  db.all(
    `select id, firstName, lastName, email, school_level, disability, bio, interests, created_at from users`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

//Gets a single user
app.get('/users/:id', (req, res) => {
  db.get(
    `select id, firstName, lastName, email, school_level, disability, bio, interests, created_at from users where id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(row);
    }
  );
});

//Updates a user
app.put('/users/:id', (req, res) => {
  const { firstName, lastName, school_level, disability, bio, interests } = req.body;

    const formattedInterests = interests
    ? interests.split(',').map(i => i.trim().toLowerCase()).join(',')
    : null;

  const sql = `
    update users
    set firstName = ?, lastName = ?, school_level = ?, disability = ?, bio = ?, interests = ?, updated_at = current_timestamp
    where id = ?
  `;

  db.run(sql, [firstName, lastName, school_level, disability, bio, formattedInterests, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found or no changes made" });
    }

    res.json({ message: "User updated", changes: this.changes });
  });
});

//Deletes a user
app.delete('/users/:id', (req, res) => {
  db.run("delete from users where id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted", changes: this.changes });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get("select * from users where email = ?", [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", userId: user.id });
  });
});

app.get('/users/search/:interest', (req, res) => {
  const search = `%${req.params.interest.toLowerCase()}%`;

  db.all(
    `select id, firstName, lastName, interests from users where lower(interests) like ?`,
    [search],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

//Creates a post
app.post('/posts', (req, res) => {
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.run(
    "insert into posts (user_id, content) values (?, ?)",
    [user_id, content],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID, user_id, content });
    }
  );
});

//Gets all posts
app.get('/posts', (req, res) => {
  db.all("select * from posts", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

//Updates a post
app.put('/posts/:id', (req, res) => {
  const { content } = req.body;

  db.run(
    "update posts set content = ?, updated_at = current_timestamp where id = ?",
    [content, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Post not found or no changes made" });
      }

      res.json({ updated: this.changes });
    }
  );
});

//Deletes a post
app.delete('/posts/:id', (req, res) => {
  db.run("delete from posts where id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ deleted: this.changes });
  });
});

//Sends a message
app.post('/messages', (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.run(
    "insert into messages (sender_id, receiver_id, message) values (?, ?, ?)",
    [sender_id, receiver_id, message],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID });
    }
  );
});

//Gets messages between users
app.get('/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;

  db.all(
    `select * from messages 
     where (sender_id = ? and receiver_id = ?) 
     or (sender_id = ? and receiver_id = ?)
     order by created_at asc`,
    [user1, user2, user2, user1],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

//Marks a message as read
app.put('/messages/:id/read', (req, res) => {
  db.run(
    "update messages set is_read = 1 where id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.json({ updated: this.changes });
    }
  );
});

//Deletes a message
app.delete('/messages/:id', (req, res) => {
  db.run("delete from messages where id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ deleted: this.changes });
  });
});

//Sends a friend request
app.post('/friendships', (req, res) => {
  const { requester_id, receiver_id } = req.body;

  if (!requester_id || !receiver_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.run(
    "insert into friendships (requester_id, receiver_id) values (?, ?)",
    [requester_id, receiver_id],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Friend request already exists" });
        }

        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID });
    }
  );
});

//Gets all friendships
app.get('/friendships', (req, res) => {
  db.all("select * from friendships", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

//Updates a friendship status
app.put('/friendships/:id', (req, res) => {
  const { status } = req.body;

  db.run(
    "update friendships set status = ? where id = ?",
    [status, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Friendship not found or no changes made" });
      }
      
      res.json({ updated: this.changes });
    }
  );
});

//Deletes a friendship
app.delete('/friendships/:id', (req, res) => {
  db.run("delete from friendships where id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ deleted: this.changes });
  });
});

//Creates a group
app.post('/groups', (req, res) => {
  const { name, description, owner_id, is_private } = req.body;

  if (!name || !owner_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.run(
    "insert into groups (name, description, owner_id, is_private) values (?, ?, ?, ?)",
    [name, description, owner_id, is_private || 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const groupId = this.lastID;

      db.run(
        "insert into group_members (group_id, user_id, role) values (?, ?, 'admin')",
        [groupId, owner_id],
        (err2) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          res.json({ id: groupId });
        }
      );
    }
  );
});

//Gets all groups
app.get('/groups', (req, res) => {
  db.all("select * from groups", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

//Updates a group
app.put('/groups/:id', (req, res) => {
  const { name, description, is_private } = req.body;

  db.run(
    "update groups set name = ?, description = ?, is_private = ? where id = ?",
    [name, description, is_private, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Group not found or no changes made" });
      }
      
      res.json({ updated: this.changes });
    }
  );
});

//Deletes a group
app.delete('/groups/:id', (req, res) => {
  db.run("delete from groups where id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ deleted: this.changes });
  });
});

//Join a group
app.post('/group-members', (req, res) => {
  const { group_id, user_id } = req.body;

  db.run(
    "insert into group_members (group_id, user_id) values (?, ?)",
    [group_id, user_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ id: this.lastID });
    }
  );
});

//Gets members of a group
app.get('/group-members/:group_id', (req, res) => {
  db.all(
    "select * from group_members where group_id = ?",
    [req.params.group_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

//Updates a member's role
app.put('/group-members/:id', (req, res) => {
  const { role } = req.body;

  db.run(
    "update group_members set role = ? where id = ?",
    [role, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: "Member not found or no changes made" });
      }

      res.json({ updated: this.changes });
    }
  );
});

//Removes a member
app.delete('/group-members/:id', (req, res) => {
  db.run("delete from group_members where id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});