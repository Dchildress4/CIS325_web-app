import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./db.js";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const JWT_SECRET = "super_secret_key";

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

app.use("/users", (req, res, next) => {
  if (req.method === "POST") {
    return next();
  }
  
  authenticateToken(req, res, next);
});
app.use("/posts", authenticateToken);
app.use("/messages", authenticateToken);
app.use("/friendships", authenticateToken);
app.use("/groups", authenticateToken);
app.use("/group-members", authenticateToken);

//Creates a new user
app.post("/users", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    school_level,
    disability,
    bio,
    interests,
  } = req.body;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const formattedInterests = interests
      ? interests.split(",").map(i => i.trim().toLowerCase()).join(",")
      : null;

    const sql = `
      insert into users 
      (firstName, lastName, email, password, school_level, disability, bio, interests)
      values (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [firstName, lastName, email, hashedPassword, school_level, disability, bio, formattedInterests],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: err.message });
        }

        res.json({
          status: "success",
          data: {
            id: this.lastID,
            firstName,
            lastName,
            email,
            interests: formattedInterests,
          },
        });
      }
    );
  }
  
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Gets all users
app.get("/users", authenticateToken, (req, res) => {
  db.all("select * from users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

//Gets a single user
app.get('/users/:id', authenticateToken, (req, res) => {
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

//Gets current user
app.get("/me", authenticateToken, (req, res) => {
  db.get(
    "select id, firstName, lastName, email, bio from users where id = ?",
    [req.user.userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ user: row });
    }
  );
});

//Updates a user
app.put('/users/:id', authenticateToken, (req, res) => {
  const userIdFromToken = req.user.userId;
  const userIdFromParams = parseInt(req.params.id);

  if (userIdFromToken !== userIdFromParams) {
    return res.status(403).json({ error: "Cannot update other profiles" });
  }

  const { firstName, lastName, school_level, disability, bio, interests } = req.body;

  const formattedInterests = interests
    ? interests.split(',').map(i => i.trim().toLowerCase()).join(',')
    : null;

  const sql = `
    update users
    set firstName = ?, lastName = ?, school_level = ?, disability = ?, bio = ?, interests = ?, updated_at = current_timestamp
    where id = ?
  `;

  db.run(sql,
    [firstName, lastName, school_level, disability, bio, formattedInterests, userIdFromToken],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found or no changes made" });
      }

      res.json({ message: "User updated", changes: this.changes });
    }
  );
});

//Deletes a user
app.delete('/users/me', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.run(
    "delete from users where id = ?",
    [userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Account deleted", changes: this.changes });
    }
  );
});

//Login
app.post("/login", (req, res) => {
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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  });
});

//Password reset
app.post("/users/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email?.trim() || !newPassword?.trim()) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.get(
    "select id from users where email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      try {
        const hashed = await bcrypt.hash(newPassword, 10);

        db.run(
          "update users set password = ?, updated_at = current_timestamp where email = ?",
          [hashed, email],
          function (err2) {
            if (err2) {
              return res.status(500).json({ error: err2.message });
            }

            if (this.changes === 0) {
              return res.status(400).json({ error: "Password not updated" });
            }

            res.json({ message: "Password reset successful" });
          }
        );
      } catch (err3) {
        res.status(500).json({ error: err3.message });
      }
    }
  );
});

//Search users by interest
app.get('/users/search/:interest', authenticateToken, (req, res) => {
  const search = `%${req.params.interest.toLowerCase()}%`;

  db.all(
    `select id, firstName, lastName, interests
     from users
     where lower(interests) like ?`,
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
app.post("/posts", authenticateToken, (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  db.run(
    "insert into posts (user_id, content) values (?, ?)",
    [userId, content],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID, user_id: userId, content });
    }
  );
});

//Gets all posts
app.get("/posts", authenticateToken, (req, res) => {
  db.all(
    `select posts.*, users.firstName, users.lastName
     from posts
     join users on posts.user_id = users.id
     order by posts.created_at desc`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

//Updates a post
app.put('/posts/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.id;
  const { content } = req.body;

  db.get("select user_id from posts where id = ?", [postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    db.run(
      "update posts set content = ?, updated_at = current_timestamp where id = ?",
      [content, postId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ updated: this.changes });
      }
    );
  });
});

//Updates a user's password
app.put('/users/password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "Password required" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    const userId = req.user.userId;

    db.run(
      "update users set password = ? where id = ?",
      [hashed, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Password updated" });
      }
    );
  }
  
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Deletes a post
app.delete('/posts/:id', authenticateToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;

  db.get("select user_id from posts where id = ?", [postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ error: "Cannot delete other users' posts" });
    }

    db.run("delete from posts where id = ?", [postId], function (err2) {
      if (err2) {
        return res.status(500).json({ error: err2.message });
      }

      res.json({ deleted: this.changes });
    });
  });
});

//Sends a message
app.post("/messages", authenticateToken, (req, res) => {
  const sender_id = req.user.userId;
  const { receiver_id, message } = req.body;

  if (!receiver_id || !message) {
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

//Gets messages between two users
app.get("/messages/:user1/:user2", authenticateToken, (req, res) => {
  const user1 = Number(req.params.user1);
  const user2 = Number(req.params.user2);
  const currentUser = req.user.userId;

  if (![user1, user2].includes(currentUser)) {
    return res.status(403).json({ error: "Forbidden" });
  }

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
app.put('/messages/:id/read', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const messageId = req.params.id;

  db.get(
    "select * from messages where id = ?",
    [messageId],
    (err, msg) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!msg) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (msg.sender_id !== userId && msg.receiver_id !== userId) {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.run(
        "update messages set is_read = 1 where id = ?",
        [messageId],
        function (err2) {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          res.json({ updated: this.changes });
        }
      );
    }
  );
});

//Deletes a message
app.delete('/messages/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const messageId = req.params.id;

  db.get(
    "select * from messages where id = ?",
    [messageId],
    (err, msg) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!msg) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (msg.sender_id !== userId && msg.receiver_id !== userId) {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.run(
        "delete from messages where id = ?",
        [messageId],
        function (err2) {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          res.json({ deleted: this.changes });
        }
      );
    }
  );
});

//Sends a friend request
app.post('/friendships', authenticateToken, (req, res) => {
  const requester_id = req.user.userId;
  const { receiver_id } = req.body;

  if (!receiver_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (requester_id === receiver_id) {
    return res.status(400).json({ error: "Cannot friend yourself" });
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
app.get('/friendships', authenticateToken, (req, res) => {
  db.all(
  `select * from friendships
   where requester_id = ? or receiver_id = ?`,
  [req.user.userId, req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

//Updates a friendship status
app.put('/friendships/:id', authenticateToken, (req, res) => {
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
app.delete('/friendships/:id', authenticateToken, (req, res) => {
  const friendshipId = req.params.id;
  const userId = req.user.userId;

  db.get(
    "select requester_id, receiver_id from friendships where id = ?",
    [friendshipId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: "Friendship not found" });
      }

      if (row.requester_id !== userId && row.receiver_id !== userId) {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.run(
        "delete from friendships where id = ?",
        [friendshipId],
        function (err2) {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          res.json({ deleted: this.changes });
        }
      );
    }
  );
});

//Creates a group
app.post('/groups', authenticateToken, (req, res) => {
  const owner_id = req.user.userId;
  const { name, description, is_private } = req.body;

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
app.get('/groups', authenticateToken, (req, res) => {
  db.all(
    `select * from groups where is_private = 0`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

//Updates a group
app.put('/groups/:id', authenticateToken, (req, res) => {
  const { name, description, is_private } = req.body;
  const groupId = req.params.id;

  db.get("select owner_id from groups where id = ?", [groupId], (err, group) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.owner_id !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    db.run(
      "update groups set name = ?, description = ?, is_private = ? where id = ?",
      [name, description, is_private, groupId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ updated: this.changes });
      }
    );
  });
});

//Deletes a group
app.delete('/groups/:id', authenticateToken, (req, res) => {
  const groupId = req.params.id;

  db.get("select owner_id from groups where id = ?", [groupId], (err, group) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.owner_id !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    db.run("delete from groups where id = ?", [groupId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ deleted: this.changes });
    });
  });
});

//Join a group
app.post('/group-members', authenticateToken, (req, res) => {
  const user_id = req.user.userId;
  const { group_id } = req.body;

  db.get(
    "select * from groups where id = ?",
    [group_id],
    (err, group) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      if (group.is_private === 1) {
        return res.status(403).json({ error: "This group is private" });
      }

      db.get(
        "select * from group_members where group_id = ? and user_id = ?",
        [group_id, user_id],
        (err2, existing) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          if (existing) {
            return res.status(400).json({ error: "Already a member" });
          }

          db.run(
            "insert into group_members (group_id, user_id) values (?, ?)",
            [group_id, user_id],
            function (err3) {
              if (err3) {
                return res.status(500).json({ error: err3.message });
              }

              res.json({ id: this.lastID });
            }
          );
        }
      );
    }
  );
});

//Gets members of a group
app.get('/group-members/:group_id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const groupId = req.params.group_id;

  db.get(
    "select * from group_members where group_id = ? and user_id = ?",
    [groupId, userId],
    (err, membership) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!membership) {
        return res.status(403).json({ error: "Not a group member" });
      }

      db.all(
        "select * from group_members where group_id = ?",
        [groupId],
        (err2, rows) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          res.json(rows);
        }
      );
    }
  );
});

//Updates a member's role
app.put('/group-members/:id', authenticateToken, (req, res) => {
  const { role } = req.body;
  const memberId = req.params.id;

  //Gets group_id from member
  db.get(
    "select group_id from group_members where id = ?",
    [memberId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      //Checks group owner
      db.get(
        "select owner_id from groups where id = ?",
        [member.group_id],
        (err2, group) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          if (group.owner_id !== req.user.userId) {
            return res.status(403).json({ error: "Forbidden" });
          }

          //Updates role
          db.run(
            "update group_members set role = ? where id = ?",
            [role, memberId],
            function (err3) {
              if (err3) {
                return res.status(500).json({ error: err3.message });
              }

              res.json({ updated: this.changes });
            }
          );
        }
      );
    }
  );
});

//Removes a member
app.delete('/group-members/:id', authenticateToken, (req, res) => {
  const memberId = req.params.id;

  db.get(
    "select group_id from group_members where id = ?",
    [memberId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      db.get(
        "select owner_id from groups where id = ?",
        [member.group_id],
        (err2, group) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          if (group.owner_id !== req.user.userId) {
            return res.status(403).json({ error: "Forbidden" });
          }

          db.run(
            "delete from group_members where id = ?",
            [memberId],
            function (err3) {
              if (err3) {
                return res.status(500).json({ error: err3.message });
              }

              res.json({ deleted: this.changes });
            }
          );
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});